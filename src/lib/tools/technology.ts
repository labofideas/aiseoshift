import { parseHtml } from './html';
export type Detection = { name: string; category: string; confidence: 'High' | 'Medium'; evidence: string[] };
export type Theme = { slug: string; stylesheet: string; fields?: Record<string,string>; note?: string };
export type TechnologyReport = { detections: Detection[]; themes: Theme[]; plugins: string[]; wordpress: boolean };
export function analyzeTechnology(html: string, base: string, headers: Record<string,string> = {}): TechnologyReport {
  const doc = parseHtml(html);
  const results: Detection[] = [];
  const add = (name: string, category: string, evidence: string, confidence: Detection['confidence'] = 'High') => {
    const existing = results.find(d => d.name === name);
    if (existing) { if (!existing.evidence.includes(evidence) && existing.evidence.length < 4) existing.evidence.push(evidence); }
    else results.push({ name, category, confidence, evidence: [evidence] });
  };
  const assets = Array.from(doc.querySelectorAll('script[src],link[href]')).map(el => el.getAttribute('src') || el.getAttribute('href') || '').filter(Boolean);
  const urls = assets.flatMap(value => { try { const u = new URL(value, base); return ['http:','https:'].includes(u.protocol) ? [u] : []; } catch { return []; } });
  const generators = Array.from(doc.querySelectorAll('meta[name]')).filter(el => el.getAttribute('name')?.toLowerCase() === 'generator').map(el => el.getAttribute('content') || '');
  for (const generator of generators) for (const name of ['WordPress','Wix','Squarespace','Drupal','Joomla','Astro','Webflow','Ghost']) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(generator)) add(name, name === 'Astro' ? 'Framework' : 'Platform / CMS', `Generator: ${generator.slice(0,160)}`);
  }
  const themes: Theme[] = []; const plugins = new Set<string>();
  const assetRules: [string,string,RegExp][] = [
    ['WordPress','Platform / CMS',/\/wp-(?:content|includes)\//],
    ['Shopify','Platform / CMS',/(?:cdn\.shopify\.com\/|\/cdn\/shop\/)/],
    ['Wix','Platform / CMS',/(?:^|\.)wixstatic\.com\//],
    ['Squarespace','Platform / CMS',/static\d*\.squarespace\.com\//],
    ['Webflow','Platform / CMS',/(?:webflow\.com\/|website-files\.com\/)/],
    ['Next.js','Framework',/\/_next\/(?:static|image)/],
    ['Nuxt','Framework',/\/_nuxt\//],
    ['Astro','Framework',/\/_astro\//],
    ['jQuery','JavaScript library',/\/(?:jquery(?:\.min)?\.js|jquery[-/]\d)/],
    ['Google Tag Manager','Analytics / marketing',/www\.googletagmanager\.com\/gtm\.js/],
    ['Google Analytics','Analytics / marketing',/(?:www\.googletagmanager\.com\/gtag\/js|(?:www\.)?google-analytics\.com\/analytics\.js)/],
    ['Meta Pixel','Analytics / marketing',/connect\.facebook\.net\/[^/]+\/fbevents\.js/],
    ['Hotjar','Analytics / marketing',/static\.hotjar\.com\//],
    ['Plausible','Analytics / marketing',/plausible\.io\/js\//],
    ['WooCommerce','Ecommerce',/\/plugins\/woocommerce\//],
    ['Elementor','Page builder',/\/plugins\/elementor(?:-pro)?\//],
    ['Divi','Page builder',/\/themes\/Divi\//],
  ];
  for (const u of urls) {
    const signal = u.hostname + u.pathname;
    for (const [name,category,pattern] of assetRules) if (pattern.test(signal)) add(name,category,u.origin + u.pathname);
    const theme = u.pathname.match(/^(.*\/wp-content\/themes\/([a-z0-9_-]+))\//i);
    if (theme && !themes.some(t => t.slug === theme[2])) themes.push({ slug: theme[2], stylesheet: u.origin + theme[1] + '/style.css' });
    const plugin = u.pathname.match(/\/wp-content\/plugins\/([a-z0-9_-]+)\//i);
    if (plugin) plugins.add(plugin[1]);
  }
  if (doc.querySelector('script#__NEXT_DATA__')) add('Next.js','Framework','__NEXT_DATA__ script');
  if (doc.querySelector('astro-island')) add('Astro','Framework','astro-island element');
  if (doc.querySelector('[data-reactroot]')) add('React','JavaScript library','data-reactroot attribute');
  if (headers['cf-ray']) add('Cloudflare','Infrastructure','cf-ray response header');
  if (headers['x-vercel-id']) add('Vercel','Infrastructure','x-vercel-id response header');
  if (headers['x-shopify-stage']) add('Shopify','Platform / CMS','x-shopify-stage response header');
  for (const key of ['server','x-powered-by']) {
    const value = headers[key] || '';
    for (const name of ['nginx','Apache','LiteSpeed','PHP','Express']) if (new RegExp(`\\b${name}\\b`,'i').test(value)) add(name,'Server / runtime', `${key}: ${value}`, 'Medium');
  }
  return { detections: results, themes: themes.slice(0,4), plugins: [...plugins].sort(), wordpress: results.some(r => r.name === 'WordPress') };
}
