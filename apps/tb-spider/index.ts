import { prompt } from 'prompts'
import puppeteer from 'puppeteer'
import fse from 'fs-extra'
import path from 'path'

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 将搜索查询转换为文件名友好的格式
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // 替换空格为连字符
    .replace(/[^\w\-]+/g, '')       // 移除特殊字符
    .replace(/\-\-+/g, '-')         // 替换多个连字符为单个
    .replace(/^-+/, '')             // 移除开头的连字符
    .replace(/-+$/, '')             // 移除结尾的连字符
}

// 下载图片并保存到本地
async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    // 确保目录存在
    const dir = path.dirname(filepath)
    await fse.ensureDir(dir)

    // 下载图片
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    await fse.writeFile(filepath, Buffer.from(buffer))
    console.log(`图片已保存: ${filepath}`)
  } catch (error) {
    console.error(`下载图片失败 ${url}:`, error)
    throw error
  }
}

async function main() {
  const { searchQuery } = await prompt({
    type: 'text',
    name: 'searchQuery',
    message: '请输入搜索关键词',
  })

  console.log(`开始搜索: ${searchQuery}`)

  // 创建目录结构
  const searchQuerySlug = slugify(searchQuery)
  const baseDir = path.join('.', 'content', searchQuerySlug)
  const productsDir = path.join(baseDir, 'products')
  const assetsDir = path.join(baseDir, 'assets')

  // 确保目录存在
  await fse.ensureDir(productsDir)
  await fse.ensureDir(assetsDir)

  console.log(`数据将保存到: ${baseDir}`)

  // 构建搜索URL
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&language=en-US`

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: true, // 设为false可以查看浏览器操作
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ]
  })

  try {
    // 打开新页面
    const page = await browser.newPage()

    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36')

    // 设置视口大小
    await page.setViewport({ width: 1366, height: 768 })

    // 访问搜索页面
    console.log('正在加载页面...')
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    // 随机延迟，模拟人类行为
    await delay(Math.random() * 2000 + 1000)

    // 检查页面标题
    const title = await page.title()
    console.log(`页面标题: ${title}`)

    // 检查页面URL
    const url = page.url()
    console.log(`当前URL: ${url}`)

    // 检查是否出现了验证码页面
    const captcha = await page.$('#captchacharacters')
    if (captcha) {
      console.log('检测到验证码，请手动输入验证码后按回车继续...')
      await page.evaluate(() => alert('请手动输入验证码后按回车继续'))
      await prompt({
        type: 'text',
        name: 'continue',
        message: '按回车继续...'
      })
    }

    // 等待搜索结果加载
    console.log('等待页面加载完成...')
    try {
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 15000 })
    } catch (error) {
      console.log('页面加载超时，尝试滚动页面...')
      // 尝试滚动页面以触发内容加载
      await page.evaluate(() => window.scrollBy(0, window.innerHeight))
      await delay(3000)
    }

    // 再次检查是否有搜索结果
    const hasResults = await page.$('[data-component-type="s-search-result"]')
    if (!hasResults) {
      console.log('未找到搜索结果元素')

      // 获取页面内容用于调试
      const content = await page.content()
      console.log(`页面内容长度: ${content.length}`)

      // 检查是否有错误信息
      const errorElements = await page.$$('.a-alert-content')
      if (errorElements.length > 0) {
        for (const element of errorElements) {
          const text = await page.evaluate(el => el.textContent, element)
          console.log(`错误信息: ${text}`)
        }
      }
    }

    // 提取商品信息
    console.log('提取商品信息...')
    const products = await page.evaluate(() => {
      // 尝试不同的选择器
      const selectors = [
        '[data-component-type="s-search-result"]',
        '.s-result-item',
        '[data-asin]'
      ]

      let elements: Element[] = []
      for (const selector of selectors) {
        const found = Array.from(document.querySelectorAll(selector))
        console.log(`使用选择器 "${selector}" 找到 ${found.length} 个元素`)
        if (found.length > 0) {
          elements = found
          break
        }
      }

      if (elements.length === 0) {
        // 如果没有找到元素，尝试获取所有可能包含商品的元素
        elements = Array.from(document.querySelectorAll('.s-main-slot .s-result-item'))
        console.log(`备用选择器找到 ${elements.length} 个元素`)
      }

      console.log(`总共找到 ${elements.length} 个商品元素`)

      return elements.map((element, index) => {
        try {
          // 标题 - 尝试多种选择器
          let titleElement = element.querySelector('h2 a span')
          if (!titleElement) {
            titleElement = element.querySelector('h2 a')
          }
          if (!titleElement) {
            titleElement = element.querySelector('.a-text-normal')
          }

          // 价格 - 处理不同价格元素
          let price = ''
          let priceElement = element.querySelector('.a-price-whole')
          let priceFractionElement = element.querySelector('.a-price-fraction')

          // 尝试其他价格选择器
          if (!priceElement) {
            priceElement = element.querySelector('.a-offscreen')
          }

          if (priceElement) {
            price = priceElement.textContent?.trim() || ''
            if (priceFractionElement) {
              price += priceFractionElement.textContent?.trim() || ''
            }
            // 如果价格不以$开头，则添加$
            if (!price.startsWith('$') && price) {
              price = '$' + price
            }
          }

          // 图片 - 尝试多种选择器
          let imageElement = element.querySelector('.s-image')
          if (!imageElement) {
            imageElement = element.querySelector('img')
          }

          // 评分 - 尝试多种选择器
          let ratingElement = element.querySelector('.a-icon-alt')
          if (!ratingElement) {
            ratingElement = element.querySelector('[aria-label*="stars"]')
          }

          // 商品链接 - 尝试多种选择器
          let linkElement = titleElement?.closest('a')
          if (!linkElement) {
            linkElement = element.querySelector('a')
          }

          // 描述 - 尝试多种选择器
          let descriptionElement = element.querySelector('.a-size-base.a-color-secondary')
          if (!descriptionElement) {
            descriptionElement = element.querySelector('.a-size-small')
          }

          const product = {
            title: titleElement ? titleElement.textContent?.trim() : '',
            price: parseFloat(price.replace('$', '')),
            image: imageElement ? imageElement.getAttribute('src') : '',
            rating: ratingElement ? parseFloat(ratingElement.textContent?.trim() || '5') || 5 : 5,
            description: descriptionElement ? descriptionElement.textContent?.trim() : '',
            url: linkElement?.getAttribute('href') ?
              `https://www.amazon.com${linkElement.getAttribute('href')}` : ''
          }

          console.log(`商品 ${index + 1}: ${product.title || '无标题'}`)
          return product
        } catch (error) {
          console.error(`处理商品 ${index + 1} 时出错:`, error)
          return null
        }
      }).filter(product => product && (product.title || product.price)) // 过滤掉没有标题和价格的商品
    })

    console.log(`提取到 ${products.length} 个商品`)

    // 下载图片并更新产品数据
    if (products.length > 0) {
      console.log('开始下载商品图片...')
      const updatedProducts = []

      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        const updatedProduct = { ...product }

        // 如果有图片URL，则下载图片
        if (product?.image && product.image.startsWith('http')) {
          try {
            // 生成图片文件名
            const imageUrl = new URL(product.image)
            const imageExt = path.extname(imageUrl.pathname) || '.jpg'
            const imageName = `product-${i + 1}${imageExt}`
            const imagePath = path.join(assetsDir, imageName)

            // 下载图片
            await downloadImage(product.image, imagePath)
            // 更新产品数据中的图片路径为相对路径
            updatedProduct.image = path.join('..', 'assets', imageName)
            const jsonPath = path.join(productsDir, `product-${i + 1}.json`)
            await fse.writeJson(jsonPath, updatedProduct, { spaces: 2 })
            console.log(`已保存商品 ${i + 1} 到 ${jsonPath}`)
          } catch (error) {
            console.error(`处理商品 ${i + 1} 的图片时出错:`, error)
            // 如果下载失败，保留原始URL
          }
        }

        updatedProducts.push(updatedProduct)
      }

      // 保存数据到JSON文件
      console.log(`爬取完成，共获取到 ${updatedProducts.length} 个商品，数据已保存到 ${productsDir}`)
    } else {
      console.log('爬取完成，但未获取到任何商品数据')
      // 创建一个空的JSON文件
      const jsonPath = path.join(productsDir, 'products.json')
      await fse.writeJson(jsonPath, [], { spaces: 2 })
      console.log(`已创建空的 ${jsonPath} 文件`)
    }
  } catch (error) {
    console.error('请求失败:', error)
  } finally {
    // 关闭浏览器
    await browser.close()
  }
}

main()