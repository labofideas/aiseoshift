import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const SHOTS = path.join(process.cwd(), 'scripts', '.shots-audit');
await fs.mkdir(SHOTS, { recursive: true });

const TEST = 'https://aiseoshift.com/blog/ai-tools-for-lawyers/';

const tools = [
	{ id: 'seo-checker', extras: [] },
	{ id: 'meta-checker', extras: [] },
	{ id: 'heading-checker', extras: [{ sel: '#keyword-input', value: 'AI tools' }] },
	{ id: 'image-checker', extras: [] },
	{ id: 'keyword-density', extras: [{ sel: '#keyword-input', value: 'AI tools' }] },
];

const viewports = [
	{ w: 320, h: 700, label: 'mobile-sm' },
	{ w: 768, h: 900, label: 'tablet' },
	{ w: 1024, h: 900, label: 'desktop-sm' },
	{ w: 1440, h: 900, label: 'desktop-lg' },
];

const browser = await chromium.launch();

for (const tool of tools) {
	for (const vp of viewports) {
		const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
		const page = await ctx.newPage();
		try {
			await page.goto(`http://localhost:8788/tools/${tool.id}/`, { waitUntil: 'networkidle' });
			await page.locator('#url-input').fill(TEST);
			for (const ex of tool.extras) await page.locator(ex.sel).fill(ex.value);
			const btn = page.locator('[id^=analyze-btn]').first();
			await btn.click();
			// wait for any report container
			await page.waitForSelector('.report.visible, .mt-report.visible, .kd-report.visible, .hc-report.visible, .ic-report.visible', { timeout: 20000 });
			await page.waitForTimeout(900);
			await page.screenshot({ path: path.join(SHOTS, `${tool.id}_${vp.label}.png`), fullPage: true });
			console.log(`✓ ${tool.id} ${vp.label}`);
		} catch (e) {
			console.error(`✗ ${tool.id} ${vp.label}: ${e.message}`);
		}
		await ctx.close();
	}
}

await browser.close();
console.log('\nDone.');
