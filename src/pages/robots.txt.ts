import type { APIRoute } from 'astro';

const ASSISTANT_BOTS = [
	'PerplexityBot',
	'Perplexity-User',
	'OAI-SearchBot',
	'ChatGPT-User',
	'Claude-SearchBot',
	'Claude-User',
	'Googlebot',
	'Bingbot',
	'Applebot',
];

export const GET: APIRoute = ({ site }) => {
	const sitemapUrl = new URL('/sitemap-index.xml', site).toString();
	const llmsUrl = new URL('/llms.txt', site).toString();

	const explicitAllows = ASSISTANT_BOTS.map(
		(bot) => `User-agent: ${bot}\nAllow: /`,
	).join('\n\n');

	const body = [
		explicitAllows,
		'',
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${sitemapUrl}`,
		`# llms.txt: ${llmsUrl}`,
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
