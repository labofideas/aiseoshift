// Hero + inline graphics for the October 2026 marketing posts. Run: node scripts/_gen-oct-batch-images.mjs [slug-filter]
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/posts', MANIFEST = 'src/data/image-manifest.json';
import { hero, frame, cards, picker, NAVY, CREAM, CREAMD, RUST, GRAY, SANS, SERIF } from './lib/post-image-templates.mjs';

function flip() {
  const H = 640, pill = (cx, y, label, dark) => `<rect x="${cx - 110}" y="${y}" width="220" height="56" rx="28" fill="${dark ? NAVY : CREAM}" stroke="${NAVY}" stroke-width="3"/>
    <text x="${cx}" y="${y + 37}" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="700" fill="${dark ? CREAM : NAVY}">${label}</text>`;
  const ad = (x, y) => `<rect x="${x - 40}" y="${y}" width="80" height="50" rx="8" fill="${RUST}"/><text x="${x}" y="${y + 33}" text-anchor="middle" font-family="${SANS}" font-size="20" font-weight="700" fill="${CREAM}">Ad</text>`;
  const L = 330, R = 870;
  const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${NAVY}" stroke-width="3"/>`;
  const before = `<text x="${L}" y="205" text-anchor="middle" font-family="${SANS}" font-size="17" font-weight="700" letter-spacing="3" fill="${GRAY}">BEFORE: AUDIENCE FIRST</text>
    ${pill(L, 230, 'Targeting', false)}${line(L, 286, L, 316)}${pill(L, 316, 'Audience', false)}${line(L, 372, L, 400)}${line(L - 130, 400, L + 130, 400)}
    ${[L - 130, L, L + 130].map((x) => line(x, 400, x, 425) + ad(x, 425)).join('')}`;
  const after = `<text x="${R}" y="205" text-anchor="middle" font-family="${SANS}" font-size="17" font-weight="700" letter-spacing="3" fill="${RUST}">ANDROMEDA: CREATIVE FIRST</text>
    ${[R - 130, R, R + 130].map((x) => ad(x, 230) + line(x, 280, x, 305)).join('')}${line(R - 130, 305, R + 130, 305)}${line(R, 305, R, 330)}
    ${pill(R, 330, 'Reads the ad', true)}${line(R, 386, R, 416)}${pill(R, 416, 'Finds the audience', false)}`;
  return frame(H, 'META ANDROMEDA', 'The order flipped', `<line x1="600" y1="190" x2="600" y2="${H - 90}" stroke="${RUST}" stroke-width="1" opacity="0.4"/>${before}${after}`, 'You no longer pick the audience for an ad. The ad helps Meta find its audience.');
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
  {
    slug: 'competitor-facebook-tiktok-ad-spy-tools',
    hero: { kicker: 'COMPETITOR AD RESEARCH, 2026', l1: 'See every ad', l2: 'your rivals run', sub: 'Free and paid tools for Facebook and TikTok ads' },
    alt: 'Best tools to monitor competitor Facebook and TikTok ads in 2026',
    inline: ['tiers', cards('WAYS TO MONITOR COMPETITOR ADS', 'Start free, pay for history and alerts', [
      { t: 'Free libraries', sub: 'START HERE', lines: ['Every active Meta ad,', 'top TikTok ads, EU', 'reach and targeting'], foot: ['Meta Ad Library,', 'TikTok Creative Center'] },
      { t: 'Spy tools', sub: 'SEARCH AND HISTORY', lines: ['Search many brands,', 'keep ads after they', 'stop, filter by run time'], foot: ['BigSpy, Minea,', 'PiPiAds, AdSpy'] },
      { t: 'Tracking platforms', sub: 'ALERTS AND SWIPE FILES', lines: ['Follow competitors,', 'get alerts, save and', 'brief with your team'], foot: ['Foreplay, Atria'] },
    ], 'The best free signal: ads still running after 30, 60 or 90 days are usually working.')],
  },
  {
    slug: 'meta-andromeda-update-creative-targeting',
    hero: { kicker: 'META ANDROMEDA, 2026', l1: 'Creative is', l2: 'the new targeting', sub: 'What Meta Andromeda is and how to build ads for it' },
    alt: 'What is Meta Andromeda: why creative is the new targeting in 2026',
    inline: ['flip', flip()],
    extra: ['matrix', cards('THE CREATIVE DIVERSITY MATRIX', 'Change what a viewer notices in two seconds', [
      { t: 'Persona', sub: 'WHO IS IT FOR', lines: ['Expert or founder', 'Beginner or skeptic', 'Age, job, life stage', '3 to 5 distinct buyers'], foot: [] },
      { t: 'Angle', sub: 'WHY THEY BUY', lines: ['Social proof', 'Problem and solution', 'Demonstration', 'Comparison or offer'], foot: [] },
      { t: 'Format', sub: 'HOW IT LOOKS', lines: ['UGC-style video', 'Founder to camera', 'Static or carousel', 'Product demo'], foot: [] },
    ], 'A new persona or angle is a new concept. A new headline on the same video is not.')],
  },
  {
    slug: 'how-to-make-high-performing-ad-creative',
    hero: { kicker: 'AD CREATIVE, 2026', l1: 'Make ads that', l2: 'find their buyers', sub: 'How to make high-performing ad creative' },
    alt: 'How to make high-performing ad creative for your campaigns',
    inline: ['anatomy', cards('ANATOMY OF A HIGH-PERFORMING AD', 'Four jobs, in this order', [
      { t: 'Hook', sub: '0 TO 3 SECONDS', lines: ['Stop the right', 'person and show', 'it is for them'], foot: ['Problem, result,', 'call-out'] },
      { t: 'Promise', sub: 'ONE OUTCOME', lines: ['One specific', 'result that', 'matters to them'], foot: ['Not three', 'benefits'] },
      { t: 'Proof', sub: 'WHY BELIEVE IT', lines: ['Demo, reviews,', 'numbers, expert,', 'guarantee'], foot: ['Specific beats', 'clever'] },
      { t: 'Action', sub: 'WHAT NEXT', lines: ['One clear step', 'and a reason', 'to act now'], foot: ['Match the', 'landing page'] },
    ], 'Native to the platform, captioned for sound-off, different enough to count as its own concept.')],
  },
  {
    slug: 'how-to-write-ad-copy',
    hero: { kicker: 'AD COPYWRITING, 2026', l1: 'Write ad copy', l2: 'that converts', sub: 'Frameworks, limits and examples for Meta, Google and TikTok' },
    alt: 'How to write ad copy that converts for Meta, Google and TikTok ads',
    inline: ['frameworks', cards('THREE AD COPY FRAMEWORKS', 'Scaffolding, not rules', [
      { t: 'PAS', sub: 'MOST RELIABLE', lines: ['Problem', 'Agitate', 'Solution'], foot: ['Starts where the', 'reader already is'] },
      { t: 'AIDA', sub: 'NEEDS EXPLAINING', lines: ['Attention', 'Interest', 'Desire, Action'], foot: ['For products that', 'need context'] },
      { t: 'Before-After-Bridge', sub: 'TRANSFORMATIONS', lines: ['Life before', 'Life after', 'Your product'], foot: ['For visible', 'change'] },
    ], 'Use the customer\'s own words. Keep the key message inside the first 125 characters on Meta.')],
  },
  {
    slug: 'how-to-write-ad-hooks',
    hero: { kicker: 'AD HOOKS, 2026', l1: 'Stop the scroll', l2: 'in three seconds', sub: '15 ad hook formulas with examples' },
    alt: 'How to write ad hooks that stop the scroll: 15 formulas with examples',
    inline: ['layers', cards('THE THREE LAYERS OF A HOOK', 'Visual, spoken and text, all at once', [
      { t: 'Visual', sub: 'FIRST FRAME', lines: ['Movement, a face,', 'the product in', 'action, a result'], foot: ['Proves the line'] },
      { t: 'Spoken', sub: 'FIRST LINE', lines: ['One sentence,', 'about 3 seconds,', 'in customer words'], foot: ['Says who it is for'] },
      { t: 'Text', sub: 'ON SCREEN', lines: ['Bold, under 10', 'words, inside the', 'safe area'], foot: ['For sound-off viewers'] },
    ], 'Test hooks by swapping only the opening of a proven ad. Judge on hook rate and cost per result.')],
  },
  {
    slug: 'best-open-source-seo-tools',
    hero: { kicker: 'OPEN SOURCE SEO, 2026', l1: 'Own your', l2: 'SEO stack', sub: '14 free, self-hosted open source SEO tools' },
    alt: 'Best open source SEO tools and platforms in 2026',
    inline: ['stack', cards('A FREE OPEN SOURCE SEO STACK', 'One maintained tool for each job', [
      { t: 'Rankings', sub: 'TRACK POSITIONS', lines: ['Daily keyword', 'positions with', 'a scraping API'], foot: ['SerpBear'] },
      { t: 'Audits', sub: 'CRAWL AND FIX', lines: ['Broken links,', 'redirects, speed,', 'Core Web Vitals'], foot: ['SEOnaut, SiteOne,', 'Unlighthouse'] },
      { t: 'Analytics', sub: 'MEASURE VISITS', lines: ['Privacy-friendly', 'traffic and', 'conversions'], foot: ['Matomo, Plausible,', 'Umami'] },
      { t: 'On-site', sub: 'CMS PLUGINS', lines: ['Titles, sitemaps,', 'canonicals,', 'schema'], foot: ['The SEO Framework,', 'Yoast'] },
    ], 'Open source cannot replace backlink and keyword volume data. Keep Search Console and one paid source.')],
  },
];

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const only = process.argv[2];
for (const p of posts.filter((x) => !only || x.slug.includes(only))) {
  const heroPath = `${OUT}/${p.slug}-hero.webp`;
  await sharp(Buffer.from(hero(p.hero))).webp({ quality: 88 }).toFile(heroPath);
  for (const [name, svg] of [p.inline, p.extra].filter(Boolean)) await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(`${OUT}/${p.slug}-${name}.webp`);
  manifest[p.slug] = { ...(manifest[p.slug] || {}), hero: { src: `/images/posts/${p.slug}-hero.webp`, alt: p.alt, width: 1200, height: 675, bytes: statSync(heroPath).size } };
  console.log('ok', p.slug);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
