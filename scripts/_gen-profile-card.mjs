import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/images/profile';
mkdirSync(OUT, { recursive: true });

const CREAM = '#faf8f5';
const NAVY = '#1a1e2e';
const RUST = '#c4704b';
const GRAY = '#6b6b6b';

function pill(cx, label) {
  const w = 240, h = 72, y = 760, x = cx - w / 2;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="none" stroke="${RUST}" stroke-width="2.5"/>
    <text x="${cx}" y="${y + 47}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="2" fill="${NAVY}">${label}</text>`;
}

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${RUST}"/>
      <stop offset="100%" stop-color="#e8834f"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="${CREAM}"/>
  <rect x="0" y="0" width="1080" height="12" fill="url(#ring)"/>

  <!-- Monogram -->
  <circle cx="540" cy="235" r="92" fill="${NAVY}"/>
  <circle cx="540" cy="235" r="92" fill="none" stroke="url(#ring)" stroke-width="5"/>
  <text x="540" y="268" text-anchor="middle" font-family="Georgia, serif" font-size="80" font-weight="700" fill="${CREAM}" letter-spacing="2">SD</text>

  <!-- Kicker -->
  <text x="540" y="408" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${RUST}">AI SEO CONSULTANT</text>

  <!-- Name + role -->
  <text x="540" y="492" text-anchor="middle" font-family="Georgia, serif" font-size="68" font-weight="700" fill="${NAVY}" letter-spacing="-1">Shashank Dubey</text>
  <text x="540" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${GRAY}">Founder, Wbcom Designs</text>

  <!-- Divider -->
  <line x1="480" y1="585" x2="600" y2="585" stroke="${RUST}" stroke-width="3"/>

  <!-- Tagline -->
  <text x="540" y="650" text-anchor="middle" font-family="Georgia, serif" font-size="32" font-style="italic" fill="${NAVY}">
    <tspan x="540" dy="0">I help brands become the source</tspan>
    <tspan x="540" dy="46">AI search trusts and repeats.</tspan>
  </text>

  <!-- Focus pills -->
  ${pill(280, 'AEO')}
  ${pill(540, 'GEO')}
  ${pill(800, 'AI VISIBILITY')}

  <!-- Credibility -->
  <text x="540" y="918" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" fill="${NAVY}">10+ years in SEO and WordPress</text>
  <text x="540" y="956" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" fill="${GRAY}">Top Rated Plus freelancer · trust-sensitive industries</text>

  <!-- Footer -->
  <text x="540" y="1028" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" letter-spacing="1" fill="${GRAY}">wbcomdesigns.com</text>
</svg>`;

await sharp(Buffer.from(card)).png().toFile(`${OUT}/shashank-dubey-profile-card.png`);

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Profile Card — Shashank Dubey</title>
<style>html,body{margin:0;background:#e9e6e1;display:flex;justify-content:center;align-items:flex-start;min-height:100vh}.wrap{width:1080px;max-width:100%}svg{width:100%;height:auto;display:block}</style>
</head><body><div class="wrap">${card}</div></body></html>`;
writeFileSync(`${OUT}/shashank-dubey-profile-card.html`, html);

const png = `${OUT}/shashank-dubey-profile-card.png`;
console.log('Wrote', png, Math.round(statSync(png).size / 1024) + 'KB');
