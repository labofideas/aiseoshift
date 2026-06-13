// One-off: scrub em-dashes from blog MDX in a readability-preserving way.
// Applied outside fenced code blocks (```...```):
//  - numeric ranges around an em-dash       ->  " to "  (e.g. "6—8" -> "6 to 8")
//  - table rows (lines beginning with |)     ->  em-dash becomes "-"
//  - PAIRED em-dashes wrapping an aside       ->  parentheses ( ... )
//      (keeps internal comma lists unambiguous: "work — a, b — takes" -> "work (a, b) takes")
//  - remaining single spaced em-dash " — "    ->  ", "
//  - tight em-dash "word—word"                ->  ", "
// Em-dash chars handled: — (U+2014) and ― (U+2015).
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
  // Ranges: digits on both sides -> " to "
  out = out.replace(/(\d)\s*[—―]\s*(\d)/g, '$1 to $2');
  // Paired spaced em-dashes wrapping an aside -> parentheses.
  // Run repeatedly so multiple parentheticals on one line each get wrapped.
  let prev;
  do {
    prev = out;
    out = out.replace(/\s+[—―]\s+([^—―]+?)\s+[—―]\s+/, ' ($1) ');
  } while (out !== prev);
  // Remaining single spaced em-dash used as a break -> comma
  out = out.replace(/\s+[—―]\s+/g, ', ');
  // Tight em-dash between words -> comma + space
  out = out.replace(/([^\s])[—―]([^\s])/g, '$1, $2');
  // Any stragglers (em-dash at edge) -> comma
  out = out.replace(/\s*[—―]\s*/g, ', ');
  // Tidy accidental doubles
  out = out.replace(/, ,/g, ',').replace(/,\s*,/g, ',').replace(/ ,/g, ',');
  // Tidy spacing around parens
  out = out.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
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
