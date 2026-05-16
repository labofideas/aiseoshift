import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const SHOTS = path.join(process.cwd(), 'scripts', '.shots');
await fs.mkdir(SHOTS, { recursive: true });

const URL_TO_TEST = 'https://aiseoshift.com/blog/ai-tools-for-lawyers/';
const browser = await chromium.launch();

async function audit(viewport, theme) {
	const ctx = await browser.newContext({ viewport, colorScheme: theme === 'dark' ? 'dark' : 'light' });
	const page = await ctx.newPage();
	const consoleErrors = [];
	page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
	page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
	if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));

	await page.goto('http://localhost:8788/tools/keyword-density/', { waitUntil: 'networkidle' });
	await page.locator('#url-input').fill(URL_TO_TEST);
	await page.locator('#keyword-input').fill('AI tools');
	await page.locator('#analyze-btn').click();
	await page.locator('.kd-report.visible').waitFor({ timeout: 20000 });
	await page.locator('.kd-cloud-word').first().waitFor({ timeout: 5000 });

	const tiles = await page.locator('.kd-meta-tile').count();
	if (tiles < 5) throw new Error(`expected 5 meta tiles, got ${tiles}`);
	const cloudWords = await page.locator('.kd-cloud-word').count();
	if (cloudWords === 0) throw new Error('no cloud words');
	const singleRows = await page.locator('#single tbody tr').count();
	if (singleRows < 5) throw new Error(`expected 5+ single keyword rows, got ${singleRows}`);
	const matrixRows = await page.locator('.kd-matrix tbody tr').count();
	if (matrixRows < 3) throw new Error(`expected 3+ matrix rows, got ${matrixRows}`);
	const donutVisible = await page.locator('.kd-donut svg').isVisible();
	if (!donutVisible) throw new Error('donut not visible');

	await page.waitForTimeout(800);
	await page.screenshot({ path: path.join(SHOTS, `kd-${theme}-${viewport.width}.png`), fullPage: true });

	const filtered = consoleErrors.filter((e) => !/favicon|sourcemap|placeholder/i.test(e));
	if (filtered.length) throw new Error(`console errors: ${filtered.slice(0, 3).join(' | ')}`);
	await ctx.close();
}

const runs = [
	['light', { width: 1280, height: 900 }],
	['dark', { width: 1280, height: 900 }],
	['light', { width: 375, height: 800 }],
];

for (const [theme, viewport] of runs) {
	const label = `${theme} ${viewport.width}px`;
	try {
		console.log(`→ ${label}`);
		await audit(viewport, theme);
		console.log(`  ✓`);
	} catch (e) {
		console.error(`  ✗ ${e.message}`);
		process.exitCode = 1;
	}
}

await browser.close();
