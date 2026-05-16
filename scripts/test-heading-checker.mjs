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

	await page.goto('http://localhost:8788/tools/heading-checker/', { waitUntil: 'networkidle' });
	await page.locator('#url-input').fill(URL_TO_TEST);
	await page.locator('#keyword-input').fill('AI tools');
	await page.locator('#analyze-btn').click();
	await page.locator('.hc-report.visible').waitFor({ timeout: 20000 });
	await page.locator('.hc-stat-bar').waitFor({ timeout: 5000 });

	const statTiles = await page.locator('.hc-stat-tile').count();
	if (statTiles < 9) throw new Error(`expected 9 stat tiles, got ${statTiles}`);
	const cards = await page.locator('.hc-card').count();
	if (cards < 4) throw new Error(`expected 4+ cards, got ${cards}`);
	const treeNodes = await page.locator('.hc-tree-root .hc-tree-node').count();
	if (treeNodes < 3) throw new Error(`expected 3+ tree nodes, got ${treeNodes}`);
	const tableRows = await page.locator('#table tbody tr').count();
	if (tableRows < 5) throw new Error(`expected 5+ table rows, got ${tableRows}`);

	await page.waitForTimeout(800);
	await page.screenshot({ path: path.join(SHOTS, `hc2-${theme}-${viewport.width}.png`), fullPage: true });

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
