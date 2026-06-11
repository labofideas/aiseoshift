import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/content/blog';
const files = readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

// Only clear VERB forms. Noun uses ("operating leverage", "your leverage",
// "citation leverage", "high-leverage") are intentionally preserved.
const rules = [
	[/\bLeveraging\b/g, 'Using'],
	[/\bleveraging\b/g, 'using'],
	[/\bleverages\b/g, 'uses'],
	[/\bleveraged\b/g, 'used'],
	[/\bTo leverage\b/g, 'To use'],
	[/\bto leverage\b/g, 'to use'],
	[/\b(can|cannot|could|should|would|will|must|help you|helps you) leverage\b/g, '$1 use'],
	[/\b(you|we|they|teams|brands|sites|businesses|agencies) leverage\b/g, '$1 use'],
];

let filesChanged = 0;
let replaced = 0;
for (const f of files) {
	const path = `${dir}/${f}`;
	const src = readFileSync(path, 'utf8');
	if (!/leverag/i.test(src)) continue;
	let out = src;
	for (const [re, to] of rules) {
		out = out.replace(re, (m, ...g) => {
			replaced++;
			return to.replace('$1', g[0] ?? '');
		});
	}
	if (out !== src) {
		writeFileSync(path, out);
		filesChanged++;
	}
}
console.log(`Files changed: ${filesChanged}, verb 'leverage' forms replaced: ${replaced}`);
