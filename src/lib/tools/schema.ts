import { parseHtml } from './html';
import vocabulary from './schema-vocabulary.json';
export type Issue = { severity: 'error' | 'warning' | 'info'; path: string; message: string };
export type SchemaReport = { blocks: { raw: string; data?: unknown; types: string[] }[]; issues: Issue[]; types: string[]; nodes: number; microdata: number; rdfa: number };
const types = vocabulary.types as Record<string,string[]>;
const properties = vocabulary.properties as Record<string,{ domains: string[]; ranges: string[] }>;
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const schemaContext = (v: unknown) => typeof v === 'string' && /^https?:\/\/schema\.org\/?$/.test(v);
function local(v: string) { return v.replace(/^https?:\/\/schema\.org\//, ''); }
function inherits(type: string, target: string, seen = new Set<string>()): boolean {
  if (type === target) return true;
  if (seen.has(type)) return false;
  seen.add(type); return (types[type] || []).some(parent => inherits(parent, target, seen));
}
export function analyzeSchema(input: string): SchemaReport {
  if (new TextEncoder().encode(input).length > 3 * 1024 * 1024) throw new Error('Limit the input to 3 MB.');
  const report: SchemaReport = { blocks: [], issues: [], types: [], nodes: 0, microdata: 0, rdfa: 0 };
  const add = (severity: Issue['severity'], path: string, message: string) => {
    if (report.issues.length < 500) report.issues.push({ severity, path, message });
  };
  const text = input.trim();
  let sources: string[];
  if (text.startsWith('<')) {
    const doc = parseHtml(text);
    sources = Array.from(doc.querySelectorAll('script')).filter(s => s.getAttribute('type')?.trim().toLowerCase().split(';')[0].trim() === 'application/ld+json').map(s => s.textContent || '');
    report.microdata = doc.querySelectorAll('[itemscope]').length;
    report.rdfa = doc.querySelectorAll('[typeof]').length;
  } else sources = text ? [text] : [];
  if (report.microdata || report.rdfa) add('info', 'Page', `Found ${report.microdata} Microdata item(s) and ${report.rdfa} RDFa type declaration(s). These formats are not validated in this version.`);
  if (!sources.length) add('info', 'Page', 'No JSON-LD found in this input. URL scans inspect source HTML; markup added by JavaScript may be missing.');
  if (sources.length > 100) throw new Error('This page has more than 100 JSON-LD blocks. Paste a smaller section.');
  sources.forEach((raw, index) => {
    const block: SchemaReport['blocks'][number] = { raw, types: [] }; report.blocks.push(block);
    const path = `Block ${index + 1}`;
    let data: unknown;
    try { data = JSON.parse(raw); block.data = data; }
    catch (e) { add('error', path, `Invalid JSON: ${e instanceof Error ? e.message : 'check syntax'}`); return; }
    let visited = 0;
    function visit(value: unknown, at: string, context: boolean, depth: number, root = false) {
      if (++visited > 5000 || depth > 50) throw new Error('JSON-LD is too deeply nested or complex. Paste a smaller block.');
      if (Array.isArray(value)) {
        if (root && !value.length) add('warning', at, 'This array contains no structured data.');
        value.forEach((v,i) => visit(v, `${at}[${i}]`, context, depth + 1, root)); return;
      }
      if (!value || typeof value !== 'object') { if (root) add('error', at, 'JSON-LD must contain an object or an array of objects.'); return; }
      const node = value as Record<string,unknown>;
      if (own(node, '@context')) {
        const c = node['@context'];
        context = schemaContext(c) || (!!c && typeof c === 'object' && !Array.isArray(c) &&
          Object.keys(c).every(k => k === '@vocab') && schemaContext((c as Record<string,unknown>)['@vocab']));
        if (!context) add('info', at + '.@context', 'Custom, mixed, or external contexts are not expanded. Vocabulary checks are skipped here; verify with the Schema.org validator.');
      } else if (root && !context) add('warning', at, 'No Schema.org @context. Add "@context": "https://schema.org" if this is Schema.org data. Vocabulary checks are skipped.');
      const rawTypes = node['@type'];
      const nodeTypes = (Array.isArray(rawTypes) ? rawTypes : rawTypes === undefined ? [] : [rawTypes]);
      if (rawTypes !== undefined && (!nodeTypes.length || nodeTypes.some(t => typeof t !== 'string' || !t.trim()))) add('error', at + '.@type', '@type must be a nonempty string or array of nonempty strings.');
      const names = nodeTypes.filter((t): t is string => typeof t === 'string').map(local);
      if (names.length) { report.nodes++; block.types.push(...names); }
      if (root && !names.length && !own(node, '@graph') && !own(node, '@id')) add('warning', at, 'No @type found on this object.');
      if (node['@id'] !== undefined && typeof node['@id'] !== 'string') add('error', at + '.@id', '@id must be a string.');
      if (node['@graph'] !== undefined && (node['@graph'] === null || typeof node['@graph'] !== 'object')) add('error', at + '.@graph', '@graph must contain an object or array of objects.');
      if (context) for (const name of names) if (!own(types, name)) add('warning', at + '.@type', `“${name}” is not a type in this Schema.org vocabulary snapshot. Check spelling or whether it is an extension.`);
      for (const [key, v] of Object.entries(node)) {
        if (key === '@context') continue;
        if (context && !key.startsWith('@')) {
          const prop = local(key);
          if (!own(properties, prop)) add('warning', at + '.' + key, `“${key}” is not a recognized Schema.org property. Check its spelling or vocabulary.`);
          else {
            const rule = properties[prop];
            const known = names.filter(n => own(types,n));
            if (known.length && rule.domains.length && !known.some(n => rule.domains.some(d => inherits(n,d)))) add('warning', at + '.' + key, `“${prop}” is not normally used on ${known.join(', ')}. Check the property's expected types.`);
            if (v === null || v === '') add('warning', at + '.' + key, 'This property has no value. Supply a value or remove it.');
            for (const item of Array.isArray(v) ? v : [v]) {
              if (typeof item === 'boolean' && !rule.ranges.includes('Boolean')) add('warning', at + '.' + key, `Boolean value is unusual here. Expected: ${rule.ranges.join(', ')}.`);
              if (typeof item === 'number' && rule.ranges.length && !rule.ranges.some(r => ['Number','Integer','Float'].includes(r))) add('warning', at + '.' + key, `Numeric value is unusual here. Expected: ${rule.ranges.join(', ')}.`);
              if (typeof item === 'string' && rule.ranges.length === 1 && rule.ranges[0] === 'URL' && !/^(https?:\/\/|\/|#)/i.test(item)) add('warning', at + '.' + key, 'Expected a URL. Check the address.');
            }
          }
        }
        if (typeof v === 'object' && v !== null) visit(v, at + '.' + key, context, depth + 1, key === '@graph');
      }
    }
    visit(data, path, false, 0, true);
    block.types = [...new Set(block.types)];
  });
  report.types = [...new Set(report.blocks.flatMap(b => b.types))];
  return report;
}
export const vocabularyDate = vocabulary.retrieved;
