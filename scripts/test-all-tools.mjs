import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SHOTS = path.join(ROOT, 'scripts', '.shots');
await fs.mkdir(SHOTS, { recursive: true });

const TEST_URL = 'https://aiseoshift.com/blog/ai-tools-for-lawyers/';
const tools = [
	{ id: 'seo-checker', extraField: null },
	{ id: 'meta-checker', extraField: null },
	{ id: 'heading-checker', extraField: null },
	{ id: 'image-checker', extraField: null },
	{ id: 'keyword-density', extraField: { selector: '#keyword-input', value: 'AI tools' } },
];

const browser = await chromium.launch();
const failures = [];

async function audit(tool, viewport, theme) {
	const ctx = await browser.newContext({
		viewport,
		colorScheme: theme === 'dark' ? 'dark' : 'light',
	});
	const page = await ctx.newPage();
	const consoleErrors = [];
	page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
	page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
	if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));

	const url = `http://localhost:8788/tools/${tool.id}/`;
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.locator('#url-input').fill(TEST_URL);
	if (tool.extraField) await page.locator(tool.extraField.selector).fill(tool.extraField.value);
	await page.locator('#analyze-btn').click();
	await page.locator('.report.visible').waitFor({ timeout: 20000 });

	// Wait for hero
	await page.locator('.report-hero').waitFor({ timeout: 5000 });
	const scoreText = (await page.locator('.score-num').first().innerText()).trim();
	if (!/^\d+$/.test(scoreText)) throw new Error(`score not numeric: "${scoreText}"`);
	const ringVisible = await page.locator('.score-ring svg circle.fill').isVisible();
	if (!ringVisible) throw new Error('score ring not visible');
	const chipCount = await page.locator('.hero-chips .chip').count();
	if (chipCount === 0) throw new Error('no chips rendered');
	// Wait for ring animation
	await page.waitForTimeout(1700);
	await page.screenshot({
		path: path.join(SHOTS, `all-${tool.id}-${theme}-${viewport.width}.png`),
		fullPage: true,
	});

	const filtered = consoleErrors.filter((e) => !/favicon|sourcemap/i.test(e));
	if (filtered.length) throw new Error(`console errors: ${filtered.slice(0, 3).join(' | ')}`);
	await ctx.close();
}

const runs = [];
for (const tool of tools) {
	runs.push({ tool, viewport: { width: 1280, height: 900 }, theme: 'light' });
	runs.push({ tool, viewport: { width: 375, height: 800 }, theme: 'light' });
	runs.push({ tool, viewport: { width: 1280, height: 900 }, theme: 'dark' });
}

for (const r of runs) {
	const label = `${r.tool.id} ${r.theme} ${r.viewport.width}px`;
	try {
		console.log(`→ ${label}`);
		await audit(r.tool, r.viewport, r.theme);
		console.log(`  ✓`);
	} catch (e) {
		failures.push(`${label}: ${e.message}`);
		console.error(`  ✗ ${e.message}`);
	}
}

await browser.close();

console.log(`\n${runs.length - failures.length}/${runs.length} passed`);
if (failures.length) {
	console.error('\nFailures:');
	for (const f of failures) console.error('  ' + f);
	process.exit(1);
}
