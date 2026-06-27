# CLAUDE.md — AISEOShift writing and project standards

This file is read automatically. All content written for this site must follow
the writing rules below. The goal: prose that does not read as AI-generated.

## Writing style: eliminate the AI tells

### Banned words and phrases (never use)
- "delve into", "explore" (as filler), "leverage", "harness"
- "in today's digital landscape", "in conclusion"
- "it's worth noting that", "needless to say"

### Banned constructions
- **Triads.** No "fast, reliable, and effective" patterns. The smooth
  three-item list is a dead giveaway. Use one item, or two, or break the rhythm.
- **Hedge stacking.** No "could potentially", "may generally",
  "in some cases might". Commit to a claim or cut it.
- **Title clichés.** No "Complete Guide", "Ultimate Guide", or
  "Everything You Need to Know" in titles.

### Structure tells to break
- **Vary paragraph length.** Do not make every paragraph the same size. Use
  one-sentence paragraphs. Sometimes two words. Disrupt the visual rhythm.
- **Break the formula.** Not every section should run
  topic sentence -> explain -> example -> summary. Disrupt the pattern.
- **Cut connective-tissue transitions.** No "Furthermore", "Additionally",
  "Moreover", "In summary" as sentence openers. Cut them, or replace them with
  real logical connection.

### Other house rules
- No em dashes (—). Use commas, parentheses, or separate sentences.
- No emoji in posts.
- Write specifically: named entities, real numbers, concrete examples over
  abstract advice.

## Slugs and URLs
- No year and no number in any URL slug (titles may reference a year).
- Renamed slugs get a 301 in `public/_redirects`.

## Structured data (FAQPage and other JSON-LD)
- Always use the template-literal form:
  `<script type="application/ld+json">{` ...valid JSON... `}</script>`
- NEVER React `dangerouslySetInnerHTML`; Astro MDX silently drops it.
- The content between the backticks must parse as valid JSON (escape inner
  double quotes as \", keep each answer on one line).
- Note (June 2026): Google dropped FAQ rich results. FAQ schema still aids AI
  extraction, so keep it, but do not expect a SERP rich result from it.

## Quality gate before committing
- `npm run build` green.
- No em dashes, no banned words, no React-style JSON-LD.
- Internal links into the relevant cluster and matching hub.
