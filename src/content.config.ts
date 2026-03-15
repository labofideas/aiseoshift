import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			deck: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			category: z.enum(['Strategy', 'Research', 'Tooling', 'Playbooks']),
			tags: z.array(z.string()).min(2),
			author: z.string().default('AISEOShift Editorial Desk'),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
