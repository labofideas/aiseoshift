import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) throw new Error('Missing PEXELS_API_KEY — set it in .env');

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'posts');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'image-manifest.json');

const imageRequests = [
	{
		slug: 'ai-citation-generators',
		hero: { query: 'research papers citations desk laptop', alt: 'Research workspace with citations and academic papers on screen' },
		inline: [{ query: 'student writing bibliography references', alt: 'Student organizing citations and references for academic work' }],
	},
	{
		slug: 'ai-content-detection-tools',
		hero: { query: 'AI analysis scanning document screen', alt: 'AI content analysis interface scanning text for authenticity' },
		inline: [{ query: 'editor reviewing content computer', alt: 'Editor reviewing content authenticity on computer screen' }],
	},
	{
		slug: 'ai-content-humanizers',
		hero: { query: 'writer editing text natural writing', alt: 'Writer refining and editing AI-generated text to sound natural' },
		inline: [{ query: 'creative writing desk notebook laptop', alt: 'Creative writing workspace with notebook and laptop' }],
	},
	{
		slug: 'ai-detection-tools-for-writers',
		hero: { query: 'writer checking document authenticity screen', alt: 'Writer using AI detection tools to verify content authenticity' },
		inline: [{ query: 'student laptop writing essay', alt: 'Student checking writing for AI detection before submission' }],
	},
	{
		slug: 'ai-grammar-checkers',
		hero: { query: 'proofreading editing text document', alt: 'Editor proofreading and checking grammar on a document' },
		inline: [{ query: 'typing keyboard writing professional', alt: 'Professional writer using grammar checking tools while typing' }],
	},
	{
		slug: 'ai-image-generators',
		hero: { query: 'digital art creation colorful abstract', alt: 'Colorful digital artwork representing AI image generation' },
		inline: [{ query: 'designer creating visuals computer', alt: 'Designer creating visual content with AI tools on screen' }],
	},
	{
		slug: 'ai-paraphrasing-tools',
		hero: { query: 'writing editing rewording document', alt: 'Writer rewording and paraphrasing content on screen' },
		inline: [{ query: 'content editor comparing text versions', alt: 'Content editor comparing original and paraphrased text versions' }],
	},
	{
		slug: 'ai-presentation-tools',
		hero: { query: 'presentation slides business meeting', alt: 'Professional presentation slides displayed in a business setting' },
		inline: [{ query: 'team reviewing presentation deck', alt: 'Team reviewing and refining presentation slides together' }],
	},
	{
		slug: 'ai-product-listing-tools',
		hero: { query: 'ecommerce products online shopping screen', alt: 'E-commerce product listings displayed on a screen' },
		inline: [{ query: 'online store product catalog', alt: 'Online store product catalog with optimized listings' }],
	},
	{
		slug: 'ai-summarizers',
		hero: { query: 'reading long document summary highlights', alt: 'Long document being condensed into key summary highlights' },
		inline: [{ query: 'person reading article tablet', alt: 'Person reading a summarized article on tablet device' }],
	},
	{
		slug: 'ai-translators',
		hero: { query: 'multilingual text translation global', alt: 'Multilingual text and translation interface for global communication' },
		inline: [{ query: 'international business communication laptop', alt: 'International business communication across languages on laptop' }],
	},
	{
		slug: 'plagiarism-checkers',
		hero: { query: 'document comparison text analysis screen', alt: 'Document comparison and text analysis for plagiarism detection' },
		inline: [{ query: 'academic integrity checking papers', alt: 'Academic papers being checked for originality and integrity' }],
	},
	{
		slug: 'best-ai-image-detectors-2026',
		hero: { query: 'AI image analysis detection scanning', alt: 'AI image analysis and detection scanning visual content' },
		inline: [{ query: 'photo verification authenticity check', alt: 'Photo being verified for authenticity and AI generation' }],
	},
	{
		slug: 'new-chatgpt-plans-2026',
		hero: { query: 'ChatGPT AI assistant interface screen', alt: 'AI chat assistant interface showing subscription and plan options' },
		inline: [{ query: 'pricing plans comparison business', alt: 'Business pricing plans comparison on screen' }],
	},
	{
		slug: 'claude-updates-march-april-2026',
		hero: { query: 'AI technology update release modern', alt: 'Modern AI technology interface representing model updates and releases' },
		inline: [{ query: 'software release changelog code screen', alt: 'Software release notes and changelog on developer screen' }],
	},
	{
		slug: '25-best-ai-website-builders',
		hero: { query: 'AI website builder design interface', alt: 'AI-powered website builder design interface on screen' },
		inline: [{ query: 'web design comparison tools dashboard', alt: 'Web design tools comparison dashboard' }],
	},
	{
		slug: 'claude-vs-chatgpt-battle-heats-up-april-2026',
		hero: { query: 'AI chatbot comparison technology', alt: 'AI chatbot comparison representing Claude vs ChatGPT competition' },
		inline: [{ query: 'technology competition innovation race', alt: 'Technology innovation race between competing AI platforms' }],
	},
	{
		slug: 'ai-news-daily-2026-03-25',
		hero: { query: 'news technology headlines digital', alt: 'Digital news headlines covering AI and technology updates' },
		inline: [{ query: 'breaking news AI technology screen', alt: 'Breaking AI technology news displayed on screen' }],
	},
	{
		slug: 'ai-weekly-roundup-2026-03-30',
		hero: { query: 'weekly news roundup technology summary', alt: 'Weekly AI news roundup and technology summary' },
		inline: [{ query: 'newsletter digest reading tablet', alt: 'Reading a weekly AI news digest on tablet' }],
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

	const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
	if (!response.ok) throw new Error(`Pexels request failed: ${response.status}`);

	const data = await response.json();
	const photo = data.photos?.[0];
	if (!photo) throw new Error(`No Pexels photo found for "${query}"`);
	return photo;
}

async function downloadBuffer(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Download failed: ${response.status}`);
	return Buffer.from(await response.arrayBuffer());
}

async function optimizeImage(buffer) {
	let lastBuffer = buffer;
	for (const quality of [82, 76, 70, 64, 58, 52]) {
		const output = await sharp(buffer)
			.rotate()
			.resize(1200, 675, { fit: 'cover', position: 'entropy', withoutEnlargement: true })
			.webp({ quality })
			.toBuffer();
		lastBuffer = output;
		if (output.byteLength <= 300 * 1024) return output;
	}
	return lastBuffer;
}

function buildCredit(photo, src, alt, bytes) {
	return {
		src, alt,
		photographer: photo.photographer,
		photographerUrl: photo.photographer_url,
		sourceName: 'Pexels',
		sourceUrl: photo.url,
		width: 1200, height: 675, bytes,
	};
}

async function processAsset(slug, kind, config, index = 0) {
	const suffix = kind === 'hero' ? 'hero' : `inline-${index + 1}`;
	const filename = `${slug}-${suffix}.webp`;
	const filepath = path.join(OUTPUT_DIR, filename);

	const photo = await fetchPexelsPhoto(config.query);
	const assetUrl = photo.src.landscape || photo.src.large || photo.src.original;
	const sourceBuffer = await downloadBuffer(assetUrl);
	const optimizedBuffer = await optimizeImage(sourceBuffer);
	await fs.writeFile(filepath, optimizedBuffer);
	console.log(`  ✓ ${filename} (${(optimizedBuffer.byteLength / 1024).toFixed(0)} KB)`);
	return buildCredit(photo, `/images/posts/${filename}`, config.alt, optimizedBuffer.byteLength);
}

async function run() {
	await ensureDir(OUTPUT_DIR);

	const existingManifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));

	for (const request of imageRequests) {
		console.log(`\nFetching images for: ${request.slug}`);
		try {
			const hero = await processAsset(request.slug, 'hero', request.hero);
			const inline = [];
			for (const [index, item] of (request.inline ?? []).entries()) {
				inline.push(await processAsset(request.slug, 'inline', item, index));
			}
			existingManifest[request.slug] = { hero, inline };
		} catch (err) {
			console.error(`  ✗ Failed for ${request.slug}: ${err.message}`);
		}
	}

	await fs.writeFile(MANIFEST_PATH, JSON.stringify(existingManifest, null, 2) + '\n');
	console.log(`\nDone! Updated ${imageRequests.length} entries in image-manifest.json`);
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
