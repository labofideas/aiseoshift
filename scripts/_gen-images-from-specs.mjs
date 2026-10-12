// Render hero + inline images from JSON specs: node scripts/_gen-images-from-specs.mjs <specDir> [slug...]
// Spec shape: {slug, hero:{kicker,l1,l2,sub}, alt, inline:{kicker,title,cards:[{t,sub,lines,foot}],note}}
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { hero, cards } from './lib/post-image-templates.mjs';

const [dir, ...only] = process.argv.slice(2);
const OUT = 'public/images/posts', MANIFEST = 'src/data/image-manifest.json';
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
for (const f of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
  const s = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  if (only.length && !only.includes(s.slug)) continue;
  const heroPath = `${OUT}/${s.slug}-hero.webp`;
  await sharp(Buffer.from(hero(s.hero))).webp({ quality: 88 }).toFile(heroPath);
  const c = s.inline.cards.map((x) => ({ t: x.t, sub: x.sub, lines: x.lines || [], foot: x.foot || [] }));
  await sharp(Buffer.from(cards(s.inline.kicker, s.inline.title, c, s.inline.note))).webp({ quality: 90 }).toFile(`${OUT}/${s.slug}-inline.webp`);
  manifest[s.slug] = { ...(manifest[s.slug] || {}), hero: { src: `/images/posts/${s.slug}-hero.webp`, alt: s.alt, width: 1200, height: 675, bytes: statSync(heroPath).size } };
  console.log('ok', s.slug);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
