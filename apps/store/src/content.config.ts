import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import path from 'path';
import { PRODUCT_SLUG } from './consts';

const __dirname = path.resolve();
const baseUrl = path.join(__dirname, '../tb-spider/content');

const product = defineCollection({
  loader: glob({ base: path.join(baseUrl, PRODUCT_SLUG, 'products'), pattern: '*.json' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      rating: z.number(),
      price: z.number(),
      image: image().optional(),
      categories: z.array(reference('category')).optional(),
    }),
});

const post = defineCollection({
  loader: glob({ base: path.join(baseUrl, PRODUCT_SLUG, 'posts'), pattern: '*.md' }),
  schema: () =>
    z.object({
      title: z.string(),
      slug: z.string(),
    }),
});

const category = defineCollection({
  loader: glob({ base: path.join(baseUrl, PRODUCT_SLUG, 'categories'), pattern: '*.json' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    cover: image().optional(),
  }),
});

export const collections = { product, post, category };
