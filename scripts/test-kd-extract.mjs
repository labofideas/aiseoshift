import { chromium } from 'playwright';
const b = await chromium.launch();
async function check(url, label) {
	const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
	await p.goto('http://localhost:8788/tools/keyword-density/', { waitUntil: 'networkidle' });
	await p.locator('#url-input').fill(url);
	await p.locator('#analyze-btn').click();
	await p.locator('.kd-report.visible').waitFor({ timeout: 40000 });
	await p.waitForTimeout(500);
	const rows = await p.locator('#single tbody tr').evaluateAll(els =>
		els.slice(0, 10).map(el => ({
			rank: el.children[0]?.textContent?.trim(),
			term: el.children[1]?.textContent?.trim(),
			density: el.children[2]?.textContent?.trim().replace(/\s+/g, ' '),
		}))
	);
	const stats = await p.locator('.kd-meta-val').allInnerTexts();
	console.log(`\n=== ${label} ===`);
	console.log('totals:', stats.join(' | '));
	console.log('top 10 single keywords:');
	rows.forEach(r => console.log(`  #${r.rank} ${r.term.padEnd(28)} ${r.density}`));
	await p.context().close();
}
await check('https://aiseoshift.com/blog/ai-tools-for-lawyers/', 'Clean Astro page (control)');
await check('https://wordpress.org/about/', 'WordPress.org About (WP page)');
await b.close();
