import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import path from 'path';
import { PRODUCT_SLUG } from './consts';

const __dirname = path.resolve();
const baseUrl = path.join(__dirname, '../tb-spider/content');

const product = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
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
    }),
});

export const collections = { product };
