import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const temp = await mkdtemp(path.join(tmpdir(), 'aiseoshift-inspector-'));
let passed = 0;
const check = (name, fn) => { fn(); passed++; console.log(`PASS ${name}`); };
try {
  await build({ entryPoints: ['src/lib/tools/public-fetch.ts'], bundle: true, platform: 'node', format: 'esm', outfile: path.join(temp,'fetch.mjs') });
  const { publicUrl, publicAddress, fetchPublic, rateLimited } = await import(pathToFileURL(path.join(temp,'fetch.mjs')));
  for (const url of ['http://127.0.0.1','http://2130706433','http://0x7f000001','http://[::1]','http://user:pass@example.com','file:///etc/passwd','https://foo.local','http://example.com:8080','https://localhost.']) {
    check(`blocked URL ${url}`, () => assert.throws(() => publicUrl(url)));
  }
  check('normal public URL', () => assert.equal(publicUrl('https://example.com/a#b').href, 'https://example.com/a'));
  for (const ip of ['127.0.0.1','10.0.0.1','100.64.1.1','169.254.169.254','172.31.0.1','192.168.0.1','0.0.0.0','224.1.1.1','::1','fc00::1','::ffff:127.0.0.1','2001:db8::1','2001::1','2001:0000::1','3fff::1']) check(`blocked DNS ${ip}`, () => assert.equal(publicAddress(ip),false));
  check('public IPv4/IPv6', () => { assert(publicAddress('93.184.216.34')); assert(publicAddress('2606:4700:4700::1111')); });
  const originalFetch = globalThis.fetch;
  let targetCalls = 0;
  const mock = (target, addresses = ['93.184.216.34']) => {
    targetCalls = 0;
    globalThis.fetch = async (input, options) => {
      const url = new URL(input);
      if (url.hostname === 'cloudflare-dns.com') return Response.json({ Status: 0, Answer: addresses.map(data => ({ type: data.includes(':') ? 28 : 1, data })) });
      targetCalls++; return target(url, options);
    };
  };
  try {
    mock(() => new Response('<html>OK</html>', { headers: { 'content-type':'text/html', server:'nginx', 'set-cookie':'secret' } }));
    const page = await fetchPublic('https://example.com');
    check('compatible HTML result and header allowlist', () => { assert.equal(page.html,'<html>OK</html>'); assert.equal(page.headers.server,'nginx'); assert.equal(page.headers['set-cookie'],undefined); });
    mock(() => new Response('', { status:302, headers:{ location:'http://127.0.0.1/private' } }));
    await assert.rejects(fetchPublic('https://example.com'), /public domain/); passed++; assert.equal(targetCalls,1);
    mock(() => { throw new Error('should not fetch'); }, ['10.0.0.1']);
    await assert.rejects(fetchPublic('https://example.com'), /not allowed/); passed++; assert.equal(targetCalls,0);
    mock(() => new Response(new Uint8Array(3*1024*1024+1), { headers:{ 'content-type':'text/html' } }));
    await assert.rejects(fetchPublic('https://example.com'), /too large/); passed++;
    mock(() => new Response('image', { headers:{ 'content-type':'image/png' } }));
    await assert.rejects(fetchPublic('https://example.com'), /HTML/); passed++;
    mock(() => new Response('', { status:302, headers:{ location:'https://example.com/loop' } }));
    await assert.rejects(fetchPublic('https://example.com'), /redirects/); passed++; assert.equal(targetCalls,5);
    const limited = await rateLimited(new Request('https://aiseoshift.com'), { limit: async () => ({ success:false }) });
    check('edge rate-limit result', () => assert(limited));
  } finally { globalThis.fetch = originalFetch; }
  const bundle = await build({ stdin: { contents: 'export { analyzeSchema } from "./src/lib/tools/schema"; export { analyzeTechnology } from "./src/lib/tools/technology";', resolveDir: process.cwd() }, bundle:true, format:'iife', globalName:'Inspect', write:false });
  const browser = await chromium.launch({ headless:true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel:process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    const page = await browser.newPage();
    await page.addScriptTag({ content:bundle.outputFiles[0].text });
    const tests = await page.evaluate(() => {
      const { analyzeSchema:s, analyzeTechnology:t } = Inspect;
      const tests = [];
      function check(name, value) { if (!value) throw new Error(name); tests.push(name); }
      const schema = obj => s(JSON.stringify(obj));
      const valid = schema({ '@context':'https://schema.org', '@graph':[{'@type':'Article',headline:'Title',author:{'@type':'Person',name:'Alex'}},{'@type':'Organization',name:'Test'}] });
      check('graph, nested entities, inherited properties', valid.nodes === 3 && valid.issues.length === 0);
      check('invalid JSON', s('{"@type":').issues.some(i=>i.severity==='error'));
      check('unknown type', schema({'@context':'https://schema.org','@type':'NotARealType'}).issues.some(i=>i.message.includes('not a type')));
      check('unknown property', schema({'@context':'https://schema.org','@type':'Article',typo:'x'}).issues.some(i=>i.message.includes('not a recognized')));
      check('primitive root', schema(42).issues.some(i=>i.severity==='error'));
      check('invalid type array', schema({'@context':'https://schema.org','@type':[42]}).issues.some(i=>i.severity==='error'));
      check('missing context', schema({'@type':'Article'}).issues.some(i=>i.message.includes('@context')));
      check('custom context skips vocabulary', schema({'@context':{'@vocab':'https://custom.test/'},'@type':'Custom',foo:1}).issues.every(i=>!i.message.includes('not a recognized')));
      check('prototype property safe', schema(JSON.parse('{"@context":"https://schema.org","@type":"Article","__proto__":1}')).issues.some(i=>i.message.includes('not a recognized')));
      const html = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Title"}</script><script type="application/ld+json">{oops}</script><div itemscope></div><div typeof="Thing"></div>';
      const report = s(html);
      check('multiple blocks and unsupported format notices', report.blocks.length===2 && report.microdata===1 && report.rdfa===1 && report.issues.some(i=>i.severity==='error'));
      check('no markup', s('<h1>Hello</h1>').blocks.length===0);
      const wp = t('<meta name="generator" content="WordPress 6.8"><link href="/wp-content/themes/astra/style.css"><script src="/wp-content/plugins/woocommerce/assets/test.js"></script><script src="/wp-content/plugins/woocommerce/assets/other.js"></script>', 'https://example.com');
      check('WP theme, plugin deduplication and relative paths', wp.wordpress && wp.themes[0].stylesheet==='https://example.com/wp-content/themes/astra/style.css' && wp.plugins.length===1 && wp.plugins[0]==='woocommerce');
      check('plain prose does not fingerprint', t('<p>We compare WordPress, Shopify and React</p>','https://example.com').detections.length===0);
      check('framework and infrastructure', t('<script src="/_next/static/main.js"></script>','https://example.com',{'cf-ray':'abc'}).detections.length===2);
      check('HTML injection inert', (s('<script>window.hacked=1</script><img src="https://malicious.invalid/image" onerror="window.hacked=1">'), !window.hacked));
      return tests;
    });
    for (const test of tests) { passed++; console.log('PASS ' + test); }
  } finally { await browser.close(); }
  console.log(`${passed} checks passed.`);
} finally { await rm(temp, { recursive:true, force:true }); }
