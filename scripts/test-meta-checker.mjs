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

	await page.goto('http://localhost:8788/tools/meta-checker/', { waitUntil: 'networkidle' });
	await page.locator('#url-input').fill(URL_TO_TEST);
	await page.locator('#analyze-btn').click();
	await page.locator('.mt-report.visible').waitFor({ timeout: 20000 });
	await page.locator('.mt-big-score').waitFor({ timeout: 5000 });

	// sanity
	const score = (await page.locator('.mt-big-score').innerText()).trim();
	if (!/^\d+$/.test(score)) throw new Error(`score not numeric: ${score}`);
	const cards = await page.locator('.mt-card').count();
	if (cards < 5) throw new Error(`expected 5+ cards, got ${cards}`);
	const serpVisible = await page.locator('.mt-serp-window').isVisible();
	if (!serpVisible) throw new Error('SERP preview not visible');
	const tableRows = await page.locator('.mt-table tbody tr').count();
	if (tableRows < 8) throw new Error(`expected 8+ rows, got ${tableRows}`);

	await page.waitForTimeout(800);
	await page.screenshot({ path: path.join(SHOTS, `meta-${theme}-${viewport.width}.png`), fullPage: true });

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
