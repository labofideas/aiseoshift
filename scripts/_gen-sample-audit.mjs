import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

let html = readFileSync('public/seo-report-59/index.html', 'utf8');

// --- Anonymize the client report into a generic sample ---
const repl = [
  // brand + domain
  [/Hempeutics\.com/g, 'EvergreenBotanicals.com'],
  [/hempeutics\.com/g, 'evergreenbotanicals.com'],
  [/Hempeutics/g, 'Evergreen Botanicals'],
  [/hempeutics/g, 'evergreenbotanicals'],
  // founder / pharmacist
  [/Dr\. Pegah's/g, "Dr. Reed's"],
  [/Dr\. Pegah/g, 'Dr. Reed'],
  [/Pegah Panahi/g, 'Dr. Maya Reed'],
  [/Pegah/g, 'Maya Reed'],
  // location
  [/Pacifica Medical Tower, 18800 Delaware St Ste 110, Huntington Beach, CA 92648/g, 'Wellness Plaza, 4500 Market St Ste 210, Lakeside, CA 92040'],
  [/Pacifica Medical Tower/g, 'Wellness Plaza'],
  [/18800 Delaware St Ste 110/g, '4500 Market St Ste 210'],
  [/Huntington Beach, CA 92648/g, 'Lakeside, CA 92040'],
  [/Huntington Beach, CA/g, 'Lakeside, CA'],
  [/Huntington Beach/g, 'Lakeside'],
  [/Costa Mesa/g, 'El Cajon'],
  [/Newport Beach/g, 'La Mesa'],
  [/Fountain Valley/g, 'Santee'],
  // header meta line
  [/Prepared for Dr\. Maya Reed/g, 'Prepared for a CBD &amp; wellness brand'],
  [/Prepared for Pegah Panahi/g, 'Prepared for a CBD &amp; wellness brand'],
];
for (const [from, to] of repl) html = html.replace(from, to);

// title + meta
html = html.replace(
  /<title>[^<]*<\/title>/,
  '<title>Sample SEO Audit Report — CBD Brand | AISEOShift</title>'
);
html = html.replace(
  /<meta name="description"[^>]*>/,
  '<meta name="description" content="A sample AI SEO audit report for a CBD and wellness brand. Illustrative data showing the depth of audit AISEOShift produces.">'
);

// make it indexable: drop the noindex tag, add a self-canonical
html = html.replace(/\s*<meta name="robots"[^>]*>/g, '');
html = html.replace(
  /<\/title>/,
  '</title>\n    <link rel="canonical" href="https://aiseoshift.com/sample-seo-audit/">'
);

// sample banner + CTA injected right after <body>
const banner = `
    <div style="background:#1a1a2e;color:#fff;text-align:center;padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:0.9rem;position:relative;z-index:2000;">
      <strong>Sample report.</strong> Brand, names, and figures are illustrative. This is an example of the AI SEO audit AISEOShift produces &mdash;
      <a href="/ai-seo-services/cbd-hemp" style="color:#e8834f;font-weight:600;">get one for your CBD brand &rarr;</a>
    </div>`;
html = html.replace(/<body>/, '<body>' + banner);

mkdirSync('public/sample-seo-audit', { recursive: true });
writeFileSync('public/sample-seo-audit/index.html', html);

// sanity: report any leftover identifiers
const leftovers = (html.match(/Hempeutics|Pegah|Huntington/gi) || []).length;
console.log('Wrote public/sample-seo-audit/index.html — leftover client identifiers:', leftovers);
