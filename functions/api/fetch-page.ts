// Cloudflare Pages Function: fetch a public URL server-side so the SEO
// tools can analyze it without hitting browser CORS limits.
//
// GET /api/fetch-page?url=https://example.com
//
// Safety:
// - Only http(s) URLs
// - Block private / local / loopback / link-local hosts (SSRF defense)
// - Hard timeout (10s)
// - Max response size (3 MB)
// - Returns plain HTML body as text/plain

const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 10000;

const BLOCKED_HOST_PREFIXES = [
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
const BLOCKED_HOSTS_EXACT = new Set(['metadata.google.internal']);

function isBlockedHost(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (BLOCKED_HOSTS_EXACT.has(h)) return true;
	if (BLOCKED_HOST_PREFIXES.some((p) => h.startsWith(p))) return true;
	// 172.16.0.0 – 172.31.255.255 private range
	if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(h)) return true;
	return false;
}

function jsonError(message: string, status = 400) {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

export const onRequestGet: PagesFunction = async ({ request }) => {
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
			cf: { cacheTtl: 60, cacheEverything: false },
		} as RequestInit);

		clearTimeout(timer);

		if (!res.ok) {
			return jsonError(`Target returned ${res.status}`, 502);
		}
		const contentType = res.headers.get('content-type') || '';
		if (!contentType.includes('html') && !contentType.includes('xml')) {
			return jsonError('Target is not an HTML page', 415);
		}

		const reader = res.body!.getReader();
		const chunks: Uint8Array[] = [];
		let total = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > MAX_BYTES) {
				try {
					await reader.cancel();
				} catch {}
				return jsonError('Response too large', 413);
			}
			chunks.push(value);
		}
		const merged = new Uint8Array(total);
		let offset = 0;
		for (const c of chunks) {
			merged.set(c, offset);
			offset += c.byteLength;
		}
		const text = new TextDecoder('utf-8', { fatal: false }).decode(merged);

		return new Response(
			JSON.stringify({
				url: res.url,
				status: res.status,
				contentType,
				bytes: total,
				html: text,
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
		const msg =
			err instanceof Error && err.name === 'AbortError'
				? 'Request timed out'
				: 'Fetch failed';
		return jsonError(msg, 504);
	}
};
