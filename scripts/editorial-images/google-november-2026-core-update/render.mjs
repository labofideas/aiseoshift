// Rebuild the HTML/CSS editorial artwork: node scripts/editorial-images/google-november-2026-core-update/render.mjs
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const slug = 'google-november-2026-core-update';
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 1660, height: 1300 }, deviceScaleFactor: 1 });
  await page.setContent(await readFile(new URL('./artwork.html', import.meta.url), 'utf8'));
  await page.evaluate(() => document.fonts.ready);
  const manifestPath = new URL('../../../src/data/image-manifest.json', import.meta.url);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const records = {};
  for (const id of ['feature', 'monitor', 'timeline']) {
    const png = await page.locator(`#${id}`).screenshot();
    const target = new URL(`../../../public/images/posts/${slug}-${id}.webp`, import.meta.url);
    const info = await sharp(png).webp({ quality: 94 }).toFile(fileURLToPath(target));
    records[id] = { src: `/images/posts/${slug}-${id}.webp`, width: info.width, height: info.height, bytes: info.size };
    console.log(`${id}: ${info.width}×${info.height}, ${info.size} bytes`);
  }
  records.feature.alt = 'Google November 2026 core update: launched November 10; rollout in progress as of November 17. What website and brand owners should do now.';
  records.monitor.alt = 'Six monitoring priorities: search impressions and clicks, queries and CTR, brand versus discovery, country and device, organic business outcomes, and technical health.';
  records.timeline.alt = 'Action timeline: save a baseline during the rollout; fix confirmed problems immediately; assess impact at least a week after completion; prioritize improvements after finding a pattern.';
  manifest[slug] = { hero: records.feature, og: records.feature, inline: [records.monitor, records.timeline] };
  await writeFile(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
} finally {
  await browser.close();
}
