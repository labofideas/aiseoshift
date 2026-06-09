import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/future-of-seo';
mkdirSync(OUT, { recursive: true });

const CREAM = '#faf8f5';
const CARD = '#f1ece5';
const NAVY = '#1a1e2e';
const RUST = '#c4704b';
const RUST2 = '#e8834f';
const GRAY = '#6b6b6b';

function stat(x, num, l1, l2) {
  return `
    <text x="${x}" y="600" text-anchor="middle" font-family="Georgia, serif" font-size="92" font-weight="700" fill="${RUST}">${num}</text>
    <text x="${x}" y="648" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${NAVY}">${l1}</text>
    <text x="${x}" y="676" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${GRAY}">${l2}</text>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1620" viewBox="0 0 1080 1620">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${RUST}"/><stop offset="100%" stop-color="${RUST2}"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1620" fill="${CREAM}"/>
  <rect x="0" y="0" width="1080" height="12" fill="url(#accent)"/>

  <!-- Header -->
  <text x="540" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${RUST}">THE FUTURE OF SEARCH</text>
  <text x="540" y="232" text-anchor="middle" font-family="Georgia, serif" font-size="78" font-weight="700" fill="${NAVY}" letter-spacing="-2">The Click Is Leaving</text>
  <text x="540" y="296" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${GRAY}">And it was never the thing you wanted anyway.</text>

  <!-- Stat band -->
  <rect x="60" y="360" width="960" height="400" rx="22" fill="${CARD}"/>
  <text x="540" y="438" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="700" letter-spacing="3" fill="${GRAY}">WHERE SEARCH IS IN 2026</text>
  ${stat(250, '43%', 'of Google searches', 'end with no click')}
  ${stat(540, '93%', 'no click when', "AI Mode runs")}
  ${stat(830, '1.6%', 'top-result CTR', '(was 7.6%)')}
  <line x1="395" y1="510" x2="395" y2="660" stroke="${NAVY}" stroke-width="1" opacity="0.12"/>
  <line x1="685" y1="510" x2="685" y2="660" stroke="${NAVY}" stroke-width="1" opacity="0.12"/>

  <!-- Reframe -->
  <text x="540" y="868" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="700" fill="${NAVY}">The game changed</text>

  <rect x="60" y="918" width="455" height="230" rx="18" fill="${CARD}"/>
  <rect x="60" y="918" width="6" height="230" rx="3" fill="${GRAY}"/>
  <text x="100" y="978" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="${GRAY}">OLD GAME</text>
  <text x="100" y="1040" font-family="Georgia, serif" font-size="42" font-weight="700" fill="${NAVY}">Ranking</text>
  <text x="100" y="1090" font-family="Arial, sans-serif" font-size="24" fill="${GRAY}">Be on the list.</text>
  <text x="100" y="1122" font-family="Arial, sans-serif" font-size="24" fill="${GRAY}">A list can be gamed.</text>

  <rect x="565" y="918" width="455" height="230" rx="18" fill="${RUST}" opacity="0.12"/>
  <rect x="565" y="918" width="6" height="230" rx="3" fill="url(#accent)"/>
  <text x="605" y="978" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="${RUST}">NEW GAME</text>
  <text x="605" y="1040" font-family="Georgia, serif" font-size="42" font-weight="700" fill="${NAVY}">Citation</text>
  <text x="605" y="1090" font-family="Arial, sans-serif" font-size="24" fill="${NAVY}">Be the name repeated.</text>
  <text x="605" y="1122" font-family="Arial, sans-serif" font-size="24" fill="${NAVY}">Trust is harder to fake.</text>

  <!-- Analogy -->
  <text x="540" y="1270" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="${NAVY}">
    <tspan x="540" dy="0">Search went from a phone book</tspan>
    <tspan x="540" dy="46">to a friend who knows everything.</tspan>
  </text>
  <text x="540" y="1392" text-anchor="middle" font-family="Georgia, serif" font-size="29" fill="${GRAY}">
    <tspan x="540" dy="0">You are no longer trying to be on the list.</tspan>
    <tspan x="540" dy="42">You are trying to be the name it says out loud.</tspan>
  </text>

  <!-- Footer -->
  <line x1="60" y1="1500" x2="1020" y2="1500" stroke="${RUST}" stroke-width="1" opacity="0.4"/>
  <text x="540" y="1556" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" letter-spacing="1" fill="${GRAY}">wbcomdesigns.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(`${OUT}/infographic-the-click-is-leaving-clean.png`);
writeFileSync(`${OUT}/infographic-the-click-is-leaving-clean.html`,
`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Infographic</title><style>html,body{margin:0;background:#e9e6e1;display:flex;justify-content:center}.wrap{width:1080px;max-width:100%}svg{width:100%;height:auto;display:block}</style></head><body><div class="wrap">${svg}</div></body></html>`);

const png = `${OUT}/infographic-the-click-is-leaving-clean.png`;
console.log('Wrote', png, Math.round(statSync(png).size / 1024) + 'KB');
