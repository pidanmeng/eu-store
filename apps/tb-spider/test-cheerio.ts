import * as cheerio from 'cheerio'

// 测试HTML内容
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <div class="product" data-id="1">
        <h2>Product 1</h2>
        <span class="price">$10.99</span>
    </div>
    <div class="product" data-id="2">
        <h2>Product 2</h2>
        <span class="price">$20.50</span>
    </div>
</body>
</html>
`;

// 使用cheerio解析HTML
const $ = cheerio.load(html);

// 提取产品信息
const products = [];
$('.product').each((index, element) => {
    const title = $(element).find('h2').text();
    const price = $(element).find('.price').text();
    const id = $(element).attr('data-id');
    
    products.push({
        id,
        title,
        price
    });
});

console.log('提取到的产品:', products);