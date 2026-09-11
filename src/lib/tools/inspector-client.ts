import type { SchemaReport } from './schema';
import type { TechnologyReport } from './technology';
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = '') => {
  const node = document.createElement(tag); node.textContent = text; node.className = className; return node;
};
const schemaExample = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': 'https://example.com/#organization', name: 'Example Studio', url: 'https://example.com/' },
  { '@type': 'Article', headline: 'An example article', author: { '@type': 'Person', name: 'Alex' }, publisher: { '@id': 'https://example.com/#organization' }, datePublished: '2026-01-15', misspelledProperty: 'This demonstrates a warning' },
] }, null, 2);
const technologyExample = '<!doctype html>\n<html><head>\n<meta name="generator" content="WordPress">\n<link rel="stylesheet" href="https://example.com/wp-content/themes/astra/style.css">\n<link rel="stylesheet" href="https://example.com/wp-content/plugins/woocommerce/assets/css/woocommerce.css">\n<script src="https://example.com/wp-content/plugins/elementor/assets/js/frontend.min.js"></script>\n<script src="https://www.googletagmanager.com/gtm.js?id=GTM-EXAMPLE"></script>\n</head><body><h1>Example website</h1></body></html>';

export function initInspector() {
  const root = document.querySelector<HTMLElement>('[data-tool]'); if (!root) return;
  const schema = root.dataset.tool === 'schema';
  const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const form = get<HTMLFormElement>('scan-form');
  const mode = get<HTMLSelectElement>('input-mode');
  const url = get<HTMLInputElement>('scan-url'); const code = get<HTMLTextAreaElement>('scan-code');
  const status = get('scan-status'); const run = get<HTMLButtonElement>('scan-run');
  const results = get('scan-results'); const report = get('scan-report'); const empty = get('scan-empty');
  const output = root.querySelector<HTMLElement>('.inspector-output')!;
  let generation = 0; let controller: AbortController | undefined;
  let download: unknown; let lastSource = '';
  function clearReport() { report.replaceChildren(); results.hidden = true; empty.hidden = false; download = undefined; }
  function reset() {
    generation++; controller?.abort(); clearReport(); status.textContent = ''; status.className = '';
    run.disabled = false; output.setAttribute('aria-busy', 'false');
  }
  function changeMode() { reset(); get('url-panel').hidden = mode.value !== 'url'; get('paste-panel').hidden = mode.value !== 'paste'; }
  mode.addEventListener('change', changeMode);
  get('scan-clear').addEventListener('click', () => { reset(); url.value = ''; code.value = ''; (mode.value === 'url' ? url : code).focus(); });
  get('scan-example').addEventListener('click', () => { mode.value = 'paste'; changeMode(); code.value = schema ? schemaExample : technologyExample; form.requestSubmit(); });
  async function request(path: string, signal: AbortSignal) {
    const response = await fetch(path, { signal });
    let data;
    try { data = await response.json(); } catch { throw new Error('The scanner is unavailable. Try again or paste the page source.'); }
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.'); return data;
  }
  function section(title: string) { report.append(el('h3', title)); }
  function chips(values: string[]) {
    const list = el('div', '', 'inspector-summary');
    for (const value of values) list.append(el('span', value, 'inspector-chip'));
    report.append(list);
  }
  function item(title: string, body: string, severity = '') {
    const box = el('div', '', `inspector-item ${severity}`); box.append(el('strong', title), el('p', body)); report.append(box);
  }
  function renderSchema(data: SchemaReport, date: string) {
    const counts = (level: string) => data.issues.filter(i => i.severity === level).length;
    chips([`${data.blocks.length} JSON-LD blocks`, `${data.nodes} typed objects`, `${counts('error')} errors`, `${counts('warning')} warnings`]);
    if (data.types.length) { section('Detected types'); chips(data.types); }
    section('Findings');
    if (!data.issues.length) item('No issues found in the checks performed', 'This does not certify full JSON-LD validity or Google rich-result eligibility.');
    for (const issue of data.issues) item(`${issue.severity.toUpperCase()} · ${issue.path}`, issue.message, issue.severity);
    if (data.issues.length === 500) item('Result limit reached', 'Showing the first 500 findings. Test smaller blocks for the remaining findings.');
    if (data.blocks.length) {
      section('JSON-LD blocks');
      const copy = el('button', 'Copy extracted JSON-LD', 'secondary'); copy.type = 'button';
      const parsed = data.blocks.filter(b => b.data !== undefined).map(b => b.data);
      copy.disabled = !parsed.length;
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(JSON.stringify(parsed.length === 1 ? parsed[0] : parsed, null, 2)); status.textContent = 'Parsed JSON-LD copied. Invalid blocks are excluded.'; }
        catch { status.textContent = 'Clipboard access is unavailable. Download the report to save the markup.'; }
      }); report.append(copy);
      data.blocks.forEach((block, i) => {
        const details = el('details'); details.append(el('summary', `Block ${i + 1} · ${block.types.join(', ') || (block.data === undefined ? 'Invalid JSON' : 'No type')}`));
        details.append(el('pre', block.data === undefined ? block.raw : JSON.stringify(block.data, null, 2))); report.append(details);
      });
    }
    report.append(el('p', `Vocabulary snapshot: ${date}. Microdata, RDFa, custom context expansion, and JavaScript-rendered markup are outside these checks.`, 'inspector-help'));
  }
  function renderTechnology(data: TechnologyReport) {
    chips([`${data.detections.length} technologies detected`, `${data.themes.length} theme assets`, `${data.plugins.length} plugin paths`]);
    if (!data.detections.length) item('No recognizable technology signals found', 'This page may hide or bundle its assets. This result does not mean the site uses no frameworks or plugins.');
    for (const category of [...new Set(data.detections.map(d => d.category))]) {
      section(category);
      for (const detection of data.detections.filter(d => d.category === category)) {
        const box = el('details'); box.append(el('summary', `${detection.name} · ${detection.confidence} confidence`));
        const evidence = el('ul'); for (const clue of detection.evidence) evidence.append(el('li', clue)); box.append(evidence); report.append(box);
      }
    }
    if (data.wordpress) {
      section('Detected WordPress themes');
      if (!data.themes.length) item('Theme not identified', 'WordPress signals were found, but no recognizable theme asset paths appeared on this page.');
      for (const theme of data.themes) {
        const box = el('div', '', 'inspector-item'); box.append(el('strong', theme.fields?.['Theme Name'] || theme.slug));
        box.append(el('p', `Asset directory: ${theme.slug}`));
        for (const key of ['Author','Version','Template']) if (theme.fields?.[key]) box.append(el('p', `${key === 'Template' ? 'Declared parent theme' : key}: ${theme.fields[key]}`));
        box.append(el('small', theme.note || 'Theme details declared in the public stylesheet.'));
        report.append(box);
      }
      section('Detected plugins');
      if (data.plugins.length) chips(data.plugins);
      else item('No plugin asset paths found', 'Plugins may still be installed. Only identifiable assets on this page are included.');
      report.append(el('p', 'Theme assets do not prove which theme is active. Detected plugins are not a complete installed-plugin inventory.', 'inspector-help'));
    }
    report.append(el('p', 'Evidence comes from source HTML and available headers. Public signals may be cached or modified; server details are inferred, not verified.', 'inspector-help'));
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); reset(); const current = generation;
    controller = new AbortController(); const activeController = controller; const signal = controller.signal;
    const timer = setTimeout(() => activeController.abort(), 45000);
    run.disabled = true; output.setAttribute('aria-busy', 'true');
    try {
      let html: string; let source = 'Pasted code'; let headers: Record<string,string> = {};
      const urlMode = mode.value === 'url';
      if (urlMode) {
        let value = url.value.trim(); if (!value) throw new Error('Enter a website URL.');
        if (!/^[a-z][a-z\d+.-]*:/i.test(value)) value = 'https://' + value;
        let target: URL; try { target = new URL(value); } catch { throw new Error('Enter a valid website URL.'); }
        if (!['http:','https:'].includes(target.protocol)) throw new Error('Use an HTTP or HTTPS website URL.');
        status.textContent = 'Fetching page source…';
        const data = await request(`/api/fetch-page?url=${encodeURIComponent(target.href)}`, signal);
        html = data.html; source = data.url; headers = data.headers || {};
      } else {
        html = code.value.trim(); if (!html) throw new Error(schema ? 'Paste JSON-LD or HTML first.' : 'Paste page HTML first.');
      }
      if (new TextEncoder().encode(html).length > 3 * 1024 * 1024) throw new Error('Limit the input to 3 MB.');
      let data: SchemaReport | TechnologyReport;
      if (schema) {
        const { analyzeSchema, vocabularyDate } = await import('./schema');
        data = analyzeSchema(html);
        if (generation !== current) return;
        renderSchema(data, vocabularyDate);
      } else {
        const { analyzeTechnology } = await import('./technology');
        data = analyzeTechnology(html, urlMode ? source : 'https://pasted.invalid/', headers);
        if (urlMode && data.themes.length) {
          status.textContent = 'Checking discovered theme stylesheets…';
          await Promise.all(data.themes.map(async theme => {
            try {
              const info = await request(`/api/theme-info?url=${encodeURIComponent(theme.stylesheet)}`, signal);
              theme.fields = info.fields;
              if (!info.fields['Theme Name']) theme.note = 'No theme name found in the public stylesheet header.';
            } catch (error) { theme.note = `Asset path detected; theme metadata unavailable. ${error instanceof Error ? error.message : ''}`; }
          }));
        } else for (const theme of data.themes) theme.note = 'Detected from pasted HTML. No stylesheet was fetched.';
        if (generation !== current) return;
        renderTechnology(data);
      }
      lastSource = source; download = { tool: schema ? 'Schema Markup Tester' : 'Website Technology Detector', source, scannedAt: new Date().toISOString(), scope: 'Source HTML only; JavaScript not rendered', ...data };
      get('scan-source').textContent = source;
      results.hidden = false; empty.hidden = true;
      status.textContent = 'Analysis complete. Review the results and coverage notes.';
    } catch (error) {
      if (generation !== current) return;
      clearReport(); status.className = 'error';
      status.textContent = signal.aborted ? 'The scan timed out. Try again or paste the page source.' : error instanceof Error ? error.message : 'Could not analyze this input.';
    } finally {
      clearTimeout(timer);
      if (generation === current) { run.disabled = false; output.setAttribute('aria-busy', 'false'); }
    }
  });
  get('scan-download').addEventListener('click', () => {
    if (!download) return;
    const blob = new Blob([JSON.stringify(download, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob); const link = el('a'); link.href = href;
    link.download = `${schema ? 'schema' : 'technology'}-report.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000); status.textContent = `Report downloaded for ${lastSource}.`;
  });
}
