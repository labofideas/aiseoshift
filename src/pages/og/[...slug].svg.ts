import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

type Card = {
	slug: string;
	title: string;
	kicker: string;
};

const escapeXml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

const STATIC_CARDS: Card[] = [
	{
		slug: 'index',
		title: 'The shift from ranking to being cited.',
		kicker: 'AISEOSHIFT · The AI Search Era',
	},
	{
		slug: 'about',
		title: 'About AISEOShift',
		kicker: 'AISEOSHIFT',
	},
	{
		slug: 'ai-seo-shift',
		title: 'AI SEO Shift: the pillar guide',
		kicker: 'AISEOSHIFT · Pillar',
	},
	{
		slug: 'ai-seo-services',
		title: 'AI SEO services',
		kicker: 'AISEOSHIFT · Services',
	},
	{
		slug: 'ai-seo-tools',
		title: 'AI SEO tools',
		kicker: 'AISEOSHIFT · Tools',
	},
	{
		slug: 'seo-services',
		title: 'SEO services',
		kicker: 'AISEOSHIFT · Services',
	},
	{
		slug: 'tools',
		title: 'Free SEO tools',
		kicker: 'AISEOSHIFT · Tools',
	},
	{
		slug: 'tools/heading-checker',
		title: 'Heading hierarchy checker',
		kicker: 'AISEOSHIFT · Free tool',
	},
	{
		slug: 'tools/image-checker',
		title: 'Image SEO checker',
		kicker: 'AISEOSHIFT · Free tool',
	},
	{
		slug: 'tools/keyword-density',
		title: 'Keyword density checker',
		kicker: 'AISEOSHIFT · Free tool',
	},
	{
		slug: 'tools/meta-checker',
		title: 'Meta tag checker',
		kicker: 'AISEOSHIFT · Free tool',
	},
	{
		slug: 'tools/seo-checker',
		title: 'SEO checker',
		kicker: 'AISEOSHIFT · Free tool',
	},
	{
		slug: 'seo',
		title: 'The Complete SEO Guide for 2026',
		kicker: 'AISEOSHIFT · Pillar · 12 chapters',
	},
	{
		slug: 'aeo',
		title: 'AEO: Answer Engine Optimization explained',
		kicker: 'AISEOSHIFT · Entity Hub',
	},
	{
		slug: 'geo',
		title: 'GEO: Generative Engine Optimization explained',
		kicker: 'AISEOSHIFT · Entity Hub',
	},
	{
		slug: 'authors/shashank-dubey',
		title: 'Shashank Dubey · Founder, Wbcom Designs',
		kicker: 'AISEOSHIFT · Author',
	},
	{
		slug: 'glossary',
		title: 'AI SEO Glossary: 16 terms that matter in 2026',
		kicker: 'AISEOSHIFT · Reference',
	},
	{
		slug: 'newsletter',
		title: 'The AI SEO Shift, in your inbox.',
		kicker: 'AISEOSHIFT · Newsletter',
	},
	{
		slug: 'chatgpt-seo',
		title: 'ChatGPT SEO: How to get cited by ChatGPT Search',
		kicker: 'AISEOSHIFT · Engine Hub',
	},
	{
		slug: 'perplexity-seo',
		title: 'Perplexity SEO: Win the footnotes',
		kicker: 'AISEOSHIFT · Engine Hub',
	},
	{
		slug: 'claude-seo',
		title: 'Claude SEO: The selective citation',
		kicker: 'AISEOSHIFT · Engine Hub',
	},
	{
		slug: 'gemini-seo',
		title: 'Gemini SEO: SEO meets the synthesis layer',
		kicker: 'AISEOSHIFT · Engine Hub',
	},
	{
		slug: 'blog',
		title: 'Latest research and reporting',
		kicker: 'AISEOSHIFT · Blog',
	},
];

export const getStaticPaths = async () => {
	const cards: Card[] = [...STATIC_CARDS];

	const posts = await getCollection('blog', ({ data }) => !data.draft);
	for (const post of posts) {
		cards.push({
			slug: `blog/${post.id}`,
			title: post.data.title,
			kicker: `AISEOSHIFT · ${post.data.category}`,
		});
	}

	const chapters = await getCollection('guide', ({ data }) => !data.draft);
	for (const ch of chapters) {
		if (ch.data.chapter > 0) {
			cards.push({
				slug: `seo/${ch.id}`,
				title: ch.data.title,
				kicker: `AISEOSHIFT · SEO Guide · Chapter ${String(ch.data.chapter).padStart(2, '0')}`,
			});
		}
	}

	return cards.map((c) => ({ params: { slug: c.slug }, props: c }));
};

type RenderProps = {
	title: string;
	kicker: string;
};

const wrapTitle = (title: string, maxLineChars = 28): string[] => {
	const words = title.split(/\s+/);
	const lines: string[] = [];
	let current = '';
	for (const w of words) {
		const candidate = current ? `${current} ${w}` : w;
		if (candidate.length > maxLineChars && current) {
			lines.push(current);
			current = w;
		} else {
			current = candidate;
		}
		if (lines.length === 3) break;
	}
	if (current && lines.length < 4) lines.push(current);
	if (lines.length === 4) {
		const last = lines[3];
		if (last.length > maxLineChars - 1) lines[3] = `${last.slice(0, maxLineChars - 1).trim()}…`;
	}
	return lines.slice(0, 4);
};

const renderCard = ({ title, kicker }: RenderProps): string => {
	const lines = wrapTitle(escapeXml(title));
	const lineHeight = 78;
	const startY = 180;

	const titleSpans = lines
		.map((line, i) => `<tspan x="80" y="${startY + i * lineHeight}">${line}</tspan>`)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${escapeXml(title)}">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="rgb(250,250,247)" />
			<stop offset="100%" stop-color="rgb(246,245,240)" />
		</linearGradient>
	</defs>
	<rect width="1200" height="630" fill="url(#bg)" />
	<g stroke="rgb(14,17,22)" stroke-opacity="0.06">
		<line x1="0" y1="105" x2="1200" y2="105" />
		<line x1="0" y1="525" x2="1200" y2="525" />
	</g>
	<text x="80" y="74" font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3.6" fill="rgb(14,17,22)" fill-opacity="0.7">${escapeXml(kicker.toUpperCase())}</text>
	<text font-family="Iowan Old Style, Palatino Linotype, Georgia, serif" font-size="68" font-weight="600" letter-spacing="-2" fill="rgb(14,17,22)" line-height="1">${titleSpans}</text>
	<g transform="translate(80 565)">
		<g stroke="rgb(184,85,46)" stroke-width="2" fill="none" stroke-linecap="round">
			<line x1="0" y1="0" x2="22" y2="0" />
			<line x1="32" y1="0" x2="54" y2="0" />
			<line x1="64" y1="0" x2="86" y2="0" />
		</g>
		<circle cx="106" cy="0" r="6" fill="rgb(184,85,46)" />
	</g>
	<text x="1120" y="575" text-anchor="end" font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="rgb(14,17,22)" fill-opacity="0.7">AISEOSHIFT.COM</text>
</svg>`;
};

export const GET: APIRoute = async ({ props }) => {
	const { title, kicker } = props as RenderProps;
	const body = renderCard({ title, kicker });
	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
		},
	});
};
