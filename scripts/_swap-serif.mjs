import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SANS = "'Figtree', system-ui, -apple-system, sans-serif";
const SANS_SVG = 'Figtree, system-ui, sans-serif';

let files = 0;
let hits = 0;

function walk(dir) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) {
			walk(p);
		} else if (/\.(astro|css|mdx|md|ts|tsx|js|jsx)$/.test(name)) {
			const src = readFileSync(p, 'utf8');
			if (!src.includes('Iowan Old Style')) continue;
			let out = src;
			// CSS / quoted font-family values
			out = out.replace(/'Iowan Old Style'[^;\n}]*?serif/g, () => { hits++; return SANS; });
			// SVG / unquoted font-family attribute values
			out = out.replace(/Iowan Old Style,[^";\n]*?serif/g, () => { hits++; return SANS_SVG; });
			if (out !== src) {
				writeFileSync(p, out);
				files++;
			}
		}
	}
}

walk('src');
console.log(`Files changed: ${files}, serif font-family declarations swapped: ${hits}`);
