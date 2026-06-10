import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts';
const MANIFEST = 'src/data/image-manifest.json';

const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const pages = [
  {
    slug: 'future-of-seo-ai-era',
    kicker: 'FUTURE OF SEARCH', heroLines: ['The Future of SEO', 'in the AI Era'],
    chartTitle: 'Searches that end without a click', unit: '%',
    bars: [['All Google searches', 43], ['With an AI Overview', 83], ['In Google AI Mode', 93]],
  },
  {
    slug: 'local-seo-2026-ai-overview-local-packs',
    kicker: 'LOCAL SEO', heroLines: ['Local SEO', 'in 2026'],
    chartTitle: 'What AI changed in local search', unit: '%',
    bars: [['AI Overviews on local queries', 68], ['GBP weight, traditional pack', 32], ['GBP weight, inside AI answers', 12]],
  },
  {
    slug: 'ai-metered-utility-future-of-seo',
    kicker: 'METERED INTELLIGENCE', heroLines: ['When Intelligence', 'Is Metered'],
    chartTitle: 'Generative AI chatbot market share', unit: '%',
    bars: [['ChatGPT', 54.7], ['Gemini', 27.4], ['Claude', 8.2]],
  },
  {
    slug: 'claude-fable-5-ai-search-seo',
    kicker: 'CLAUDE FABLE 5', heroLines: ['Claude Fable 5', 'and AI Search'],
    chartTitle: 'SWE-bench scores: Fable 5 vs Opus 4.8', unit: '%',
    bars: [['Fable 5 (Verified)', 95], ['Opus 4.8 (Verified)', 88.6], ['Fable 5 (Pro)', 80], ['Opus 4.8 (Pro)', 69.2]],
  },
];

function heroSVG(p) {
  const lines = p.heroLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 92}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${NAVY1}"/><stop offset="100%" stop-color="${NAVY2}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUSTD}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1080" cy="600" r="260" fill="${RUSTD}" opacity="0.05"/>
  <rect x="0" y="0" width="7" height="675" fill="url(#ac)"/>
  <rect x="80" y="120" width="84" height="5" fill="${RUSTD}" rx="2"/>
  <text x="80" y="158" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">${esc(p.kicker)}</text>
  <text x="80" y="300" font-family="Georgia, serif" font-size="80" font-weight="700" fill="${CREAMD}" letter-spacing="-2">${lines}</text>
  <line x1="80" y1="560" x2="320" y2="560" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="602" font-family="Arial, sans-serif" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;
}

function chartSVG(p) {
  const n = p.bars.length;
  const top = 210, rowH = 66, bottom = 90;
  const H = top + n * rowH + bottom;
  const labelX = 60, barX = 560, barMaxW = 480;
  const max = Math.max(...p.bars.map((b) => b[1]));
  const rows = p.bars.map(([label, val], i) => {
    const y = top + i * rowH;
    const w = Math.max(6, (val / max) * barMaxW);
    const disp = p.unit === '$' ? `$${val}` : `${val}%`;
    return `
    <text x="${labelX}" y="${y + 30}" font-family="Arial, sans-serif" font-size="22" fill="${NAVY}">${esc(label)}</text>
    <rect x="${barX}" y="${y + 10}" width="${w}" height="30" rx="6" fill="${RUST}"/>
    <text x="${barX + w + 14}" y="${y + 32}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${NAVY}">${disp}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">${esc(p.kicker)}</text>
  <text x="60" y="150" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${NAVY}">${esc(p.chartTitle)}</text>
  ${rows}
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">Indicative, 2026. Verify current figures.</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

for (const p of pages) {
  const heroPath = `${OUT}/${p.slug}-hero.webp`;
  const infoPath = `${OUT}/${p.slug}-infographic.webp`;
  await sharp(Buffer.from(heroSVG(p))).webp({ quality: 88 }).toFile(heroPath);
  await sharp(Buffer.from(chartSVG(p))).webp({ quality: 90 }).toFile(infoPath);
  manifest[p.slug] = {
    ...(manifest[p.slug] || {}),
    hero: {
      src: `/images/posts/${p.slug}-hero.webp`,
      alt: `${p.heroLines.join(' ')} — AISEOShift`,
      width: 1200,
      height: 675,
      bytes: statSync(heroPath).size,
    },
  };
  console.log('ok', p.slug);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('manifest updated');
