import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/content/blog';
const MAX = 165; // only trim descriptions longer than this
const TARGET = 160;

function unquote(v) {
	v = v.trim();
	if (v.startsWith('"') && v.endsWith('"')) {
		return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
	}
	if (v.startsWith("'") && v.endsWith("'")) {
		return v.slice(1, -1).replace(/''/g, "'");
	}
	return v;
}

function trimDesc(s) {
	if (s.length <= MAX) return null;
	const cut = s.slice(0, TARGET);
	// prefer a sentence boundary that is not too short
	const lastPunct = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
	if (lastPunct >= 100) return s.slice(0, lastPunct + 1).trim();
	// otherwise cut at the last word boundary, drop any trailing punctuation
	const w = cut.lastIndexOf(' ');
	return s.slice(0, w).replace(/[\s,;:.–—-]+$/, '').trim();
}

function yamlDouble(s) {
	return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

let changed = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx') || x.endsWith('.md'))) {
	const path = `${dir}/${f}`;
	const src = readFileSync(path, 'utf8');
	const parts = src.split(/^---$/m);
	if (parts.length < 3) continue;
	const fm = parts[1];
	const lines = fm.split('\n');
	let touched = false;
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(/^description:\s*(.+)$/);
		if (!m) continue;
		const val = unquote(m[1]);
		const trimmed = trimDesc(val);
		if (trimmed && trimmed.length >= 80) {
			lines[i] = `description: ${yamlDouble(trimmed)}`;
			touched = true;
		}
		break;
	}
	if (touched) {
		parts[1] = lines.join('\n');
		writeFileSync(path, parts.join('---'));
		changed++;
	}
}
console.log(`Descriptions trimmed: ${changed}`);
