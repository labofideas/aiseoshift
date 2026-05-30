import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const SHOTS = path.join(process.cwd(), 'scripts', '.shots');
await fs.mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch();

async function runCase(label, viewport, focusKw) {
	const ctx = await browser.newContext({ viewport });
	const page = await ctx.newPage();
	const errs = [];
	page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
	page.on('pageerror', e => errs.push('pageerror: ' + e.message));

	await page.goto('http://localhost:8788/tools/keyword-density/', { waitUntil: 'networkidle' });
	await page.locator('#url-input').fill('https://aiseoshift.com/blog/ai-tools-for-lawyers/');
	await page.locator('#keyword-input').fill(focusKw);
	await page.locator('#analyze-btn').click();
	await page.locator('.kd-report.visible').waitFor({ timeout: 30000 });
	await page.waitForTimeout(1500);

	const focusCard = await page.locator('.kd-focus-card').count();
	const verdict = await page.locator('.kd-focus-verdict').first().innerText().catch(() => '');
	const verdictText = await page.locator('.kd-focus-verdict-text').first().innerText().catch(() => '');
	const fpCount = await page.locator('.kd-fp').count();
	const recoCount = await page.locator('.kd-rec-item').count();
	const placePillsExample = await page.locator('#single tbody tr').first().locator('.kd-place').count();

	console.log(`\n=== ${label} ===`);
	console.log('focus card:', focusCard);
	console.log('verdict pill:', verdict);
	console.log('verdict text:', verdictText.slice(0, 120) + (verdictText.length > 120 ? '…' : ''));
	console.log('placement pills in focus card:', fpCount);
	console.log('reco items:', recoCount);
	console.log('place pills in first row:', placePillsExample);
	if (errs.length) console.log('errors:', errs.slice(0, 3));

	await page.screenshot({ path: path.join(SHOTS, `kd-${label}.png`), fullPage: true });
	await ctx.close();
}

await runCase('focus-broad-desktop', { width: 1280, height: 900 }, 'AI tools for lawyers');
await runCase('focus-broad-mobile', { width: 375, height: 800 }, 'AI tools for lawyers');
await runCase('focus-tight-desktop', { width: 1280, height: 900 }, 'legal');
await runCase('no-focus-desktop', { width: 1280, height: 900 }, '');

await browser.close();
console.log('\nDone.');
