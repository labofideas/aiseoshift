import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EmailMessage } from 'cloudflare:email';

export const prerender = false;

/**
 * POST /api/submit-deal  (JSON body)
 *
 * "Submit your deal" form handler for aiseoshift.com AND airankaudit.com.
 * airankaudit's Worker lives on another Cloudflare account and its zone has no
 * Email Routing, so its form posts here cross-origin. The email is sent with
 * the Email Routing send_email binding (DEAL_EMAIL in wrangler.json), which
 * only delivers to the verified destination address set there.
 */

// Sender must be on a zone with Email Routing in the same Cloudflare account
// as this Worker (Wbcom Designs): wbcomplugins.com. aiseoshift.com's zone
// stays in the personal account, so it cannot be the sender.
const FROM = 'deals@wbcomplugins.com';
const TO = 'shashank@wbcomdesigns.com';

// Origin host -> site label in the email. Anything else is rejected.
const SITES: Record<string, string> = {
	'aiseoshift.com': 'aiseoshift.com',
	'www.aiseoshift.com': 'aiseoshift.com',
	'airankaudit.com': 'airankaudit.com',
	'www.airankaudit.com': 'airankaudit.com',
	'airankaudit-com.wbcom-designs.workers.dev': 'airankaudit.com (staging)',
};

// name, max length, required
const FIELDS: [string, number, boolean][] = [
	['tool', 120, true],
	['website', 300, true],
	['category', 80, true],
	['deal', 1000, true],
	['code', 60, false],
	['ends', 30, false],
	['regular_price', 120, false],
	['name', 120, true],
	['email', 200, true],
	['notes', 2000, false],
];

const LABELS: Record<string, string> = {
	tool: 'Tool',
	website: 'Website',
	category: 'Category',
	deal: 'Deal',
	code: 'Coupon code',
	ends: 'Deal ends',
	regular_price: 'Regular price',
	name: 'Submitted by',
	email: 'Email',
	notes: 'Notes',
};

function json(data: unknown, status: number, origin: string | null): Response {
	const headers: Record<string, string> = { 'content-type': 'application/json', 'cache-control': 'no-store', vary: 'Origin' };
	if (origin) headers['access-control-allow-origin'] = origin;
	return new Response(JSON.stringify(data), { status, headers });
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

function b64(s: string): string {
	let bin = '';
	for (const byte of new TextEncoder().encode(s)) bin += String.fromCharCode(byte);
	return btoa(bin);
}

function mime(subject: string, body: string, replyTo: string): string {
	return [
		`From: AI Deals Form <${FROM}>`,
		`To: ${TO}`,
		`Reply-To: ${replyTo}`,
		`Subject: =?UTF-8?B?${b64(subject)}?=`,
		`Message-ID: <${crypto.randomUUID()}@wbcomplugins.com>`,
		`Date: ${new Date().toUTCString()}`,
		'MIME-Version: 1.0',
		'Content-Type: text/plain; charset=UTF-8',
		'Content-Transfer-Encoding: base64',
		'',
		b64(body).replace(/.{76}/g, '$&\r\n'),
	].join('\r\n');
}

export const OPTIONS: APIRoute = ({ request }) => {
	const origin = request.headers.get('origin');
	let ok = false;
	try {
		ok = !!origin && !!SITES[new URL(origin).host];
	} catch {}
	return new Response(null, {
		status: ok ? 204 : 403,
		headers: ok
			? { 'access-control-allow-origin': origin!, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type', vary: 'Origin' }
			: {},
	});
};

export const POST: APIRoute = async ({ request }) => {
	const origin = request.headers.get('origin');
	let site: string | undefined;
	try {
		site = origin ? SITES[new URL(origin).host] : undefined;
	} catch {}
	if (!site) return json({ ok: false, error: 'Forbidden' }, 403, null);

	const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
	const limiter = (env as any).DEAL_RATE_LIMITER;
	if (limiter && !(await limiter.limit({ key: ip })).success) {
		return json({ ok: false, error: 'Too many submissions. Please try again in a minute.' }, 429, origin);
	}

	// JSON, not form-encoded: Astro's checkOrigin blocks cross-site form posts,
	// and airankaudit.com posts here cross-site. The SITES check above replaces it.
	let form: Record<string, unknown>;
	try {
		form = await request.json();
		if (!form || typeof form !== 'object') throw new Error();
	} catch {
		return json({ ok: false, error: 'Invalid form data.' }, 400, origin);
	}
	const get = (key: string) => (typeof form[key] === 'string' ? (form[key] as string) : '');

	// Honeypot: real visitors never see or fill this field. Pretend success for bots.
	if (get('company_url').trim()) return json({ ok: true }, 200, origin);

	const data: Record<string, string> = {};
	for (const [key, max, required] of FIELDS) {
		const value = get(key).trim().slice(0, max);
		if (required && !value) return json({ ok: false, error: `Please fill in: ${LABELS[key]}.` }, 400, origin);
		data[key] = value;
	}
	if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) {
		return json({ ok: false, error: 'Please enter a valid email address.' }, 400, origin);
	}
	if (!/^https?:\/\/\S+\.\S+/.test(data.website)) data.website = `https://${data.website.replace(/^\/+/, '')}`;

	const subject = oneLine(`New AI deal: ${data.tool} (${site})`);
	const body = [
		`New deal submitted on ${site}`,
		'',
		...FIELDS.map(([key]) => `${LABELS[key]}: ${data[key] || '-'}`),
		'',
		`Page: ${oneLine(get('page') || '-').slice(0, 300)}`,
		`IP: ${ip}`,
		`Received: ${new Date().toISOString()}`,
		'',
		'Reply to this email to answer the submitter. Nothing is published until you add it to the deals list.',
	].join('\n');

	try {
		const msg = new EmailMessage(FROM, TO, mime(subject, body, oneLine(data.email)));
		await (env as any).DEAL_EMAIL.send(msg);
	} catch (err) {
		console.error('submit-deal send failed', err);
		return json({ ok: false, error: 'We could not send your deal right now. Please try again later.' }, 502, origin);
	}

	return json({ ok: true }, 200, origin);
};
