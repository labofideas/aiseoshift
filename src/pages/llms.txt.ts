import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
	SITE_URL,
	SITE_TITLE,
	SITE_DESCRIPTION,
} from '../consts';

export const prerender = true;

const RECENT_POSTS_LIMIT = 30;

const clean = (value: string): string =>
	value
		.replace(/—/g, '-')
		.replace(/–/g, '-')
		.replace(/\s+/g, ' ')
		.trim();

const truncate = (value: string, max = 220): string => {
	const cleaned = clean(value);
	if (cleaned.length <= max) return cleaned;
	const slice = cleaned.slice(0, max);
	const lastSpace = slice.lastIndexOf(' ');
	return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trim()}...`;
};

const entry = (title: string, url: string, description: string): string =>
	`- [${clean(title)}](${url}): ${truncate(description)}`;

type StaticEntry = {
	title: string;
	path: string;
	description: string;
};

const HUB_PAGES: StaticEntry[] = [
	{
		title: 'AISEOShift Homepage',
		path: '/',
		description:
			'AI SEO Shift: the practical playbook for ranking in Google and getting cited by ChatGPT, Claude, Perplexity, and Google AI Overviews. Covers AEO, GEO, AI visibility, and citation strategy.',
	},
	{
		title: 'The Complete SEO Guide',
		path: '/seo/',
		description:
			'12-chapter guide to SEO in 2026 covering fundamentals, technical SEO, schema, E-E-A-T, AEO, GEO, AI Overviews, content strategy, and measurement.',
	},
	{
		title: 'AI SEO Shift Pillar',
		path: '/ai-seo-shift/',
		description:
			'Pillar overview of the AI SEO Shift: how AI visibility, answer engines, and generative search are restructuring SEO and what brands should do next.',
	},
	{
		title: 'AI SEO Services',
		path: '/ai-seo-services/',
		description:
			'AI SEO services covered by AISEOShift: AEO, GEO, AI citation building, schema implementation, content strategy, and measurement.',
	},
	{
		title: 'AI SEO Tools',
		path: '/ai-seo-tools/',
		description:
			'AI SEO tools index: free utilities and recommended platforms for AI visibility audits, citation tracking, schema, and content optimization.',
	},
	{
		title: 'About AISEOShift',
		path: '/about/',
		description:
			'About AISEOShift: editorial focus, methodology, and how the site approaches AI visibility and answer engine optimization.',
	},
];

const TOOL_PAGES: StaticEntry[] = [
	{
		title: 'Free SEO Tools',
		path: '/tools/',
		description:
			'Free in-browser SEO tools for content audits, including heading hierarchy, image alt text, keyword density, meta tags, and full-page SEO checks.',
	},
	{
		title: 'Heading Hierarchy Checker',
		path: '/tools/heading-checker/',
		description:
			'Check heading structure (H1-H6) on any URL for SEO and accessibility issues. Detects missing H1s, skipped levels, and AI-extraction problems.',
	},
	{
		title: 'Image SEO Checker',
		path: '/tools/image-checker/',
		description:
			'Audit images on any URL for alt text, file naming, and accessibility. Flags missing alts and oversized files.',
	},
	{
		title: 'Keyword Density Checker',
		path: '/tools/keyword-density/',
		description:
			'Analyze keyword density and term frequency on any URL or pasted text to spot over-optimization or thin coverage.',
	},
	{
		title: 'Meta Tag Checker',
		path: '/tools/meta-checker/',
		description:
			'Inspect title, meta description, canonical, robots, Open Graph, and Twitter Card tags on any URL.',
	},
	{
		title: 'SEO Checker',
		path: '/tools/seo-checker/',
		description:
			'Full on-page SEO audit for any URL covering titles, headings, meta, links, images, schema, and AI-extractability signals.',
	},
];

export const GET: APIRoute = async () => {
	const guide = (await getCollection('guide')).filter((c) => !c.data.draft);
	const chapters = guide
		.filter((c) => c.data.chapter > 0)
		.sort((a, b) => a.data.chapter - b.data.chapter);

	const posts = (await getCollection('blog'))
		.filter((p) => !p.data.draft)
		.sort(
			(a, b) =>
				new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
		);

	const lines: string[] = [];
	lines.push(`# ${SITE_TITLE}`);
	lines.push('');
	lines.push(`> ${clean(SITE_DESCRIPTION)}`);
	lines.push('');
	lines.push(
		'AISEOShift is an independent editorial site covering the shift from classical SEO to AI-driven search. The pages below are the canonical entry points for assistants and answer engines that want to cite this site.',
	);
	lines.push('');

	lines.push('## Sitemaps');
	lines.push(
		entry(
			'XML Sitemap',
			`${SITE_URL}/sitemap-index.xml`,
			'Full machine-readable index of all pages, posts, and SEO guide chapters on aiseoshift.com.',
		),
	);
	lines.push('');

	lines.push('## Hub Pages');
	for (const page of HUB_PAGES) {
		lines.push(entry(page.title, `${SITE_URL}${page.path}`, page.description));
	}
	lines.push('');

	lines.push('## SEO Guide Chapters');
	for (const chapter of chapters) {
		const url = `${SITE_URL}/seo/${chapter.id}/`;
		const title = `Chapter ${chapter.data.chapter}: ${chapter.data.title}`;
		lines.push(entry(title, url, chapter.data.description));
	}
	lines.push('');

	lines.push('## Free Tools');
	for (const tool of TOOL_PAGES) {
		lines.push(entry(tool.title, `${SITE_URL}${tool.path}`, tool.description));
	}
	lines.push('');

	lines.push('## Recent Posts');
	for (const post of posts.slice(0, RECENT_POSTS_LIMIT)) {
		const url = `${SITE_URL}/blog/${post.id}/`;
		lines.push(entry(post.data.title, url, post.data.description));
	}
	lines.push('');

	lines.push('## Feeds');
	lines.push(
		entry(
			'RSS Feed',
			`${SITE_URL}/rss.xml`,
			'RSS feed of the latest AISEOShift posts on AI SEO, AEO, GEO, AI visibility, and answer engine strategy.',
		),
	);
	lines.push('');

	const body = lines.join('\n');

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
		},
	});
};
