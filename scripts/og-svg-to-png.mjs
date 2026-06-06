/**
 * Post-build script: converts every /og/*.svg in dist/client into a sibling .png.
 * Runs after `astro build` so the SVG prerendered files already exist.
 * Sharp runs in plain Node.js (not Cloudflare Workers) so native binaries work fine.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const OG_DIR = 'dist/client/og';

async function findSvgs(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const results = [];
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...(await findSvgs(fullPath)));
		} else if (entry.isFile() && entry.name.endsWith('.svg')) {
			results.push(fullPath);
		}
	}
	return results;
}

async function run() {
	let svgFiles;
	try {
		svgFiles = await findSvgs(OG_DIR);
	} catch {
		console.warn(`[og-svg-to-png] ${OG_DIR} not found — skipping.`);
		return;
	}

	let converted = 0;
	let failed = 0;

	await Promise.all(
		svgFiles.map(async (svgPath) => {
			const pngPath = svgPath.replace(/\.svg$/, '.png');
			try {
				const svg = readFileSync(svgPath);
				const png = await sharp(svg).png({ compressionLevel: 9 }).toBuffer();
				writeFileSync(pngPath, png);
				converted++;
			} catch (err) {
				console.error(`[og-svg-to-png] Failed ${relative('.', svgPath)}: ${err.message}`);
				failed++;
			}
		}),
	);

	console.log(`[og-svg-to-png] Converted ${converted} SVG → PNG${failed ? `, ${failed} failed` : ''}.`);
}

run().catch((err) => {
	console.error('[og-svg-to-png] Fatal:', err);
	process.exit(1);
});
