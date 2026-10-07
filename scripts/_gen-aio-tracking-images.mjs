// Hero + inline graphic for ai-overview-tracking-tools. Run: node scripts/_gen-aio-tracking-images.mjs
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts', MANIFEST = 'src/data/image-manifest.json', SLUG = 'ai-overview-tracking-tools';
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, serif';

function hero() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${NAVY1}"/><stop offset="100%" stop-color="${NAVY2}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUSTD}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="260" fill="${RUSTD}" opacity="0.05"/>
  <rect x="0" y="0" width="7" height="675" fill="url(#ac)"/>
  <rect x="80" y="110" width="84" height="5" fill="${RUSTD}" rx="2"/>
  <text x="80" y="148" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">GOOGLE AI OVERVIEWS, 2026</text>
  <text x="80" y="250" font-family="${SERIF}" font-size="72" font-weight="700" fill="${CREAMD}" letter-spacing="-2">It appeared.</text>
  <text x="80" y="338" font-family="${SERIF}" font-size="72" font-weight="700" fill="${RUSTD}" letter-spacing="-2">Were you in it?</text>
  <text x="80" y="420" font-family="${SANS}" font-size="26" fill="${CREAMD}" opacity="0.8">12 AI Overview tracking tools compared</text>
  <line x1="80" y1="580" x2="320" y2="580" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="620" font-family="${SANS}" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;
}

function types() {
  const H = 600, top = 200, W = 520;
  const col = (x, dark, title, sub, lines, tools) => `
  <rect x="${x}" y="${top}" width="${W}" height="300" rx="14" fill="${NAVY}" fill-opacity="${dark ? 1 : 0.05}"/>
  <text x="${x + 32}" y="${top + 56}" font-family="${SERIF}" font-size="32" font-weight="700" fill="${dark ? CREAM : NAVY}">${title}</text>
  <text x="${x + 32}" y="${top + 90}" font-family="${SANS}" font-size="18" font-weight="700" letter-spacing="2" fill="${RUST}">${sub}</text>
  ${lines.map((l, i) => `<text x="${x + 32}" y="${top + 140 + i * 30}" font-family="${SANS}" font-size="20" fill="${dark ? CREAMD : NAVY}">${l}</text>`).join('')}
  <text x="${x + 32}" y="${top + 268}" font-family="${SANS}" font-size="17" fill="${dark ? CREAMD : GRAY}" opacity="0.85">${tools}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">TWO WAYS TO TRACK AI OVERVIEWS</text>
  <text x="60" y="150" font-family="${SERIF}" font-size="40" font-weight="700" fill="${NAVY}">Keywords or prompts?</text>
  ${col(60, false, 'Rank trackers', 'TRACK KEYWORDS', ['Short keywords you already track', 'AI Overview as a SERP feature', 'Sits next to organic position'], 'Nightwatch, Semrush, SE Ranking, AWR')}
  ${col(620, true, 'AI visibility tools', 'TRACK PROMPTS', ['Longer, conversational questions', 'AI Overviews plus AI Mode, ChatGPT', 'Mentions, citations, share of voice'], 'SE Visible, Otterly.ai, Ahrefs Brand Radar')}
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="${SANS}" font-size="18" fill="${GRAY}">SEO teams usually want the first. Brand and content teams usually want the second.</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="${SANS}" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;
}

await sharp(Buffer.from(hero())).webp({ quality: 88 }).toFile(`${OUT}/${SLUG}-hero.webp`);
await sharp(Buffer.from(types())).webp({ quality: 90 }).toFile(`${OUT}/${SLUG}-types.webp`);
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
manifest[SLUG] = { ...(manifest[SLUG] || {}), hero: {
  src: `/images/posts/${SLUG}-hero.webp`,
  alt: 'Google AI Overview tracking tools compared: tools that show whether your page is cited in AI Overviews',
  width: 1200, height: 675, bytes: statSync(`${OUT}/${SLUG}-hero.webp`).size,
} };
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('ok');
