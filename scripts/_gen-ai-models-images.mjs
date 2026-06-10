import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts';
const MANIFEST = 'src/data/image-manifest.json';

// palette
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', CARD = '#f1ece5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const pages = [
  {
    slug: 'claude-models-openai-codex-pricing-2026',
    kicker: 'AI MODEL GUIDE', heroLines: ['Every Major AI', 'Model in 2026'],
    chartTitle: 'Output price per 1M tokens (flagships)', unit: '$',
    bars: [['Claude Fable 5', 50], ['GPT-5.5', 30], ['Claude Opus 4.8', 25], ['Gemini 3.1 Pro', 12], ['Grok 4.3', 2.5]],
  },
  {
    slug: 'claude-pricing-2026',
    kicker: 'CLAUDE PRICING', heroLines: ['Claude Pricing', 'in 2026'],
    chartTitle: 'Claude output price per 1M tokens', unit: '$',
    bars: [['Fable 5', 50], ['Opus 4.8', 25], ['Sonnet 4.6', 15], ['Haiku 4.5', 5]],
  },
  {
    slug: 'openai-gpt-pricing-2026',
    kicker: 'OPENAI PRICING', heroLines: ['GPT & ChatGPT', 'Pricing in 2026'],
    chartTitle: 'GPT output price per 1M tokens', unit: '$',
    bars: [['GPT-5.5-pro', 180], ['GPT-5.5', 30], ['GPT-5.4', 15], ['GPT-5.3-Codex', 14], ['GPT-5.4 Mini', 4.5], ['GPT-5.4 Nano', 1.25]],
  },
  {
    slug: 'gemini-pricing-2026',
    kicker: 'GEMINI PRICING', heroLines: ['Google Gemini', 'Pricing in 2026'],
    chartTitle: 'Gemini output price per 1M tokens', unit: '$',
    bars: [['3.1 Pro', 12], ['3.5 Flash', 9], ['3 Flash', 3], ['2.5 Flash-Lite', 0.4]],
  },
  {
    slug: 'grok-pricing-2026',
    kicker: 'GROK PRICING', heroLines: ['xAI Grok', 'Pricing in 2026'],
    chartTitle: 'Grok output price per 1M tokens', unit: '$',
    bars: [['Grok 4.3', 2.5], ['Grok 4.1 Fast', 0.5]],
  },
  {
    slug: 'best-ai-model-for-coding-2026',
    kicker: 'CODING', heroLines: ['Best AI Model', 'for Coding 2026'],
    chartTitle: 'SWE-bench Verified score', unit: '%',
    bars: [['Claude Fable 5', 95], ['GPT-5.5', 88.7], ['Claude Opus 4.8', 88.6], ['GPT-5.3-Codex', 85], ['Gemini 3.1 Pro', 80.6], ['Grok 4.3', 73]],
  },
  {
    slug: 'cheapest-ai-model-2026',
    kicker: 'BUDGET', heroLines: ['The Cheapest', 'AI Model in 2026'],
    chartTitle: 'Input price per 1M tokens (cheapest)', unit: '$',
    bars: [['Gemini Flash-Lite', 0.10], ['GPT-5.4 Nano', 0.20], ['Grok 4.1 Fast', 0.20], ['Claude Haiku 4.5', 1.00]],
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
  const labelX = 60, barX = 360, barMaxW = 660;
  const max = Math.max(...p.bars.map((b) => b[1]));
  const rows = p.bars.map(([label, val], i) => {
    const y = top + i * rowH;
    const w = Math.max(6, (val / max) * barMaxW);
    const disp = p.unit === '$' ? `$${val}` : `${val}%`;
    return `
    <text x="${labelX}" y="${y + 30}" font-family="Arial, sans-serif" font-size="24" fill="${NAVY}">${esc(label)}</text>
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
  <text x="60" y="${H - 28}" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">Indicative, June 2026. Verify current figures.</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

for (const p of pages) {
  const heroPath = `${OUT}/${p.slug}-hero.webp`;
  const infoPath = `${OUT}/${p.slug}-infographic.webp`;
  await sharp(Buffer.from(heroSVG(p))).webp({ quality: 88 }).toFile(heroPath);
  await sharp(Buffer.from(chartSVG(p))).webp({ quality: 90 }).toFile(infoPath);
  const heroBytes = statSync(heroPath).size;
  manifest[p.slug] = {
    ...(manifest[p.slug] || {}),
    hero: {
      src: `/images/posts/${p.slug}-hero.webp`,
      alt: `${p.heroLines.join(' ')} — AISEOShift`,
      width: 1200,
      height: 675,
      bytes: heroBytes,
    },
  };
  console.log('ok', p.slug);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log('manifest updated');
