// Shared SVG templates for coded post images (hero + inline cards/picker), rendered to webp with sharp.
const NAVY1 = '#1a1e2e', NAVY2 = '#0f1219', RUSTD = '#d96a3a', RUST2 = '#e8834f', CREAMD = '#e4e2dc';
const CREAM = '#faf8f5', NAVY = '#1a1e2e', RUST = '#c4704b', GRAY = '#6b6b6b';
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, serif';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function hero({ kicker, l1, l2, sub }) {
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

export const frame = (H, kicker, title, body, note) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${H}" viewBox="0 0 1200 ${H}">
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
export function cards(kicker, title, items, note) {
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

export function picker(kicker, title, head, rows, note) {
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



export { NAVY, CREAM, CREAMD, RUST, RUSTD, GRAY, SANS, SERIF };
