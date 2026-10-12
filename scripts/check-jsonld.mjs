// Fails the build if any built page has invalid JSON-LD (Google reports these as "Unparsable structured data").
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist/client';
const bad = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) {
      const html = readFileSync(p, 'utf8');
      for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
        try { JSON.parse(m[1]); } catch (e) { bad.push(`${p}: ${e.message}`); }
      }
    }
  }
};
walk(root);
if (bad.length) {
  console.error(`Invalid JSON-LD on ${bad.length} block(s):\n` + bad.join('\n'));
  process.exit(1);
}
console.log('JSON-LD check passed');
