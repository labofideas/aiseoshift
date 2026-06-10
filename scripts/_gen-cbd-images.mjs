import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts';
const MANIFEST = 'src/data/image-manifest.json';
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const slug = 'cbd-ai-seo';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${NAVY1}"/><stop offset="100%" stop-color="${NAVY2}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUSTD}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1080" cy="600" r="260" fill="${RUSTD}" opacity="0.05"/>
  <rect x="0" y="0" width="7" height="675" fill="url(#ac)"/>
  <rect x="80" y="120" width="84" height="5" fill="${RUSTD}" rx="2"/>
  <text x="80" y="158" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">CBD &amp; HEMP</text>
  <text x="80" y="300" font-family="Georgia, serif" font-size="80" font-weight="700" fill="${CREAMD}" letter-spacing="-2">
    <tspan x="80" dy="0">CBD AI SEO</tspan>
  </text>
  <text x="80" y="390" font-family="Georgia, serif" font-size="30" fill="${CREAMD}" opacity="0.72">
    <tspan x="80" dy="0">No ads. AI trusts few brands.</tspan>
    <tspan x="80" dy="42">Become the one it recommends.</tspan>
  </text>
  <line x1="80" y1="560" x2="320" y2="560" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="602" font-family="Arial, sans-serif" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;

const bars = [['2024', 10], ['2025', 12], ['2026', 24.6], ['2028 (proj.)', 47]];
const top = 210, rowH = 66, bottom = 90;
const H = top + bars.length * rowH + bottom;
const barX = 360, barMaxW = 620;
const max = Math.max(...bars.map((b) => b[1]));
const rows = bars.map(([label, val], i) => {
  const y = top + i * rowH;
  const w = Math.max(6, (val / max) * barMaxW);
  return `
    <text x="60" y="${y + 30}" font-family="Arial, sans-serif" font-size="24" fill="${NAVY}">${esc(label)}</text>
    <rect x="${barX}" y="${y + 10}" width="${w}" height="30" rx="6" fill="${RUST}"/>
    <text x="${barX + w + 14}" y="${y + 32}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${NAVY}">$${val}B</text>`;
}).join('');
const info = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">THE OPPORTUNITY</text>
  <text x="60" y="150" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${NAVY}">Global CBD market size</text>
  ${rows}
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">Indicative, 2026. Estimates vary by source.</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;

await sharp(Buffer.from(hero)).webp({ quality: 88 }).toFile(`${OUT}/${slug}-hero.webp`);
await sharp(Buffer.from(info)).webp({ quality: 90 }).toFile(`${OUT}/${slug}-infographic.webp`);

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
manifest[slug] = {
  hero: {
    src: `/images/posts/${slug}-hero.webp`,
    alt: 'CBD AI SEO: no ads, AI trusts few brands, become the one it recommends — AISEOShift',
    width: 1200,
    height: 675,
    bytes: statSync(`${OUT}/${slug}-hero.webp`).size,
  },
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('done');
