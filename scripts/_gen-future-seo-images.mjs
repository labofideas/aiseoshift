import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/future-of-seo';
mkdirSync(OUT, { recursive: true });

// Brand palette (matches scripts/generate-og-images.mjs)
const NAVY1 = '#1a1e2e';
const NAVY2 = '#0f1219';
const RUST = '#d96a3a';
const RUST2 = '#e8834f';
const CREAM = '#e4e2dc';

// ---------------------------------------------------------------------------
// 1) FEATURE IMAGE  (1600 x 900)
// ---------------------------------------------------------------------------
const feature = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY1}"/>
      <stop offset="100%" stop-color="${NAVY2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${RUST}"/>
      <stop offset="100%" stop-color="${RUST2}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="1450" cy="800" r="320" fill="${RUST}" opacity="0.05"/>
  <circle cx="1360" cy="720" r="190" fill="${RUST2}" opacity="0.04"/>
  <rect x="0" y="0" width="8" height="900" fill="url(#accent)"/>
  <rect x="90" y="120" width="96" height="5" fill="${RUST}" rx="2"/>
  <text x="90" y="160" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700" letter-spacing="5" fill="${RUST}">STRATEGY</text>
  <text x="90" y="320" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="700" fill="${CREAM}" letter-spacing="-3">
    <tspan x="90" dy="0">The Click Was</tspan>
    <tspan x="90" dy="108">Always a Proxy</tspan>
  </text>
  <text x="90" y="540" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="400" fill="${CREAM}" opacity="0.72">
    <tspan x="90" dy="0">Search stopped paying for ranking.</tspan>
    <tspan x="90" dy="48">It started paying for trust.</tspan>
  </text>
  <line x1="90" y1="730" x2="420" y2="730" stroke="${RUST}" stroke-width="1.5" opacity="0.5"/>
  <text x="90" y="780" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="400" fill="${CREAM}" opacity="0.85">AISEOShift</text>
  <text x="90" y="812" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${CREAM}" opacity="0.4">aiseoshift.com</text>
</svg>`;

// ---------------------------------------------------------------------------
// 2) INFOGRAPHIC  (1080 x 1620)
// ---------------------------------------------------------------------------
function statBlock(x, num, label1, label2) {
  return `
    <text x="${x}" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="92" font-weight="700" fill="${RUST2}">${num}</text>
    <text x="${x}" y="688" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${CREAM}" opacity="0.8">${label1}</text>
    <text x="${x}" y="716" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${CREAM}" opacity="0.8">${label2}</text>`;
}

const infographic = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1620" viewBox="0 0 1080 1620">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY1}"/>
      <stop offset="100%" stop-color="${NAVY2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${RUST}"/>
      <stop offset="100%" stop-color="${RUST2}"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1620" fill="url(#bg)"/>
  <rect x="0" y="0" width="1080" height="10" fill="url(#accent)"/>

  <!-- Header -->
  <text x="540" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${RUST}">THE FUTURE OF SEARCH</text>
  <text x="540" y="235" text-anchor="middle" font-family="Georgia, serif" font-size="76" font-weight="700" fill="${CREAM}" letter-spacing="-2">The Click Is Leaving</text>
  <text x="540" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${CREAM}" opacity="0.7">And it was never the thing you wanted anyway.</text>

  <!-- Stat band -->
  <rect x="60" y="380" width="960" height="420" rx="20" fill="#ffffff" opacity="0.04"/>
  <text x="540" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3" fill="${CREAM}" opacity="0.55">WHERE SEARCH IS IN 2026</text>
  ${statBlock(250, '43%', 'of Google searches', 'end with no click')}
  ${statBlock(540, '93%', 'no click when', "Google's AI Mode runs")}
  ${statBlock(830, '1.6%', 'top-result CTR', '(was 7.6%)')}
  <line x1="395" y1="560" x2="395" y2="700" stroke="${CREAM}" stroke-width="1" opacity="0.12"/>
  <line x1="685" y1="560" x2="685" y2="700" stroke="${CREAM}" stroke-width="1" opacity="0.12"/>

  <!-- The reframe -->
  <text x="540" y="900" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${CREAM}">The game changed</text>

  <rect x="60" y="950" width="455" height="230" rx="18" fill="#ffffff" opacity="0.03"/>
  <rect x="60" y="950" width="6" height="230" rx="3" fill="${CREAM}" opacity="0.25"/>
  <text x="100" y="1010" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="${CREAM}" opacity="0.5">OLD GAME</text>
  <text x="100" y="1070" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${CREAM}">Ranking</text>
  <text x="100" y="1120" font-family="Arial, sans-serif" font-size="24" fill="${CREAM}" opacity="0.75">Be on the list.</text>
  <text x="100" y="1152" font-family="Arial, sans-serif" font-size="24" fill="${CREAM}" opacity="0.75">A list can be gamed.</text>

  <rect x="565" y="950" width="455" height="230" rx="18" fill="${RUST}" opacity="0.12"/>
  <rect x="565" y="950" width="6" height="230" rx="3" fill="url(#accent)"/>
  <text x="605" y="1010" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="${RUST2}">NEW GAME</text>
  <text x="605" y="1070" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${CREAM}">Citation</text>
  <text x="605" y="1120" font-family="Arial, sans-serif" font-size="24" fill="${CREAM}" opacity="0.85">Be the name repeated.</text>
  <text x="605" y="1152" font-family="Arial, sans-serif" font-size="24" fill="${CREAM}" opacity="0.85">Trust is harder to fake.</text>

  <!-- Analogy -->
  <text x="540" y="1290" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="${CREAM}" opacity="0.85">
    <tspan x="540" dy="0">Search went from a phone book</tspan>
    <tspan x="540" dy="46">to a friend who knows everything.</tspan>
  </text>
  <text x="540" y="1410" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${CREAM}" opacity="0.6">
    <tspan x="540" dy="0">You are no longer trying to be on the list.</tspan>
    <tspan x="540" dy="42">You are trying to be the name it says out loud.</tspan>
  </text>

  <!-- Footer -->
  <line x1="60" y1="1500" x2="1020" y2="1500" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="60" y="1555" font-family="Georgia, serif" font-size="30" fill="${CREAM}" opacity="0.85">AISEOShift</text>
  <text x="1020" y="1555" text-anchor="end" font-family="Arial, sans-serif" font-size="22" fill="${CREAM}" opacity="0.45">aiseoshift.com</text>
</svg>`;

await sharp(Buffer.from(feature)).png().toFile(`${OUT}/feature-the-click-was-always-a-proxy.png`);
await sharp(Buffer.from(infographic)).png().toFile(`${OUT}/infographic-the-click-is-leaving.png`);

// Also save the infographic as a standalone HTML file (the "HTML-coded" version)
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Infographic — The Click Is Leaving | AISEOShift</title>
<style>
  html,body{margin:0;background:${NAVY2};display:flex;justify-content:center;align-items:flex-start;min-height:100vh;}
  .wrap{width:1080px;max-width:100%;}
  svg{width:100%;height:auto;display:block;}
</style></head>
<body><div class="wrap">${infographic}</div></body></html>`;
writeFileSync(`${OUT}/infographic-the-click-is-leaving.html`, html);

console.log('Wrote:');
console.log(`  ${OUT}/feature-the-click-was-always-a-proxy.png`);
console.log(`  ${OUT}/infographic-the-click-is-leaving.png`);
console.log(`  ${OUT}/infographic-the-click-is-leaving.html`);
