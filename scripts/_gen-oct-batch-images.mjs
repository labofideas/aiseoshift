// Hero + inline graphics for the 2026-10-07 marketing batch. Run: node scripts/_gen-oct-batch-images.mjs
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts', MANIFEST = 'src/data/image-manifest.json';
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, serif';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function hero({ kicker, l1, l2, sub }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${NAVY1}"/><stop offset="100%" stop-color="${NAVY2}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUSTD}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="260" fill="${RUSTD}" opacity="0.05"/>
  <rect x="0" y="0" width="7" height="675" fill="url(#ac)"/>
  <rect x="80" y="110" width="84" height="5" fill="${RUSTD}" rx="2"/>
  <text x="80" y="148" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="5" fill="${RUSTD}">${esc(kicker)}</text>
  <text x="80" y="250" font-family="${SERIF}" font-size="68" font-weight="700" fill="${CREAMD}" letter-spacing="-2">${esc(l1)}</text>
  <text x="80" y="334" font-family="${SERIF}" font-size="68" font-weight="700" fill="${RUSTD}" letter-spacing="-2">${esc(l2)}</text>
  <text x="80" y="414" font-family="${SANS}" font-size="26" fill="${CREAMD}" opacity="0.8">${esc(sub)}</text>
  <line x1="80" y1="580" x2="320" y2="580" stroke="${RUSTD}" stroke-width="1.5" opacity="0.5"/>
  <text x="80" y="620" font-family="${SANS}" font-size="18" letter-spacing="1" fill="${CREAMD}" opacity="0.5">aiseoshift.com</text>
</svg>`;
}

const frame = (H, kicker, title, body, note) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
  <defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/></linearGradient></defs>
  <rect width="1200" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#ac)"/>
  <text x="60" y="95" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="3" fill="${RUST}">${esc(kicker)}</text>
  <text x="60" y="150" font-family="${SERIF}" font-size="40" font-weight="700" fill="${NAVY}">${esc(title)}</text>
  ${body}
  <line x1="60" y1="${H - 60}" x2="1140" y2="${H - 60}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="${H - 28}" font-family="${SANS}" font-size="18" fill="${GRAY}">${esc(note)}</text>
  <text x="1140" y="${H - 28}" text-anchor="end" font-family="${SANS}" font-size="18" fill="${GRAY}">aiseoshift.com</text>
</svg>`;

// cards: [{ t, sub, lines: [], foot }], last card dark
function cards(kicker, title, items, note) {
  const n = items.length, gap = 20, W = (1080 - gap * (n - 1)) / n, top = 195, CH = 320, H = top + CH + 110;
  const fs = n >= 4 ? 17 : 19;
  const body = items.map((c, i) => {
    const x = 60 + i * (W + gap), dark = i === n - 1;
    return `<rect x="${x}" y="${top}" width="${W}" height="${CH}" rx="12" fill="${NAVY}" fill-opacity="${dark ? 1 : 0.05}"/>
    <text x="${x + 24}" y="${top + 52}" font-family="${SERIF}" font-size="${n >= 4 ? 26 : 30}" font-weight="700" fill="${dark ? CREAM : NAVY}">${esc(c.t)}</text>
    <text x="${x + 24}" y="${top + 84}" font-family="${SANS}" font-size="15" font-weight="700" letter-spacing="2" fill="${RUST}">${esc(c.sub)}</text>
    ${c.lines.map((l, j) => `<text x="${x + 24}" y="${top + 128 + j * 27}" font-family="${SANS}" font-size="${fs}" fill="${dark ? CREAMD : NAVY}">${esc(l)}</text>`).join('')}
    ${c.foot.map((l, j) => `<text x="${x + 24}" y="${top + CH - 50 + j * 24}" font-family="${SANS}" font-size="15" fill="${dark ? CREAMD : GRAY}">${esc(l)}</text>`).join('')}`;
  }).join('');
  return frame(H, kicker, title, body, note);
}

function picker(kicker, title, head, rows, note) {
  const top = 230, rowH = 88, H = top + rows.length * rowH + 100;
  const body = `<text x="60" y="${top - 12}" font-family="${SANS}" font-size="17" letter-spacing="2" fill="${GRAY}">${esc(head[0])}</text>
  <text x="700" y="${top - 12}" font-family="${SANS}" font-size="17" letter-spacing="2" fill="${GRAY}">${esc(head[1])}</text>` +
    rows.map(([need, pick], i) => {
      const yy = top + i * rowH, dark = i === rows.length - 1;
      return `<rect x="60" y="${yy}" width="560" height="68" rx="10" fill="${NAVY}" fill-opacity="0.05"/>
      <text x="86" y="${yy + 43}" font-family="${SANS}" font-size="22" fill="${NAVY}">${esc(need)}</text>
      <path d="M632 ${yy + 34} h44 m-12 -11 l12 11 l-12 11" stroke="${RUST}" stroke-width="3" fill="none"/>
      <rect x="690" y="${yy}" width="450" height="68" rx="10" fill="${dark ? NAVY : RUST}"/>
      <text x="714" y="${yy + 44}" font-family="${SERIF}" font-size="25" font-weight="700" fill="${CREAM}">${esc(pick)}</text>`;
    }).join('');
  return frame(H, kicker, title, body, note);
}

function funnel() {
  const stages = [
    ['Awareness', 'Reach new buyers', 'Reach, CPM, new visitors'],
    ['Consideration', 'Engage and compare', 'CTR, sign-ups, add-to-carts'],
    ['Conversion', 'Turn intent into sales', 'Conversion rate, CPA, AOV'],
    ['Retention', 'Buy again, refer', 'Repeat rate, LTV'],
  ];
  const top = 190, rowH = 92, H = top + stages.length * rowH + 100;
  const body = stages.map(([s, g, m], i) => {
    const w = 640 - i * 90, x = 60 + (640 - w) / 2, y = top + i * rowH, dark = i === 3;
    return `<rect x="${x}" y="${y}" width="${w}" height="76" rx="8" fill="${dark ? NAVY : RUST}" fill-opacity="${dark ? 1 : 1 - i * 0.18}"/>
    <text x="380" y="${y + 47}" text-anchor="middle" font-family="${SERIF}" font-size="28" font-weight="700" fill="${CREAM}">${s}</text>
    <text x="740" y="${y + 32}" font-family="${SANS}" font-size="21" font-weight="700" fill="${NAVY}">${g}</text>
    <text x="740" y="${y + 60}" font-family="${SANS}" font-size="18" fill="${GRAY}">${m}</text>`;
  }).join('');
  return frame(H, 'THE FULL-FUNNEL SYSTEM', 'Four stages, one connected system', body, 'Measure every stage. Fix the weakest one first.');
}

const posts = [
  {
    slug: 'facebook-ads-strategies-after-meta-update',
    hero: { kicker: 'META ADS, OCTOBER 2026', l1: 'Your creative is', l2: 'now your targeting', sub: '10 Facebook ads strategies for the new Meta' },
    alt: '10 Facebook ads strategies after Meta\'s latest updates: creative is now your targeting',
    inline: ['playbook', cards('META ADS, THEN AND NOW', 'The old playbook vs the 2026 playbook', [
      { t: 'Old playbook', sub: 'BEFORE ANDROMEDA', lines: ['Stacked interest audiences', 'Many small ad sets', 'Headline tests on one image', 'Manual placement choices', 'Trust in-platform ROAS'], foot: [] },
      { t: '2026 playbook', sub: 'HOW META WORKS NOW', lines: ['Broad targeting + exclusions', 'One or two broad ad sets', '8 to 15 distinct concepts', 'Every ad fits every placement', 'Blended results and lift tests'], foot: [] },
    ], 'Meta groups similar ads together, so variety of concepts beats volume of copies.')],
  },
  {
    slug: 'best-meta-ads-courses',
    hero: { kicker: 'META ADS COURSES, 2026', l1: 'Learn Meta ads', l2: 'as they work now', sub: '10 Facebook and Instagram ads courses compared' },
    alt: 'Best Meta ads courses in 2026 to learn Facebook and Instagram ads',
    inline: ['picker', picker('WHICH COURSE TO TAKE', 'Pick by where you are now', ['IF YOU...', 'START WITH'], [
      ['Have never run an ad', 'Meta Blueprint (free)'],
      ['Want a cheap structured course', 'Top-rated Udemy course'],
      ['Run ads for your own brand', 'Ben Heath or Jon Loomer'],
      ['Want a CV credential', 'Coursera Meta certificate'],
      ['Are profitable and scaling', 'Foxwell or BPM Method'],
    ], 'Check the last-updated date. Pre-2025 courses teach targeting Meta no longer rewards.')],
  },
  {
    slug: 'best-ai-video-ad-generators',
    hero: { kicker: 'AI VIDEO ADS, 2026', l1: 'More ad creative,', l2: 'less production', sub: '14 AI video ad generators compared' },
    alt: 'Best AI video ad generators in 2026 for Meta, TikTok and YouTube ads',
    inline: ['types', cards('THREE KINDS OF AI VIDEO AD TOOL', 'Pick the ad style first, then the tool', [
      { t: 'AI creator ads', sub: 'UGC STYLE', lines: ['AI actors talk to camera', 'or hold your product', 'Best for TikTok and Reels'], foot: ['Arcads, MakeUGC, HeyGen'] },
      { t: 'Product video ads', sub: 'URL OR IMAGES TO VIDEO', lines: ['Product page or photos', 'become captioned ads', 'Best for ecommerce catalogs'], foot: ['Creatify, Topview, Meta, Google'] },
      { t: 'Variation platforms', sub: 'TEST AND PUBLISH', lines: ['Many versions, scored', 'before launch, sent', 'straight to ad accounts'], foot: ['Pencil, AdCreative.ai'] },
    ], 'Free generators are built into Meta, TikTok, Google Ads and Amazon Ads.')],
  },
  {
    slug: 'best-trending-product-research-tools',
    hero: { kicker: 'PRODUCT RESEARCH, 2026', l1: 'Find the product', l2: 'before it peaks', sub: '14 trending product research tools compared' },
    alt: 'Best trending product research tools in 2026 for ecommerce sellers',
    inline: ['signals', cards('FOUR KINDS OF TREND SIGNAL', 'Watch where your buyers actually shop', [
      { t: 'Search', sub: 'EARLY DEMAND', lines: ['Rising interest', 'before sales show'], foot: ['Google Trends,', 'Exploding Topics'] },
      { t: 'Sales', sub: 'MARKETPLACES', lines: ['Real buying on', 'Amazon, TikTok Shop'], foot: ['Jungle Scout,', 'Kalodata'] },
      { t: 'Ads', sub: 'STORES AND ADS', lines: ['What sellers pay', 'to promote'], foot: ['Minea,', 'Sell The Trend'] },
      { t: 'Social', sub: 'SAVES AND VIEWS', lines: ['What people save,', 'watch and share'], foot: ['Pinterest Trends,', 'TikTok Creative Center'] },
    ], 'The strongest product ideas show up in two signals at once.')],
  },
  {
    slug: 'chatgpt-merchant-setup',
    hero: { kicker: 'CHATGPT SHOPPING, 2026', l1: 'Get your products', l2: 'into ChatGPT', sub: 'Product feed, checkout and ads, step by step' },
    alt: 'ChatGPT merchant setup: how to get your products into ChatGPT shopping',
    inline: ['parts', cards('SELLING ON CHATGPT', 'Three separate parts, in order', [
      { t: '1. Product feed', sub: 'FREE, START HERE', lines: ['Apply at', 'chatgpt.com/merchants', 'and submit a feed'], foot: ['Puts products in organic', 'shopping results'] },
      { t: '2. Checkout', sub: 'AGENTIC COMMERCE PROTOCOL', lines: ['Buy inside ChatGPT', 'via your payment', 'provider'], foot: ['Reported 4% fee per order;', 'confirm availability first'] },
      { t: '3. Ads', sub: 'PAID, OPTIONAL', lines: ['Sponsored placement,', 'separate from organic', 'results'], foot: ['Self-serve platform and', 'Shopify app'] },
    ], 'There is no single "ChatGPT Merchant Center". The setup is split across these three.')],
  },
  {
    slug: 'full-funnel-performance-marketing-system',
    hero: { kicker: 'PERFORMANCE MARKETING', l1: 'Not more campaigns.', l2: 'A system.', sub: 'How to build a full-funnel performance marketing system' },
    alt: 'How to build a full-funnel performance marketing system',
    inline: ['funnel', funnel()],
  },
];

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
for (const p of posts) {
  const heroPath = `${OUT}/${p.slug}-hero.webp`;
  await sharp(Buffer.from(hero(p.hero))).webp({ quality: 88 }).toFile(heroPath);
  await sharp(Buffer.from(p.inline[1])).webp({ quality: 90 }).toFile(`${OUT}/${p.slug}-${p.inline[0]}.webp`);
  manifest[p.slug] = { ...(manifest[p.slug] || {}), hero: { src: `/images/posts/${p.slug}-hero.webp`, alt: p.alt, width: 1200, height: 675, bytes: statSync(heroPath).size } };
  console.log('ok', p.slug);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
