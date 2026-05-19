#!/usr/bin/env node
// Posts newly added blog entries to Bluesky and Tumblr.
// Invoked from .github/workflows/social-publish.yml after Deploy Site succeeds.
//
// Env vars expected:
//   ADDED_FILES         newline-separated paths from `git diff --diff-filter=A`
//   SITE_URL            e.g. https://aiseoshift.com
//   BSKY_HANDLE, BSKY_APP_PASSWORD
//   TUMBLR_CONSUMER_KEY, TUMBLR_CONSUMER_SECRET, TUMBLR_OAUTH_TOKEN, TUMBLR_OAUTH_SECRET, TUMBLR_BLOG
//   DRY_RUN=1           log payloads without calling APIs

import { readFile } from 'node:fs/promises';
import { createHmac, randomBytes } from 'node:crypto';
import { basename } from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://aiseoshift.com').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1';

const ADDED_FILES = (process.env.ADDED_FILES || '')
	.split('\n')
	.map((s) => s.trim())
	.filter((s) => s && s.startsWith('src/content/blog/') && s.endsWith('.mdx'));

if (ADDED_FILES.length === 0) {
	console.log('No new blog posts detected. Nothing to publish.');
	process.exit(0);
}

console.log(`Detected ${ADDED_FILES.length} new post(s):`);
for (const f of ADDED_FILES) console.log(`  - ${f}`);

const results = [];

for (const file of ADDED_FILES) {
	try {
		const post = await loadPost(file);
		if (post.draft) {
			console.log(`\nSkipping draft: ${post.slug}`);
			continue;
		}

		const url = `${SITE_URL}/blog/${post.slug}/`;
		console.log(`\n=== ${post.slug} ===`);
		console.log(`  URL: ${url}`);
		console.log(`  Title: ${post.title}`);
		console.log(`  Tags: ${post.tags.join(', ')}`);

		const ogImage = await fetchOgImage(url);
		console.log(`  OG image: ${ogImage || '(none found)'}`);

		const bskyResult = await postToBluesky({ url, post, ogImage });
		console.log(`  Bluesky: ${bskyResult}`);

		const tumblrResult = await postToTumblr({ url, post, ogImage });
		console.log(`  Tumblr:  ${tumblrResult}`);

		results.push({ slug: post.slug, bsky: bskyResult, tumblr: tumblrResult });
	} catch (err) {
		console.error(`\nFAILED on ${file}: ${err.message}`);
		results.push({ slug: basename(file, '.mdx'), error: err.message });
	}
}

// Emit a GitHub Actions summary if running in CI.
if (process.env.GITHUB_STEP_SUMMARY) {
	const lines = ['# Social Publish Summary\n'];
	for (const r of results) {
		lines.push(`## ${r.slug}`);
		if (r.error) lines.push(`- Error: ${r.error}`);
		else {
			lines.push(`- Bluesky: ${r.bsky}`);
			lines.push(`- Tumblr: ${r.tumblr}`);
		}
		lines.push('');
	}
	await readFile(process.env.GITHUB_STEP_SUMMARY).catch(() => null);
	const { appendFile } = await import('node:fs/promises');
	await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
}

const failed = results.filter((r) => r.error);
if (failed.length > 0) {
	console.error(`\n${failed.length} post(s) failed to publish.`);
	process.exit(1);
}

// ---------- Post loading + frontmatter parsing ----------

async function loadPost(file) {
	const raw = await readFile(file, 'utf8');
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) throw new Error('No frontmatter found');
	const fm = parseFrontmatter(match[1]);
	return {
		slug: basename(file, '.mdx'),
		title: fm.title || '',
		description: fm.description || '',
		tags: Array.isArray(fm.tags) ? fm.tags : [],
		draft: fm.draft === true || fm.draft === 'true',
	};
}

// Minimal YAML frontmatter parser. Handles: scalar strings (quoted/unquoted),
// booleans, and one level of `- item` lists. Sufficient for this project's schema.
function parseFrontmatter(text) {
	const out = {};
	const lines = text.split(/\r?\n/);
	let currentKey = null;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line.trim()) continue;

		// List item under the most recent key.
		const listMatch = line.match(/^\s+-\s+(.+)$/);
		if (listMatch && currentKey) {
			if (!Array.isArray(out[currentKey])) out[currentKey] = [];
			out[currentKey].push(unquote(listMatch[1].trim()));
			continue;
		}

		const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
		if (!kv) continue;
		const [, key, rawValue] = kv;
		currentKey = key;
		const value = rawValue.trim();

		if (value === '' || value === '|' || value === '>') {
			// Block scalar or list follows on subsequent lines.
			out[key] = '';
			continue;
		}
		if (value === 'true') out[key] = true;
		else if (value === 'false') out[key] = false;
		else out[key] = unquote(value);
	}
	return out;
}

function unquote(s) {
	if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
		return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
	}
	return s;
}

// ---------- OG image extraction ----------

async function fetchOgImage(pageUrl) {
	try {
		const res = await fetch(pageUrl, { headers: { 'user-agent': 'aiseoshift-social-publish/1.0' } });
		if (!res.ok) return null;
		const html = await res.text();
		const m =
			html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
		if (!m) return null;
		// Resolve relative URLs against the page URL.
		return new URL(m[1], pageUrl).toString();
	} catch {
		return null;
	}
}

// ---------- Bluesky (AT Protocol) ----------

async function postToBluesky({ url, post, ogImage }) {
	const handle = required('BSKY_HANDLE');

	if (DRY_RUN) {
		const { text } = buildBlueskyText(post);
		return `[dry-run] would post to @${handle}: ${text.replace(/\n/g, ' / ')} (link: ${url}, thumb: ${ogImage || 'none'})`;
	}

	const password = required('BSKY_APP_PASSWORD');
	const session = await atpRequest('com.atproto.server.createSession', {
		identifier: handle,
		password,
	});

	let thumb = null;
	if (ogImage) {
		try {
			const imgRes = await fetch(ogImage);
			if (imgRes.ok) {
				let bytes = Buffer.from(await imgRes.arrayBuffer());
				let contentType = imgRes.headers.get('content-type') || 'image/jpeg';
				// Bluesky's blob ceiling is ~1MB. If larger, skip thumbnail rather than corrupting.
				if (bytes.length <= 976_560) {
					const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
						method: 'POST',
						headers: {
							'content-type': contentType,
							authorization: `Bearer ${session.accessJwt}`,
						},
						body: bytes,
					});
					if (blobRes.ok) {
						const blobJson = await blobRes.json();
						thumb = blobJson.blob;
					}
				}
			}
		} catch (err) {
			console.warn(`  (Bluesky thumb skipped: ${err.message})`);
		}
	}

	const { text, facets } = buildBlueskyText(post);

	const record = {
		$type: 'app.bsky.feed.post',
		text,
		createdAt: new Date().toISOString(),
		langs: ['en'],
		embed: {
			$type: 'app.bsky.embed.external',
			external: {
				uri: url,
				title: truncate(post.title, 300),
				description: truncate(post.description, 1000),
				...(thumb ? { thumb } : {}),
			},
		},
		...(facets.length ? { facets } : {}),
	};

	if (DRY_RUN) return `[dry-run] would post: ${text.replace(/\n/g, ' / ')}`;

	const created = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${session.accessJwt}`,
		},
		body: JSON.stringify({
			repo: session.did,
			collection: 'app.bsky.feed.post',
			record,
		}),
	});
	if (!created.ok) throw new Error(`Bluesky createRecord ${created.status}: ${await created.text()}`);
	const { uri } = await created.json();
	// at://did:plc:xxx/app.bsky.feed.post/<rkey>  →  https://bsky.app/profile/<handle>/post/<rkey>
	const rkey = uri.split('/').pop();
	return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

async function atpRequest(method, body) {
	const res = await fetch(`https://bsky.social/xrpc/${method}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`AT Proto ${method} ${res.status}: ${await res.text()}`);
	return res.json();
}

// Builds Bluesky post text + tag facets. Keeps body under 300 graphemes by
// truncating the title; appends up to 3 hashtags from the post's tags.
function buildBlueskyText(post) {
	const HASHTAG_BUDGET = 3;
	const hashtags = post.tags
		.slice(0, HASHTAG_BUDGET)
		.map((t) => '#' + t.toLowerCase().replace(/[^a-z0-9]/g, ''))
		.filter((t) => t.length > 1);

	const tagsLine = hashtags.join(' ');
	const suffix = tagsLine ? `\n\n${tagsLine}` : '';
	const titleBudget = 300 - countGraphemes(suffix);
	const title = countGraphemes(post.title) > titleBudget
		? truncateGraphemes(post.title, titleBudget - 1) + '…'
		: post.title;

	const text = `${title}${suffix}`;

	// Build facets for each hashtag (byte offsets in UTF-8).
	const facets = [];
	if (hashtags.length) {
		const textBytes = Buffer.from(text, 'utf8');
		const utf8 = (s) => Buffer.byteLength(s, 'utf8');
		let searchFrom = utf8(title) + utf8('\n\n');
		for (const tag of hashtags) {
			const tagBytes = utf8(tag);
			// Find the tag in textBytes starting from searchFrom.
			const idx = textBytes.indexOf(tag, searchFrom);
			if (idx === -1) continue;
			facets.push({
				index: { byteStart: idx, byteEnd: idx + tagBytes },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: tag.slice(1) }],
			});
			searchFrom = idx + tagBytes + 1;
		}
	}

	return { text, facets };
}

function countGraphemes(s) {
	// Intl.Segmenter is available in Node 22.
	return [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].length;
}

function truncateGraphemes(s, n) {
	const segs = [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)];
	return segs.slice(0, n).map((g) => g.segment).join('');
}

function truncate(s, n) {
	if (!s) return '';
	return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

// ---------- Tumblr (API v2, OAuth 1.0a) ----------

async function postToTumblr({ url, post, ogImage }) {
	const blog = required('TUMBLR_BLOG');

	if (DRY_RUN) {
		return `[dry-run] would post link to ${blog}.tumblr.com: ${url}`;
	}

	const consumerKey = required('TUMBLR_CONSUMER_KEY');
	const consumerSecret = required('TUMBLR_CONSUMER_SECRET');
	const oauthToken = required('TUMBLR_OAUTH_TOKEN');
	const oauthSecret = required('TUMBLR_OAUTH_SECRET');

	const endpoint = `https://api.tumblr.com/v2/blog/${encodeURIComponent(blog)}/post`;
	const params = {
		type: 'link',
		url,
		title: post.title,
		description: post.description,
		tags: post.tags.slice(0, 10).join(','),
		state: 'published',
		...(ogImage ? { thumbnail: ogImage } : {}),
	};

	if (DRY_RUN) return `[dry-run] would post link: ${url}`;

	const res = await oauth1Post(endpoint, params, {
		consumerKey,
		consumerSecret,
		token: oauthToken,
		tokenSecret: oauthSecret,
	});

	const json = JSON.parse(res);
	if (json.meta && json.meta.status >= 400) {
		throw new Error(`Tumblr ${json.meta.status}: ${JSON.stringify(json.response || json.meta)}`);
	}
	const id = json.response && (json.response.id_string || json.response.id);
	return id ? `https://${blog}.tumblr.com/post/${id}` : '(posted, no id returned)';
}

// OAuth 1.0a signed POST with body in application/x-www-form-urlencoded.
async function oauth1Post(url, params, creds) {
	const oauthParams = {
		oauth_consumer_key: creds.consumerKey,
		oauth_nonce: randomBytes(16).toString('hex'),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
		oauth_token: creds.token,
		oauth_version: '1.0',
	};

	// Signature base string includes ALL params (oauth + body), sorted.
	const allParams = { ...params, ...oauthParams };
	const paramString = Object.keys(allParams)
		.sort()
		.map((k) => `${rfc3986(k)}=${rfc3986(allParams[k])}`)
		.join('&');

	const baseString = ['POST', rfc3986(url), rfc3986(paramString)].join('&');
	const signingKey = `${rfc3986(creds.consumerSecret)}&${rfc3986(creds.tokenSecret)}`;
	const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

	oauthParams.oauth_signature = signature;

	const authHeader =
		'OAuth ' +
		Object.keys(oauthParams)
			.sort()
			.map((k) => `${rfc3986(k)}="${rfc3986(oauthParams[k])}"`)
			.join(', ');

	const body = Object.keys(params)
		.map((k) => `${rfc3986(k)}=${rfc3986(params[k])}`)
		.join('&');

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			authorization: authHeader,
			'content-type': 'application/x-www-form-urlencoded',
		},
		body,
	});
	const text = await res.text();
	if (!res.ok && res.status !== 201) {
		throw new Error(`Tumblr HTTP ${res.status}: ${text}`);
	}
	return text;
}

function rfc3986(s) {
	return encodeURIComponent(String(s)).replace(
		/[!*'()]/g,
		(c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
	);
}

function required(name) {
	const v = process.env[name];
	if (!v) throw new Error(`Missing required env var: ${name}`);
	return v;
}
