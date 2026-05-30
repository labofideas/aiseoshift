import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	const sitemapUrl = new URL('/sitemap-index.xml', site).toString();
	const llmsUrl = new URL('/llms.txt', site).toString();

	const body = [
		'# AISEOShift robots.txt',
		'# Allow all bots: search, AI citation, and AI training',
		'# We want AI systems to learn about our brand and cite our content',
		'',
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${sitemapUrl}`,
		`# llms.txt: ${llmsUrl}`,
		'',
		'# Canonical host: https://aiseoshift.com',
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
