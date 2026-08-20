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
			faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
		}),
});

const guide = defineCollection({
	loader: glob({ base: './src/content/seo-guide', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			deck: z.string(),
			chapter: z.number(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			draft: z.boolean().default(false),
		}),
});

const glossary = defineCollection({
	loader: glob({ base: './src/content/glossary', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			term: z.string(),
			abbreviation: z.string().optional(),
			category: z.string(),
			summary: z.string(),
			related: z.array(z.string()).default([]),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog, guide, glossary };
