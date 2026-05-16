import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) throw new Error('Missing PEXELS_API_KEY');

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'posts');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'image-manifest.json');

const newRequests = [
	{ slug: 'ai-paraphrasing-tools', query: 'writer typing on laptop notebook', alt: 'Writer working at a laptop refining text on screen' },
	{ slug: 'ai-content-humanizers', query: 'person editing document at laptop', alt: 'Editor reviewing and humanizing text on a laptop' },
	{ slug: 'ai-detection-tools-for-writers', query: 'student writing essay laptop', alt: 'Student writing and checking work on a laptop' },
	{ slug: 'ai-grammar-checkers', query: 'keyboard typing close up writing', alt: 'Close-up of fingers typing on a keyboard' },
	{ slug: 'plagiarism-checkers', query: 'stack of academic books research', alt: 'Stack of books and research papers representing source verification' },
	{ slug: 'ai-summarizers', query: 'person reading documents notes desk', alt: 'Researcher reading and summarizing documents at a desk' },
	{ slug: 'ai-citation-generators', query: 'library books research desk', alt: 'Library research desk with books and notes for citations' },
	{ slug: 'ai-translators', query: 'world languages dictionary global', alt: 'Multilingual dictionary representing translation across languages' },
	{ slug: 'ai-image-generators', query: 'creative digital art design tablet', alt: 'Designer working on creative digital art with a tablet' },
	{ slug: 'ai-content-detection-tools', query: 'computer screen analysis text data', alt: 'Editor reviewing text analysis on a computer screen' },
	{ slug: 'ai-presentation-tools', query: 'business presentation slides audience', alt: 'Presenter delivering a slide presentation to an audience' },
	{ slug: 'ai-product-listing-tools', query: 'ecommerce product photography studio', alt: 'Product photography setup for ecommerce listings' },
];

async function fetchPexelsPhoto(query) {
	const url = new URL('https://api.pexels.com/v1/search');
	url.searchParams.set('query', query);
	url.searchParams.set('per_page', '1');
	url.searchParams.set('orientation', 'landscape');
	url.searchParams.set('size', 'large');
	const r = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
	if (!r.ok) throw new Error(`Pexels ${r.status} for "${query}"`);
	const data = await r.json();
	const photo = data.photos?.[0];
	if (!photo) throw new Error(`No photo for "${query}"`);
	return photo;
}

async function downloadBuffer(url) {
	const r = await fetch(url);
	if (!r.ok) throw new Error(`Download ${r.status}`);
	return Buffer.from(await r.arrayBuffer());
}

async function optimize(buf) {
	let last = buf;
	for (const quality of [82, 76, 70, 64, 58, 52]) {
		const out = await sharp(buf)
			.rotate()
			.resize(1200, 675, { fit: 'cover', position: 'entropy', withoutEnlargement: true })
			.webp({ quality })
			.toBuffer();
		last = out;
		if (out.byteLength <= 300 * 1024) return out;
	}
	return last;
}

async function run() {
	await fs.mkdir(OUTPUT_DIR, { recursive: true });
	const existing = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
	const merged = { ...existing };

	for (const req of newRequests) {
		try {
			console.log(`→ ${req.slug}: "${req.query}"`);
			const photo = await fetchPexelsPhoto(req.query);
			const assetUrl = photo.src.landscape || photo.src.large || photo.src.original;
			const srcBuf = await downloadBuffer(assetUrl);
			const opt = await optimize(srcBuf);
			const filename = `${req.slug}-hero.webp`;
			await fs.writeFile(path.join(OUTPUT_DIR, filename), opt);
			merged[req.slug] = {
				...(merged[req.slug] || {}),
				hero: {
					src: `/images/posts/${filename}`,
					alt: req.alt,
					photographer: photo.photographer,
					photographerUrl: photo.photographer_url,
					sourceName: 'Pexels',
					sourceUrl: photo.url,
					width: 1200,
					height: 675,
					bytes: opt.byteLength,
				},
			};
			console.log(`  ✓ ${(opt.byteLength / 1024).toFixed(1)}KB by ${photo.photographer}`);
		} catch (e) {
			console.error(`  ✗ ${req.slug}: ${e.message}`);
		}
	}

	await fs.writeFile(MANIFEST_PATH, JSON.stringify(merged, null, '\t') + '\n');
	console.log(`\nDone. Merged ${newRequests.length} entries into manifest.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
