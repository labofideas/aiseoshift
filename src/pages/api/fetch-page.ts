import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 10000;

const BLOCKED_PREFIXES = [
	'localhost',
	'127.',
	'10.',
	'192.168.',
	'169.254.',
	'0.',
	'::1',
	'fc00:',
	'fe80:',
];

function isBlockedHost(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (h === 'metadata.google.internal') return true;
	if (BLOCKED_PREFIXES.some((p) => h.startsWith(p))) return true;
	if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(h)) return true;
	return false;
}

function jsonError(message: string, status = 400): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const target = url.searchParams.get('url');
	if (!target) return jsonError('Missing url parameter');

	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		return jsonError('Invalid url');
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		return jsonError('Only http(s) URLs supported');
	}
	if (isBlockedHost(parsed.hostname)) {
		return jsonError('Host not allowed', 403);
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const res = await fetch(parsed.toString(), {
			method: 'GET',
			redirect: 'follow',
			signal: controller.signal,
			headers: {
				'user-agent':
					'Mozilla/5.0 (compatible; AISEOShiftBot/1.0; +https://aiseoshift.com/tools)',
				accept: 'text/html,application/xhtml+xml',
			},
		});

		clearTimeout(timer);

		if (!res.ok) return jsonError(`Target returned ${res.status}`, 502);

		const contentType = res.headers.get('content-type') || '';
		if (!contentType.includes('html') && !contentType.includes('xml')) {
			return jsonError('Target is not an HTML page', 415);
		}

		const buf = await res.arrayBuffer();
		if (buf.byteLength > MAX_BYTES) return jsonError('Response too large', 413);

		const html = new TextDecoder('utf-8', { fatal: false }).decode(buf);

		return new Response(
			JSON.stringify({
				url: res.url,
				status: res.status,
				contentType,
				bytes: buf.byteLength,
				html,
			}),
			{
				status: 200,
				headers: {
					'content-type': 'application/json',
					'cache-control': 'public, max-age=60',
				},
			},
		);
	} catch (err) {
		clearTimeout(timer);
		const isAbort =
			err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError';
		return jsonError(isAbort ? 'Request timed out' : 'Fetch failed', 504);
	}
};
