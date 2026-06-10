import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_PER_REQUEST = 50; // Medium-style: up to 50 claps per visitor per post

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json',
			'cache-control': 'no-store',
		},
	});
}

function getDB(locals: any): any | null {
	return locals?.runtime?.env?.DB ?? null;
}

function cleanSlug(s: unknown): string | null {
	if (typeof s !== 'string') return null;
	const slug = s.trim().slice(0, 200);
	// allow blog slug characters only
	return /^[a-z0-9/-]+$/i.test(slug) ? slug : null;
}

// GET /api/claps?slug=foo  -> { count, configured }
export const GET: APIRoute = async ({ url, locals }) => {
	const slug = cleanSlug(url.searchParams.get('slug'));
	if (!slug) return json({ error: 'missing or invalid slug' }, 400);

	const db = getDB(locals);
	if (!db) return json({ count: 0, configured: false });

	try {
		const row = await db.prepare('SELECT count FROM claps WHERE slug = ?1').bind(slug).first();
		return json({ count: row?.count ?? 0, configured: true });
	} catch {
		return json({ count: 0, configured: false });
	}
};

// POST /api/claps  body: { slug, claps }  -> { count, configured }
export const POST: APIRoute = async ({ request, locals }) => {
	let body: any;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'invalid JSON body' }, 400);
	}

	const slug = cleanSlug(body?.slug);
	if (!slug) return json({ error: 'missing or invalid slug' }, 400);

	let add = Math.floor(Number(body?.claps));
	if (!Number.isFinite(add) || add <= 0) return json({ error: 'invalid clap amount' }, 400);
	add = Math.min(add, MAX_PER_REQUEST);

	const db = getDB(locals);
	if (!db) return json({ count: 0, configured: false });

	try {
		// Atomic upsert + increment in a single D1 statement.
		const row = await db
			.prepare(
				'INSERT INTO claps (slug, count) VALUES (?1, ?2) ' +
					'ON CONFLICT(slug) DO UPDATE SET count = count + ?2 RETURNING count'
			)
			.bind(slug, add)
			.first();
		return json({ count: row?.count ?? add, configured: true });
	} catch {
		return json({ count: 0, configured: false });
	}
};
