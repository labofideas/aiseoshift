// Diagnostic endpoint. If GET /api/ping returns JSON, Cloudflare Pages
// Functions are deployed and routing correctly.
export async function onRequestGet(): Promise<Response> {
	return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
		headers: { 'content-type': 'application/json' },
	});
}
