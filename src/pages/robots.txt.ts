import type { APIRoute } from 'astro';

const SEARCH_BOTS = [
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

const TRAINING_BOTS = [
	'GPTBot',
	'ClaudeBot',
	'Google-Extended',
	'CCBot',
	'Meta-ExternalAgent',
	'Bytespider',
];

export const GET: APIRoute = ({ site }) => {
	const sitemapUrl = new URL('/sitemap-index.xml', site).toString();
	const llmsUrl = new URL('/llms.txt', site).toString();

	const searchAllows = SEARCH_BOTS.map(
		(bot) => `User-agent: ${bot}\nAllow: /`,
	).join('\n\n');

	const trainingBlocks = TRAINING_BOTS.map(
		(bot) => `User-agent: ${bot}\nDisallow: /`,
	).join('\n\n');

	const body = [
		'# Search and citation bots: allowed',
		searchAllows,
		'',
		'# Training-only crawlers: blocked',
		trainingBlocks,
		'',
		'# All other bots: allowed',
		'User-agent: *',
		'Allow: /',
		'',
		'# Content usage signal',
		'Content-Signal: search=yes, ai-train=no',
		'',
		`Sitemap: ${sitemapUrl}`,
		`# llms.txt: ${llmsUrl}`,
		'',
		'# Canonical host: https://aiseoshift.com',
		`# All variations (http, www) should redirect to ${site}`,
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
