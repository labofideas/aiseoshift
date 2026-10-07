// Hero + inline graphic for best-chatgpt-rank-tracker. Run: node scripts/_gen-chatgpt-tracker-images.mjs
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts', MANIFEST = 'src/data/image-manifest.json', SLUG = 'best-chatgpt-rank-tracker';
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, serif';

function hero() {
  const stats = [['Mentions', 'Are you named?'], ['Citations', 'Are you linked?'], ['Position', 'First or fifth?']];
  const chips = stats.map(([a, b], i) => {
    const x = 80 + i * 300;
    return `<rect x="${x}" y="420" width="276" height="100" rx="10" fill="${CREAMD}" fill-opacity="0.07" stroke="${RUSTD}" stroke-opacity="0.35"/>
    <text x="${x + 24}" y="462" font-family="${SERIF}" font-size="30" font-weight="700" fill="${CREAMD}">${a}</text>
    <text x="${x + 24}" y="496" font-family="${SANS}" font-size="18" fill="${RUSTD}">${b}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${NAVY1}"/><stop offset="100%" stop-color="${NAVY2}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUSTD}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="260" fill="${RUSTD}" opacity="0.05"/>
  <rect x="0" y="0" width="7" height="675" fill="url(#ac)"/>
  <rect x="80" y="110" width="84" height="5" fill="${RUSTD}" rx="2"/>
  <text x="80" y="148" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">CHATGPT RANK TRACKING, 2026</text>
  <text x="80" y="250" font-family="${SERIF}" font-size="76" font-weight="700" fill="${CREAMD}" letter-spacing="-2">Best ChatGPT</text>
  <text x="80" y="340" font-family="${SERIF}" font-size="76" font-weight="700" fill="${CREAMD}" letter-spacing="-2">Rank Trackers</text>
  ${chips}
  <line x1="80" y1="580" x2="320" y2="580" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="620" font-family="${SANS}" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;
}

function factors() {
  const items = [
    ['Memory', 'Logged-in users get', 'answers shaped by', 'their chat history'],
    ['Live search', 'Some answers cite', 'sources, others come', 'from training data'],
    ['Location', 'Local questions', 'change with where', 'the user is'],
    ['The model', 'Answers are sampled', 'and shift between', 'runs and updates'],
  ];
  const W = 255, gap = 20, top = 200, H = 560;
  const cards = items.map(([t, ...lines], i) => {
    const x = 60 + i * (W + gap);
    return `<rect x="${x}" y="${top}" width="${W}" height="230" rx="12" fill="${i === 3 ? NAVY : NAVY}" fill-opacity="${i === 3 ? 1 : 0.05}"/>
    <text x="${x + 24}" y="${top + 56}" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="2" fill="${RUST}">0${i + 1}</text>
    <text x="${x + 24}" y="${top + 104}" font-family="${SERIF}" font-size="32" font-weight="700" fill="${i === 3 ? CREAM : NAVY}">${t}</text>
    ${lines.map((l, j) => `<text x="${x + 24}" y="${top + 148 + j * 26}" font-family="${SANS}" font-size="18" fill="${i === 3 ? CREAMD : GRAY}">${l}</text>`).join('')}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">WHY CHATGPT IS HARD TO TRACK</text>
  <text x="60" y="150" font-family="${SERIF}" font-size="40" font-weight="700" fill="${NAVY}">Four things that change the answer</text>
  ${cards}
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="${SANS}" font-size="18" fill="${GRAY}">Good trackers repeat prompts daily, test logged out and report rates, not single answers.</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="${SANS}" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;
}

await sharp(Buffer.from(hero())).webp({ quality: 88 }).toFile(`${OUT}/${SLUG}-hero.webp`);
await sharp(Buffer.from(factors())).webp({ quality: 90 }).toFile(`${OUT}/${SLUG}-factors.webp`);
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
manifest[SLUG] = { ...(manifest[SLUG] || {}), hero: {
  src: `/images/posts/${SLUG}-hero.webp`,
  alt: 'Best ChatGPT rank trackers in 2026: tools that track mentions, citations and position in ChatGPT answers',
  width: 1200, height: 675, bytes: statSync(`${OUT}/${SLUG}-hero.webp`).size,
} };
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('ok');
