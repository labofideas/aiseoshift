// Inline price chart for best-ai-visibility-tools-2026. Run: node scripts/_gen-ai-visibility-tools-image.mjs
import sharp from 'sharp';

const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', RUST2 = '#e8834f', GRAY = '#6b6b6b';
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, serif';

// [tool, monthly entry price or null, label]
const rows = [
  ['AthenaHQ', 0, 'Free plan'],
  ['Otterly.ai', 29, '$29'],
  ['Peec AI', 95, '$95'],
  ['SE Visible', 99, '$99'],
  ['Rankscale', 99, '$99'],
  ['Trakkr', 100, '$100'],
  ['Searchable', 125, '$125'],
  ['Mentionova', 125, '$125'],
  ['Semrush One Starter', 199, '$199'],
  ['Scrunch', 250, 'from $250'],
  ['Ahrefs Brand Radar', null, '$50 add-on + Ahrefs plan'],
  ['Profound', null, 'Custom (enterprise)'],
];

const top = 200, rowH = 54, H = top + rows.length * rowH + 90;
const barX = 420, barMaxW = 560, max = 250;
const body = rows.map(([name, v, label], i) => {
  const y = top + i * rowH;
  const bar = v === null ? '' : `<rect x="${barX}" y="${y + 8}" width="${Math.max(8, (v / max) * barMaxW)}" height="28" rx="5" fill="${RUST}"/>`;
  const lx = v === null ? barX : barX + Math.max(8, (v / max) * barMaxW) + 14;
  return `<text x="60" y="${y + 30}" font-family="${SANS}" font-size="22" font-weight="700" fill="${NAVY}">${name}</text>${bar}
  <text x="${lx}" y="${y + 30}" font-family="${SANS}" font-size="21" font-weight="${v === null ? 400 : 700}" fill="${v === null ? GRAY : NAVY}">${label}</text>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">AI VISIBILITY TOOLS, OCTOBER 2026</text>
  <text x="60" y="150" font-family="${SERIF}" font-size="40" font-weight="700" fill="${NAVY}">Monthly entry price for ongoing tracking</text>
  ${body}
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="${SANS}" font-size="18" fill="${GRAY}">Monthly list prices from vendor pages. Annual billing is usually about 15% less.</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="${SANS}" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile('public/images/posts/best-ai-visibility-tools-2026-prices.webp');
console.log('ok');
