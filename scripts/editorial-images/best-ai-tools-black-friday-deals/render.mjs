// Rebuild the thumbnails: node scripts/editorial-images/best-ai-tools-black-friday-deals/render.mjs
// feature = post hero + og image; submit = og image for /submit-ai-deal/.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const slug = 'best-ai-tools-black-friday-deals';
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 1660, height: 1900 }, deviceScaleFactor: 1 });
  await page.setContent(await readFile(new URL('./artwork.html', import.meta.url), 'utf8'));
  await page.evaluate(() => document.fonts.ready);
  const records = {};
  for (const id of ['feature', 'submit']) {
    const png = await page.locator(`#${id}`).screenshot();
    const target = new URL(`../../../public/images/posts/${slug}-${id}.webp`, import.meta.url);
    const info = await sharp(png).webp({ quality: 90 }).toFile(fileURLToPath(target));
    records[id] = { src: `/images/posts/${slug}-${id}.webp`, width: info.width, height: info.height, bytes: info.size };
    console.log(`${id}: ${info.width}x${info.height}, ${info.size} bytes`);
  }
  records.feature.alt = 'Black Friday 2026 AI tool deals, up to 57% off: ElevenLabs, Adobe Firefly, SE Ranking and AdCreative.ai among 55 tools checked on vendor sites.';
  const manifestPath = new URL('../../../src/data/image-manifest.json', import.meta.url);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest[slug] = { hero: records.feature, og: records.feature };
  await writeFile(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
} finally {
  await browser.close();
}
