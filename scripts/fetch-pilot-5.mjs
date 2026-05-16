import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const KEY = process.env.PEXELS_API_KEY;
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'images', 'posts');
const MANIFEST = path.join(ROOT, 'src', 'data', 'image-manifest.json');

const reqs = [
	{ slug: 'ai-tools-for-lawyers', query: 'lawyer office desk law books', alt: 'Lawyer working with legal documents at an office desk' },
	{ slug: 'ai-tools-for-doctors', query: 'doctor stethoscope laptop medical', alt: 'Doctor reviewing patient information on a laptop' },
	{ slug: 'ai-tools-for-real-estate-agents', query: 'real estate agent house keys home', alt: 'Real estate agent with house keys representing modern property sales' },
	{ slug: 'ai-tools-for-accountants', query: 'accountant calculator financial reports', alt: 'Accountant reviewing financial reports with a calculator' },
	{ slug: 'ai-tools-for-sales-reps', query: 'sales professional laptop call business', alt: 'Sales professional on a call with a laptop and business notes' },
];

async function fetchPhoto(q) {
	const u = new URL('https://api.pexels.com/v1/search');
	u.searchParams.set('query', q); u.searchParams.set('per_page','1');
	u.searchParams.set('orientation','landscape'); u.searchParams.set('size','large');
	const r = await fetch(u, { headers: { Authorization: KEY } });
	const d = await r.json(); if (!d.photos?.[0]) throw new Error(`no photo: ${q}`); return d.photos[0];
}
async function dl(url) { const r = await fetch(url); return Buffer.from(await r.arrayBuffer()); }
async function opt(b) {
	let last = b;
	for (const q of [82,76,70,64,58,52]) {
		const out = await sharp(b).rotate().resize(1200,675,{fit:'cover',position:'entropy',withoutEnlargement:true}).webp({quality:q}).toBuffer();
		last = out; if (out.byteLength <= 300*1024) return out;
	}
	return last;
}

const existing = JSON.parse(await fs.readFile(MANIFEST,'utf8'));
const merged = {...existing};
for (const r of reqs) {
	try {
		console.log(`→ ${r.slug}: "${r.query}"`);
		const p = await fetchPhoto(r.query);
		const buf = await dl(p.src.landscape || p.src.large);
		const o = await opt(buf);
		const fn = `${r.slug}-hero.webp`;
		await fs.writeFile(path.join(OUT, fn), o);
		merged[r.slug] = { ...(merged[r.slug]||{}), hero: { src:`/images/posts/${fn}`, alt:r.alt, photographer:p.photographer, photographerUrl:p.photographer_url, sourceName:'Pexels', sourceUrl:p.url, width:1200, height:675, bytes:o.byteLength }};
		console.log(`  ✓ ${(o.byteLength/1024).toFixed(1)}KB by ${p.photographer}`);
	} catch (e) { console.error(`  ✗ ${e.message}`); }
}
await fs.writeFile(MANIFEST, JSON.stringify(merged, null, '\t') + '\n');
console.log('Done');
