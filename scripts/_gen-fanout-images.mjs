import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts';
const MANIFEST = 'src/data/image-manifest.json';
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const slug = 'google-trends-ai-fanout-data';

const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${NAVY1}"/><stop offset="100%" stop-color="${NAVY2}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUSTD}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1080" cy="600" r="260" fill="${RUSTD}" opacity="0.05"/>
  <rect x="0" y="0" width="7" height="675" fill="url(#ac)"/>
  <rect x="80" y="120" width="84" height="5" fill="${RUSTD}" rx="2"/>
  <text x="80" y="158" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">SEO NEWS</text>
  <text x="80" y="300" font-family="Georgia, serif" font-size="78" font-weight="700" fill="${CREAMD}" letter-spacing="-2">
    <tspan x="80" dy="0">Google Trends</tspan>
    <tspan x="80" dy="92">Is Breaking</tspan>
  </text>
  <text x="80" y="470" font-family="Georgia, serif" font-size="30" fill="${CREAMD}" opacity="0.7">AI fan-out queries are polluting search data.</text>
  <line x1="80" y1="560" x2="320" y2="560" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="602" font-family="Arial, sans-serif" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;

// Fan-out diagram: one human query → many machine sub-queries
const info = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="640" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="80" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">QUERY FAN-OUT</text>
  <text x="60" y="132" font-family="Georgia, serif" font-size="38" font-weight="700" fill="${NAVY}">One human question, many machine searches</text>

  <!-- human query box -->
  <rect x="60" y="250" width="360" height="120" rx="16" fill="${NAVY}"/>
  <text x="240" y="296" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="2" fill="${RUST2}">1 HUMAN ASKS AI</text>
  <text x="240" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="21" font-style="italic" fill="${CREAMD}">"what helps post-run</text>
  <text x="240" y="356" text-anchor="middle" font-family="Georgia, serif" font-size="21" font-style="italic" fill="${CREAMD}">joint pain?"</text>

  <!-- fan lines -->
  ${[210, 270, 330, 390, 450].map((y) => `<path d="M 420 310 C 520 310, 540 ${y + 30}, 620 ${y + 30}" stroke="${RUST}" stroke-width="2.5" fill="none" opacity="0.7"/>`).join('')}

  <!-- machine sub-queries -->
  ${[
    ['protein powder recovery', 210],
    ['cbd cream for joints', 270],
    ['best running shoes knee pain', 330],
    ['seo... and other retrievals', 390],
    ['+ more background sub-queries', 450],
  ].map(([t, y]) => `
  <rect x="620" y="${y}" width="520" height="60" rx="12" fill="#ffffff" stroke="${RUST}" stroke-width="1.5"/>
  <text x="650" y="${y + 38}" font-family="DM Mono, Courier New, monospace" font-size="21" fill="${NAVY}">${t}</text>`).join('')}

  <text x="60" y="560" font-family="Arial, sans-serif" font-size="21" fill="${GRAY}">Machine sub-queries appear to be counted in Google Trends alongside human searches.</text>
  <line x1="60" y1="585" x2="1140" y2="585" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="615" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">Illustrative, June 2026.</text>
  <text x="1140" y="615" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;

await sharp(Buffer.from(hero)).webp({ quality: 88 }).toFile(`${OUT}/${slug}-hero.webp`);
await sharp(Buffer.from(info)).webp({ quality: 90 }).toFile(`${OUT}/${slug}-infographic.webp`);

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
manifest[slug] = {
  hero: {
    src: `/images/posts/${slug}-hero.webp`,
    alt: 'Google Trends is breaking: AI fan-out queries are polluting search data — AISEOShift',
    width: 1200,
    height: 675,
    bytes: statSync(`${OUT}/${slug}-hero.webp`).size,
  },
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('done');
