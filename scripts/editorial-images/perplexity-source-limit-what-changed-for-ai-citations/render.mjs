// Rebuild: node scripts/editorial-images/perplexity-source-limit-what-changed-for-ai-citations/render.mjs
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const slug = 'perplexity-source-limit-what-changed-for-ai-citations';
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(await readFile(new URL('./artwork.html', import.meta.url), 'utf8'));
  await page.evaluate(() => document.fonts.ready);
  const png = await page.locator('#feature').screenshot();
  if (process.env.PNG_OUT) await writeFile(process.env.PNG_OUT, png);
  const target = new URL(`../../../public/images/posts/${slug}-feature.webp`, import.meta.url);
  const info = await sharp(png).webp({ quality: 86 }).toFile(fileURLToPath(target));
  const alt = 'Thumbnail reading 24 to 10 sources per answer, with a source list shrinking from 24 rows to 10 highlighted rows.';
  const hero = { src: `/images/posts/${slug}-feature.webp`, width: info.width, height: info.height, bytes: info.size, alt };
  console.log(hero);
  const og = await sharp(png).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 86, mozjpeg: true }).toFile(fileURLToPath(new URL(`../../../public/images/posts/${slug}-feature-og.jpg`, import.meta.url)));
  const manifestPath = new URL('../../../src/data/image-manifest.json', import.meta.url);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest[slug] = { hero, og: { src: `/images/posts/${slug}-feature-og.jpg`, width: og.width, height: og.height, bytes: og.size, alt } };
  await writeFile(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
} finally { await browser.close(); }
