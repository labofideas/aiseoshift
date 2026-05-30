import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SHOTS = path.join(ROOT, 'scripts', '.shots');
await fs.mkdir(SHOTS, { recursive: true });

const TOOL_URL = 'http://localhost:8788/tools/seo-checker/';
const TEST_URL = 'https://aiseoshift.com/blog/ai-tools-for-lawyers/';

const browser = await chromium.launch();
const errors = [];
let exitCode = 0;

async function run(label, fn) {
	console.log(`→ ${label}`);
	try {
		await fn();
		console.log(`  ✓ ${label}`);
	} catch (e) {
		exitCode = 1;
		errors.push(`${label}: ${e.message}`);
		console.error(`  ✗ ${label}: ${e.message}`);
	}
}

async function newPage(viewport, theme = 'light') {
	const ctx = await browser.newContext({
		viewport,
		colorScheme: theme === 'dark' ? 'dark' : 'light',
	});
	const page = await ctx.newPage();
	const consoleErrors = [];
	page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
	page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
	if (theme === 'dark') {
		await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
	}
	return { page, ctx, consoleErrors };
}

async function audit(label, viewport, theme, expectReport) {
	const { page, ctx, consoleErrors } = await newPage(viewport, theme);
	await page.goto(TOOL_URL, { waitUntil: 'networkidle' });
	await page.screenshot({ path: path.join(SHOTS, `${label}-initial.png`), fullPage: false });

	if (expectReport) {
		await page.locator('#url-input').fill(TEST_URL);
		await page.locator('#analyze-btn').click();
		await page.locator('.report.visible').waitFor({ timeout: 15000 });
		await page.locator('.score-num').waitFor({ timeout: 5000 });
		// Wait for ring animation
		await page.waitForTimeout(1700);
		await page.screenshot({ path: path.join(SHOTS, `${label}-report.png`), fullPage: true });

		// Sanity checks
		const scoreText = (await page.locator('.score-num').first().innerText()).trim();
		if (!/^\d+$/.test(scoreText)) throw new Error(`score not numeric: "${scoreText}"`);
		const ringVisible = await page.locator('.score-ring svg circle.fill').isVisible();
		if (!ringVisible) throw new Error('score ring svg not visible');
		const cardCount = await page.locator('.score-card').count();
		if (cardCount < 5) throw new Error(`expected 5 score cards, got ${cardCount}`);
		const donutVisible = await page.locator('.donut svg').isVisible();
		if (!donutVisible) throw new Error('donut not visible');
		const issueRows = await page.locator('.issues-table .row').count();
		if (issueRows === 0) throw new Error('no issue rows rendered');
		const passingChecks = await page.locator('.check-card').count();
		if (passingChecks === 0) throw new Error('no passing checks rendered');
	}

	if (consoleErrors.length) {
		const filtered = consoleErrors.filter((e) => !/favicon|sourcemap/i.test(e));
		if (filtered.length) throw new Error(`console errors: ${filtered.slice(0, 3).join(' | ')}`);
	}
	await ctx.close();
}

await run('desktop light + report', () => audit('desktop-light', { width: 1280, height: 900 }, 'light', true));
await run('mobile light + report', () => audit('mobile-light', { width: 375, height: 800 }, 'light', true));
await run('desktop dark + report', () => audit('desktop-dark', { width: 1280, height: 900 }, 'dark', true));
await run('error path (bad URL)', async () => {
	const { page, ctx, consoleErrors } = await newPage({ width: 1280, height: 900 });
	await page.goto(TOOL_URL, { waitUntil: 'networkidle' });
	await page.locator('#url-input').fill('not-a-real-url');
	await page.locator('#analyze-btn').click();
	await page.locator('.tool-status.error').waitFor({ timeout: 5000 });
	const txt = (await page.locator('#tool-status').innerText()).trim();
	if (!txt) throw new Error('error message not displayed');
	await page.screenshot({ path: path.join(SHOTS, 'error.png'), fullPage: false });
	await ctx.close();
});
await run('paste-html tab works', async () => {
	const { page, ctx } = await newPage({ width: 1280, height: 900 });
	await page.goto(TOOL_URL, { waitUntil: 'networkidle' });
	await page.locator('.tab-btn[data-tab="html"]').click();
	await page.locator('#html-input').fill('<html><head><title>Test Page Title For Audit Tool</title><meta name="description" content="A test meta description that is long enough to pass the length check requirement for the audit."></head><body><h1>Test Heading</h1><h2>Section A</h2><p>' + 'word '.repeat(400) + '</p><a href="/x">Internal</a><a href="/y">Internal 2</a></body></html>');
	await page.locator('#analyze-btn').click();
	await page.locator('.report.visible').waitFor({ timeout: 5000 });
	const source = (await page.locator('.hero-url').innerText()).trim();
	if (!source.toLowerCase().includes('pasted')) throw new Error(`expected 'Pasted HTML', got "${source}"`);
	await page.screenshot({ path: path.join(SHOTS, 'paste-html.png'), fullPage: true });
	await ctx.close();
});

await browser.close();

console.log('\n=== Screenshots ===');
for (const f of await fs.readdir(SHOTS)) {
	const s = await fs.stat(path.join(SHOTS, f));
	console.log(`  ${f}  (${(s.size / 1024).toFixed(1)} KB)`);
}

if (errors.length) {
	console.error(`\n${errors.length} failure(s)`);
	process.exit(exitCode);
}
console.log('\nAll passed.');
