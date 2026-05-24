import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const posts = [
	{
		slug: 'seo-authority-not-rankings',
		title: 'SEO Is Not About\nRankings Anymore.\nIt Is About Authority.',
		category: 'STRATEGY',
		site: 'AISEOShift',
	},
];

function generateHeroSVG({ title, category, site }) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#1a1e2e"/>
			<stop offset="100%" stop-color="#0f1219"/>
		</linearGradient>
		<linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="#d96a3a"/>
			<stop offset="100%" stop-color="#e8834f"/>
		</linearGradient>
	</defs>
	<rect width="1200" height="675" fill="url(#bg)"/>
	<rect x="0" y="0" width="6" height="675" fill="url(#accent)"/>
	<rect x="60" y="60" width="80" height="4" fill="#d96a3a" rx="2"/>
	<text x="60" y="90" font-family="Georgia, serif" font-size="14" font-weight="700" letter-spacing="3" fill="#d96a3a">${category}</text>
	<text x="60" y="180" font-family="Georgia, serif" font-size="58" font-weight="700" fill="#e4e2dc" letter-spacing="-2">
		${title.split('\n').map((line, i) => `<tspan x="60" dy="${i === 0 ? 0 : 72}">${line}</tspan>`).join('')}
	</text>
	<line x1="60" y1="520" x2="300" y2="520" stroke="#d96a3a" stroke-width="1" opacity="0.4"/>
	<text x="60" y="555" font-family="Georgia, serif" font-size="22" font-weight="400" fill="#e4e2dc" opacity="0.6">${site}</text>
	<text x="60" y="585" font-family="Arial, sans-serif" font-size="14" fill="#e4e2dc" opacity="0.35">aiseoshift.com</text>
	<circle cx="1100" cy="600" r="200" fill="#d96a3a" opacity="0.04"/>
	<circle cx="1050" cy="550" r="120" fill="#e8834f" opacity="0.03"/>
</svg>`;
}

function generateOGSVG({ title, category, site }) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#1a1e2e"/>
			<stop offset="100%" stop-color="#0f1219"/>
		</linearGradient>
	</defs>
	<rect width="1200" height="630" fill="url(#bg)"/>
	<rect x="0" y="0" width="1200" height="5" fill="#d96a3a"/>
	<text x="80" y="80" font-family="Georgia, serif" font-size="13" font-weight="700" letter-spacing="3" fill="#d96a3a">${category}</text>
	<text x="80" y="170" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#e4e2dc" letter-spacing="-1.5">
		${title.split('\n').map((line, i) => `<tspan x="80" dy="${i === 0 ? 0 : 66}">${line}</tspan>`).join('')}
	</text>
	<rect x="80" y="480" width="60" height="3" fill="#d96a3a" rx="1.5"/>
	<text x="80" y="520" font-family="Georgia, serif" font-size="20" fill="#e4e2dc" opacity="0.7">${site}</text>
	<text x="80" y="550" font-family="Arial, sans-serif" font-size="13" fill="#e4e2dc" opacity="0.35">aiseoshift.com</text>
	<text x="1120" y="550" font-family="Georgia, serif" font-size="13" fill="#d96a3a" opacity="0.5" text-anchor="end">AI SEO &amp; Visibility</text>
</svg>`;
}

async function run() {
	for (const post of posts) {
		const heroSVG = generateHeroSVG(post);
		const ogSVG = generateOGSVG(post);

		const heroPath = `public/images/posts/${post.slug}-hero.webp`;
		const ogPath = `public/images/posts/${post.slug}-og.webp`;

		await sharp(Buffer.from(heroSVG))
			.resize(1200, 675)
			.webp({ quality: 90 })
			.toFile(heroPath);
		console.log(`Hero: ${heroPath}`);

		await sharp(Buffer.from(ogSVG))
			.resize(1200, 630)
			.webp({ quality: 90 })
			.toFile(ogPath);
		console.log(`OG:   ${ogPath}`);
	}
	console.log('Done!');
}

run().catch(console.error);
