import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/content/blog';
const files = readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

const EM = '—'; // — only (not en dash – or hyphen -)
let filesChanged = 0;
let replaced = 0;

for (const f of files) {
	const path = `${dir}/${f}`;
	const src = readFileSync(path, 'utf8');
	if (!src.includes(EM)) continue;

	let inFence = false;
	const out = src
		.split('\n')
		.map((line) => {
			// leave fenced code blocks untouched
			if (line.trimStart().startsWith('```')) {
				inFence = !inFence;
				return line;
			}
			if (inFence || !line.includes(EM)) return line;

			replaced += (line.match(/—/g) || []).length;

			// Markdown table rows: em dash is usually an empty/N-A cell placeholder.
			// Use a hyphen (not banned) instead of injecting commas into cells.
			if (line.trimStart().startsWith('|')) {
				return line.replace(/—/g, '-');
			}

			let nl = line.replace(/\s*—\s*/g, ', ');
			// tidy artifacts the replacement can create
			nl = nl
				.replace(/,\s*,/g, ',')
				.replace(/\s+,/g, ',')
				.replace(/,\s*([.;:!?])/g, '$1')
				.replace(/,\s*\)/g, ')')
				.replace(/\(\s*,\s*/g, '(')
				.replace(/^\s*,\s*/, '')
				.replace(/,\s*$/, '');
			return nl;
		})
		.join('\n');

	if (out !== src) {
		writeFileSync(path, out);
		filesChanged++;
	}
}

console.log(`Files changed: ${filesChanged}, em dashes replaced: ${replaced}`);
