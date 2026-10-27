import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Case studies live as Markdown in src/content/work/.
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),          // one line: what changed for people
    client: z.string(),
    role: z.string(),
    year: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    status: z.string().optional(), // e.g. "In progress"
    award: z.string().optional(),
  }),
});

export const collections = { work };
