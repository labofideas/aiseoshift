import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
	throw new Error('Missing PEXELS_API_KEY');
}

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'posts');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'image-manifest.json');

const imageRequests = [
	{
		slug: 'what-is-ai-visibility',
		hero: {
			query: 'artificial intelligence abstract interface',
			alt: 'Abstract editorial visual representing AI visibility across digital interfaces',
		},
		inline: [
			{
				query: 'team reviewing analytics dashboard',
				alt: 'Team reviewing performance data and search visibility metrics',
			},
		],
	},
	{
		slug: 'what-is-answer-engine-optimization',
		hero: {
			query: 'search interface laptop modern workspace',
			alt: 'Modern search and answer interface on a laptop at a desk',
		},
		inline: [
			{
				query: 'person typing on laptop researching information',
				alt: 'Person researching and typing on a laptop while reviewing answers',
			},
		],
	},
	{
		slug: 'ai-citation-landscape-2026',
		hero: {
			query: 'research papers desk citations',
			alt: 'Research documents and notes representing source citations and analysis',
		},
		inline: [
			{
				query: 'data analyst reviewing reports',
				alt: 'Analyst reviewing reports and source material for research work',
			},
		],
	},
	{
		slug: 'best-surfer-seo-alternatives-2026',
		hero: {
			query: 'seo dashboard marketing team',
			alt: 'Marketing team reviewing SEO dashboards and software options',
		},
	},
	{
		slug: 'best-ai-visibility-tools-2026',
		hero: {
			query: 'analytics software dashboard screens',
			alt: 'Analytics dashboards on multiple screens representing AI visibility tooling',
		},
	},
	{
		slug: 'master-programmatic-seo',
		hero: {
			query: 'developer data grid code monitor',
			alt: 'Developer workspace with structured data and code on screen',
		},
	},
	{
		slug: 'what-is-generative-engine-optimization-geo',
		hero: {
			query: 'abstract neural network technology',
			alt: 'Abstract network visual representing generative search systems',
		},
	},
	{
		slug: 'build-a-topic-cluster',
		hero: {
			query: 'strategy whiteboard connected notes',
			alt: 'Strategy board with connected notes representing a topic cluster',
		},
	},
	{
		slug: 'user-intent-for-better-seo',
		hero: {
			query: 'search analytics person thinking',
			alt: 'Search strategist reviewing intent and analytics on screen',
		},
	},
];

async function ensureDir(dirPath) {
	await fs.mkdir(dirPath, { recursive: true });
}

async function fetchPexelsPhoto(query) {
	const url = new URL('https://api.pexels.com/v1/search');
	url.searchParams.set('query', query);
	url.searchParams.set('per_page', '1');
	url.searchParams.set('orientation', 'landscape');
	url.searchParams.set('size', 'large');

	const response = await fetch(url, {
		headers: {
			Authorization: PEXELS_API_KEY,
		},
	});

	if (!response.ok) {
		throw new Error(`Pexels request failed: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	const photo = data.photos?.[0];

	if (!photo) {
		throw new Error(`No Pexels photo found for query "${query}"`);
	}

	return photo;
}

async function downloadBuffer(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
	}

	return Buffer.from(await response.arrayBuffer());
}

async function optimizeImage(buffer, targetWidth, targetHeight) {
	let lastBuffer = buffer;

	for (const quality of [82, 76, 70, 64, 58, 52]) {
		const output = await sharp(buffer)
			.rotate()
			.resize(targetWidth, targetHeight, {
				fit: 'cover',
				position: 'entropy',
				withoutEnlargement: true,
			})
			.webp({ quality })
			.toBuffer();

		lastBuffer = output;

		if (output.byteLength <= 300 * 1024) {
			return output;
		}
	}

	return lastBuffer;
}

async function writeAsset({ slug, kind, index = 0, buffer }) {
	const suffix = kind === 'hero' ? 'hero' : `inline-${index + 1}`;
	const filename = `${slug}-${suffix}.webp`;
	const filepath = path.join(OUTPUT_DIR, filename);
	await fs.writeFile(filepath, buffer);
	return `/images/posts/${filename}`;
}

function buildCredit(photo, src, alt, bytes) {
	return {
		src,
		alt,
		photographer: photo.photographer,
		photographerUrl: photo.photographer_url,
		sourceName: 'Pexels',
		sourceUrl: photo.url,
		width: 1200,
		height: 675,
		bytes,
	};
}

async function processAsset(slug, kind, config, index = 0) {
	const photo = await fetchPexelsPhoto(config.query);
	const assetUrl = photo.src.landscape || photo.src.large || photo.src.original;
	const sourceBuffer = await downloadBuffer(assetUrl);
	const optimizedBuffer = await optimizeImage(sourceBuffer, 1200, 675);
	const src = await writeAsset({ slug, kind, index, buffer: optimizedBuffer });
	return buildCredit(photo, src, config.alt, optimizedBuffer.byteLength);
}

async function run() {
	await ensureDir(OUTPUT_DIR);

	const manifest = {};

	for (const request of imageRequests) {
		const hero = await processAsset(request.slug, 'hero', request.hero);
		const inline = [];

		for (const [index, item] of (request.inline ?? []).entries()) {
			inline.push(await processAsset(request.slug, 'inline', item, index));
		}

		manifest[request.slug] = {
			hero,
			inline,
		};
	}

	await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
	console.log(`Saved ${Object.keys(manifest).length} image entries to ${MANIFEST_PATH}`);
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
