import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const productCollection = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
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
