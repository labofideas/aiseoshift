// Usage: node scripts/refresh-schema-vocabulary.mjs /path/to/schemaorg-current-https.jsonld
// Download the official source linked in docs/inspector-tools.md before running.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const input = process.argv[2];
if (!input) throw new Error('Pass the downloaded Schema.org JSON-LD file path.');
const raw = await readFile(input);
const graph = JSON.parse(raw)['@graph'];
const refs = v => (Array.isArray(v) ? v : v ? [v] : []).filter(x => x['@id']?.startsWith('schema:')).map(x => x['@id'].slice(7));
const types = {}; const properties = {};
for (const node of graph) {
  if (!node['@id']?.startsWith('schema:')) continue;
  const name = node['@id'].slice(7);
  const kinds = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  if (kinds.includes('rdfs:Class')) types[name] = refs(node['rdfs:subClassOf']);
  if (kinds.includes('rdf:Property')) properties[name] = { domains:refs(node['schema:domainIncludes']), ranges:refs(node['schema:rangeIncludes']) };
}
if (Object.keys(types).length < 500 || Object.keys(properties).length < 1000) throw new Error('Unexpected vocabulary structure; inspect the source before updating.');
const data = { source:'https://schema.org/version/latest/schemaorg-current-https.jsonld', retrieved:new Date().toISOString().slice(0,10), sha256:createHash('sha256').update(raw).digest('hex'), types, properties };
await writeFile(new URL('../src/lib/tools/schema-vocabulary.json',import.meta.url),JSON.stringify(data));
console.log(`Updated ${Object.keys(types).length} types and ${Object.keys(properties).length} properties.`);
