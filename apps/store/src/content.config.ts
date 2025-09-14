import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import path from 'path';

const __dirname = path.resolve();
const baseUrl = path.join(__dirname, '../tb-spider/content');

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: path.join(baseUrl, 'blog'), pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

export const collections = { blog };
