// Hero + inline graphics for dots-vs-muse-vs-grok-bot-vs-gemini-spark. Run: node scripts/_gen-agents-comparison-images.mjs
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts';
const MANIFEST = 'src/data/image-manifest.json';
const SLUG = 'dots-vs-muse-vs-grok-bot-vs-gemini-spark';

const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, serif';

const AGENTS = [
  { name: 'Gemini Spark', by: 'Google' },
  { name: 'Grok Bot', by: 'xAI' },
  { name: 'Muse', by: 'Meta' },
  { name: 'dots', by: 'OpenAI' },
];

const footer = (H, note) => `
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="${SANS}" font-size="18" fill="${GRAY}">${note}</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="${SANS}" font-size="18" fill="${GRAY}">aiseoshift.com</text>`;

const lightFrame = (H, kicker, title, body, note) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">${kicker}</text>
  <text x="60" y="150" font-family="${SERIF}" font-size="40" font-weight="700" fill="${NAVY}">${title}</text>
  ${body}
  ${footer(H, note)}
</svg>`;

function hero() {
  const chips = AGENTS.map((a, i) => {
    const x = 80 + i * 262;
    return `<rect x="${x}" y="430" width="240" height="96" rx="10" fill="${CREAMD}" fill-opacity="${i === 3 ? 0.14 : 0.07}" stroke="${RUSTD}" stroke-opacity="0.35"/>
    <text x="${x + 22}" y="472" font-family="${SERIF}" font-size="26" font-weight="700" fill="${CREAMD}">${a.name}</text>
    <text x="${x + 22}" y="504" font-family="${SANS}" font-size="17" letter-spacing="2" fill="${RUSTD}">${a.by.toUpperCase()}</text>`;
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
  <text x="80" y="148" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">ALWAYS-ON AI AGENTS, 2026</text>
  <text x="80" y="250" font-family="${SERIF}" font-size="72" font-weight="700" fill="${CREAMD}" letter-spacing="-2">Four agents with</text>
  <text x="80" y="338" font-family="${SERIF}" font-size="72" font-weight="700" fill="${CREAMD}" letter-spacing="-2">their own computer</text>
  ${chips}
  <line x1="80" y1="580" x2="320" y2="580" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="620" font-family="${SANS}" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;
}

function timeline() {
  const H = 520, y = 300, x0 = 160, x1 = 1060;
  // Day offsets from May 19 to Sep 29 (133 days) keep the spacing honest.
  const events = [
    ['May 19', 'Gemini Spark', 'Google I/O', 0],
    ['Aug 11', 'Grok Bot', 'beta launch', 84],
    ['Sep 8', 'Muse', 'US launch', 112],
    ['Sep 29', 'dots', 'OpenAI DevDay', 133],
  ];
  const pts = events.map(([date, name, sub, d], i) => {
    const x = x0 + (d / 133) * (x1 - x0);
    const up = i % 2 === 0;
    const ty = up ? y - 70 : y + 70;
    return `<circle cx="${x}" cy="${y}" r="13" fill="${i === 3 ? NAVY : RUST}"/>
    <line x1="${x}" y1="${y + (up ? -13 : 13)}" x2="${x}" y2="${up ? y - 46 : y + 46}" stroke="${RUST}" stroke-width="2" opacity="0.6"/>
    <text x="${x}" y="${ty - (up ? 40 : -6)}" text-anchor="middle" font-family="${SANS}" font-size="18" font-weight="700" letter-spacing="2" fill="${RUST}">${date.toUpperCase()}</text>
    <text x="${x}" y="${ty - (up ? 8 : -38)}" text-anchor="middle" font-family="${SERIF}" font-size="28" font-weight="700" fill="${NAVY}">${name}</text>
    <text x="${x}" y="${ty + (up ? 18 : 64)}" text-anchor="middle" font-family="${SANS}" font-size="18" fill="${GRAY}">${sub}</text>`;
  }).join('');
  const body = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${NAVY}" stroke-width="3" opacity="0.25"/>${pts}`;
  return lightFrame(H, 'LAUNCH TIMELINE, 2026', 'Four launches in 133 days', body, 'Public launch or beta dates.');
}

function prices() {
  const bars = [
    ['Meta Muse', 'free tier', 0, 'Free'],
    ['Gemini Spark', 'Google AI Pro', 19.99, '$19.99'],
    ['Grok Bot', 'SuperGrok', 30, '$30'],
    ['OpenAI dots', 'Business Premium, per seat, annual', 100, '$100'],
  ];
  const top = 210, rowH = 78, H = top + bars.length * rowH + 90;
  const barX = 560, barMaxW = 460;
  const rows = bars.map(([name, plan, v, disp], i) => {
    const yy = top + i * rowH, w = Math.max(8, (v / 100) * barMaxW);
    return `<text x="60" y="${yy + 26}" font-family="${SANS}" font-size="24" font-weight="700" fill="${NAVY}">${name}</text>
    <text x="60" y="${yy + 52}" font-family="${SANS}" font-size="17" fill="${GRAY}">${plan}</text>
    <rect x="${barX}" y="${yy + 12}" width="${w}" height="32" rx="6" fill="${RUST}"/>
    <text x="${barX + w + 14}" y="${yy + 36}" font-family="${SANS}" font-size="24" font-weight="700" fill="${NAVY}">${disp}</text>`;
  }).join('');
  return lightFrame(H, 'CHEAPEST WAY IN', 'Monthly price of the cheapest plan that includes it', rows, 'US pricing, October 2026. Check each vendor before paying.');
}

function picker() {
  const rows = [
    ['Your own life, on WhatsApp', 'Meta Muse'],
    ['Gmail, Docs and Calendar', 'Gemini Spark'],
    ['A team of agents, or code', 'Grok Bot'],
    ['ChatGPT Pro, Slack or Teams', 'OpenAI dots'],
  ];
  const top = 230, rowH = 92, H = top + rows.length * rowH + 90;
  const body = `<text x="60" y="${top - 8}" font-family="${SANS}" font-size="18" letter-spacing="2" fill="${GRAY}">IF YOUR DAY RUNS ON...</text>
  <text x="760" y="${top - 8}" font-family="${SANS}" font-size="18" letter-spacing="2" fill="${GRAY}">PICK</text>` +
    rows.map(([need, pick], i) => {
      const yy = top + 14 + i * rowH;
      return `<rect x="60" y="${yy}" width="600" height="70" rx="10" fill="${NAVY}" fill-opacity="0.05"/>
      <text x="88" y="${yy + 44}" font-family="${SANS}" font-size="25" fill="${NAVY}">${need}</text>
      <path d="M680 ${yy + 35} h50 m-14 -12 l14 12 l-14 12" stroke="${RUST}" stroke-width="3" fill="none"/>
      <rect x="750" y="${yy}" width="390" height="70" rx="10" fill="${i === 3 ? NAVY : RUST}"/>
      <text x="778" y="${yy + 46}" font-family="${SERIF}" font-size="30" font-weight="700" fill="${CREAM}">${pick}</text>`;
    }).join('');
  return lightFrame(H, 'WHICH ONE TO USE', 'Pick by where your day already happens', body, 'In the UK or EU? Grok Bot is the only one without announced limits.');
}

const images = [
  ['hero', hero(), 88],
  ['timeline', timeline(), 90],
  ['prices', prices(), 90],
  ['picker', picker(), 90],
];
for (const [name, svg, q] of images) {
  await sharp(Buffer.from(svg)).webp({ quality: q }).toFile(`${OUT}/${SLUG}-${name}.webp`);
  console.log('ok', name);
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const heroPath = `${OUT}/${SLUG}-hero.webp`;
manifest[SLUG] = {
  ...(manifest[SLUG] || {}),
  hero: {
    src: `/images/posts/${SLUG}-hero.webp`,
    alt: 'OpenAI dots, Meta Muse, Grok Bot and Gemini Spark compared: four always-on AI agents with their own computer',
    width: 1200,
    height: 675,
    bytes: statSync(heroPath).size,
  },
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('manifest updated');
