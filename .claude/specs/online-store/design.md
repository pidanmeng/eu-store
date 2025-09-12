# 在线服装商城 - 设计文档

## 1. 概述

本设计文档描述了基于 Astro 框架的在线服装商城系统架构。该系统使用 Astro Content Collections 来管理商品数据，并通过 NexiPay 实现支付功能。所有功能均在现有博客网站基础上构建。

## 2. 系统架构

### 2.1 文件结构
```
src/
├── content/
│   └── products/
│       ├── t-shirt.json
│       ├── jeans.json
│       └── jacket.json
├── content.config.ts
├── layouts/
│   └── ProductLayout.astro
├── pages/
│   ├── index.astro           # 商品列表页
│   ├── products/
│   │   ├── [slug].astro      # 商品详情页
│   │   └── cart.astro        # 购物车页
│   └── checkout/
│       └── index.astro       # 结算页
├── components/
│   ├── ProductCard.astro
│   ├── CartItem.astro
│   └── ProductGallery.astro
└── lib/
    └── cart-utils.ts         # 购物车工具函数
```

### 2.2 数据模型

#### 商品集合 (products)
商品数据使用 JSON 格式存储，具有以下字段：
- `id`: 商品唯一标识符 (string)
- `title`: 商品标题 (string)
- `description`: 商品描述 (string)
- `price`: 商品价格 (number)
- `category`: 商品类别 (string)
- `sizes`: 可选尺寸 (array of strings)
- `colors`: 可选颜色 (array of strings)
- `images`: 商品图片数组 (array of strings)
- `inStock`: 是否有库存 (boolean)
- `tags`: 商品标签 (array of strings)

### 2.3 内容收集配置

`src/content.config.ts` 将配置如下内容收集：
- `products`：用于存储服装商品数据
- 使用 `glob()` 加载器处理 JSON 文件
- 使用 Zod Schema 进行类型验证

### 2.4 组件设计

#### 主要组件
1. `ProductCard.astro`：商品卡片组件，用于商品列表页
2. `ProductGallery.astro`：商品图片展示组件
3. `CartItem.astro`：购物车项目组件
4. `Header.astro`：更新为包含购物车图标

## 3. 功能模块

### 3.1 商品管理模块
- **商品列表页** (`index.astro`)：展示所有商品，支持分类筛选和搜索
- **商品详情页** (`[slug].astro`)：展示单个商品详细信息
- **商品搜索**：支持按关键词搜索商品

### 3.2 购物车模块
- **购物车页** (`cart.astro`)：显示购物车中的所有商品
- **购物车操作**：添加、删除、修改商品数量
- **购物车状态管理**：使用本地存储维护购物车状态

### 3.3 结算模块
- **结算页** (`checkout/index.astro`)：收集收货信息
- **支付集成**：集成 NexiPay 支付模块

### 3.4 UI 组件
- **头部导航**：包含购物车图标
- **商品卡片**：展示商品预览
- **购物车弹窗**：显示购物车摘要

## 4. 技术实现

### 4.1 内容收集定义
```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const productCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    sizes: z.array(z.string()),
    colors: z.array(z.string()),
    images: z.array(z.string()),
    inStock: z.boolean(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  products: productCollection,
};
```

### 4.2 页面实现

#### 首页 (商品列表页)
- 使用 `getCollection('products')` 获取所有商品
- 按类别分组展示商品
- 提供搜索和筛选功能

#### 商品详情页
- 使用 `getEntry('products', slug)` 获取特定商品
- 显示商品完整信息和图片

#### 购物车页
- 读取本地存储的购物车数据
- 显示商品清单和总价
- 提供修改数量和删除功能

#### 结算页
- 显示购物车内容和总价
- 收集客户信息
- 集成 NexiPay 支付流程

## 5. 数据流

1. **数据获取**：页面加载时从 `src/content/products/` 目录读取商品 JSON 文件
2. **数据展示**：通过 Astro Content Collections API 查询和渲染数据
3. **用户交互**：购物车操作通过本地存储实现
4. **支付流程**：结账时调用 NexiPay API

## 6. 用户体验

- 响应式设计，适配移动和桌面设备
- 直观的导航和分类
- 实时购物车状态更新
- 清晰的支付流程指引

## 7. 性能考虑

- 利用 Astro 的静态站点生成能力提高页面加载速度
- 商品数据在构建时就已确定，减少运行时计算
- 图片资源优化和懒加载
- 本地存储购物车数据，避免服务器请求

## 8. 安全性

- 支付数据通过安全渠道传输
- 用户隐私数据不存储敏感信息
- 内容收集确保数据格式正确性