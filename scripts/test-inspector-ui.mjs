import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless:true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel:process.env.PLAYWRIGHT_CHANNEL } : {}) });
await mkdir('scripts/.shots', { recursive:true });
let count = 0;
try {
  for (const tool of ['schema-markup-validator','website-technology-checker']) {
    for (const width of [1280,375]) {
      const context = await browser.newContext({ viewport:{ width,height:900 }, acceptDownloads:true });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/tools/${tool}/`, { waitUntil:'networkidle' });
      await page.locator('#scan-example').click();
      await page.locator('#scan-results').waitFor({ state:'visible' });
      const report = await page.locator('#scan-report').innerText();
      assert.match(report, tool.startsWith('schema') ? /misspelledProperty/ : /woocommerce/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile overflow');
      const downloadEvent = page.waitForEvent('download');
      await page.locator('#scan-download').click();
      const download = await downloadEvent;
      const content = JSON.parse(await readFile(await download.path(), 'utf8'));
      assert.equal(content.source,'Pasted code');
      await page.evaluate(() => window.scrollTo(0,0));
      await page.screenshot({ animations:'disabled', path:`scripts/.shots/${tool}-${width}.png`, fullPage:true });
      await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
      await page.evaluate(() => window.scrollTo(0,0));
      await page.screenshot({ animations:'disabled', path:`scripts/.shots/${tool}-${width}-dark.png`, fullPage:true });
      await page.locator('#scan-clear').click();
      assert.equal(await page.locator('#scan-results').isVisible(), false);
      await page.locator('#scan-code').fill(tool.startsWith('schema') ? '{bad json}' : '<p>WordPress is mentioned here.</p>');
      await page.locator('#scan-run').click();
      await page.locator('#scan-results').waitFor({ state:'visible' });
      assert.match(await page.locator('#scan-report').innerText(), tool.startsWith('schema') ? /Invalid JSON/ : /No recognizable/);
      await page.locator('#input-mode').selectOption('url');
      await page.route('**/api/fetch-page?**', route => route.fulfill({ contentType:'application/json', body:JSON.stringify({url:'https://example.com/',html:tool.startsWith('schema') ? '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Test"}</script>' : '<meta name="generator" content="WordPress"><link href="/wp-content/themes/astra/style.css">',headers:{server:'nginx'} }) }));
      await page.route('**/api/theme-info?**', route => route.fulfill({ contentType:'application/json', body:JSON.stringify({ fields:{'Theme Name':'Astra','Author':'Brainstorm Force','Version':'1.0','Template':'parent-theme'} }) }));
      await page.locator('#scan-url').fill('example.com');
      await page.locator('#scan-run').click();
      await page.locator('#scan-results').waitFor({ state:'visible' });
      assert.match(await page.locator('#scan-report').innerText(), tool.startsWith('schema') ? /No issues found/ : /Declared parent theme: parent-theme/);
      await page.unroute('**/api/fetch-page?**');
      await page.route('**/api/fetch-page?**', route => route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'Too many requests. Please wait a minute.'})}));
      await page.locator('#scan-run').click();
      await page.waitForFunction(() => document.querySelector('#scan-status').textContent.includes('Too many requests'));
      assert.equal(await page.locator('#scan-results').isVisible(),false,'stale result hidden');
      assert.equal(await page.locator('#scan-run').isEnabled(),true);
      assert.deepEqual(errors,[]);
      console.log(`PASS ${tool} ${width}px: example, export, reset, URL, failure, overflow`); count++;
      await context.close();
    }
  }
  // Real local API (no route mocks): rejection and one public URL scan.
  const response = await browser.newContext();
  const blocked = await response.request.get(`${base}/api/fetch-page?url=http://127.0.0.1/`);
  assert.equal(blocked.status(),403); count++;
  const live = await response.request.get(`${base}/api/fetch-page?url=https://aiseoshift.com/`, { timeout:25000 });
  const data = await live.json(); assert.equal(live.status(),200,JSON.stringify(data)); assert.match(data.html, /<html/i); count++;
  await response.close();
  console.log(`${count} UI/API scenarios passed.`);
} finally { await browser.close(); }
