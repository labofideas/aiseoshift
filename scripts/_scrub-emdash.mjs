// One-off: scrub em-dashes from blog MDX in a readability-preserving way.
// Rules, applied outside fenced code blocks (```...```):
//  - numeric/word ranges around an em-dash  ->  " to "   (e.g. "6—8" -> "6 to 8")
//  - table rows (lines beginning with |)     ->  em-dash becomes "-"
//  - spaced em-dash " — " in prose           ->  ", " (comma join)
//  - tight em-dash "word—word"               ->  ", "
// Em-dash characters handled: — (U+2014) and the rarer ― (U+2015).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/blog';
const DASH = /[—―]/;

function scrubLine(line) {
  if (!DASH.test(line)) return line;

  // Table row: keep structure, em-dash -> hyphen
  if (/^\s*\|/.test(line)) {
    return line.replace(/\s*[—―]\s*/g, ' - ').replace(/\|\s+-\s+/g, '| - ');
  }

  let out = line;
  // Ranges: digits or number-words on both sides -> " to "
  out = out.replace(/(\d)\s*[—―]\s*(\d)/g, '$1 to $2');
  // Spaced em-dash used as a break -> comma
  out = out.replace(/\s+[—―]\s+/g, ', ');
  // Tight em-dash between words -> comma + space
  out = out.replace(/([^\s])[—―]([^\s])/g, '$1, $2');
  // Any stragglers (em-dash at edge) -> drop to a comma/space
  out = out.replace(/\s*[—―]\s*/g, ', ');
  // Tidy accidental doubles
  out = out.replace(/, ,/g, ',').replace(/,\s*,/g, ',').replace(/ ,/g, ',');
  return out;
}

function scrubFile(path) {
  const src = readFileSync(path, 'utf8');
  const lines = src.split('\n');
  let inFence = false;
  let changed = false;
  const result = lines.map((line) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;
    const next = scrubLine(line);
    if (next !== line) changed = true;
    return next;
  });
  if (changed) writeFileSync(path, result.join('\n'));
  return changed;
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'));
let count = 0;
for (const f of files) {
  if (scrubFile(join(DIR, f))) count++;
}
console.log(`Scrubbed ${count} files of ${files.length}.`);
