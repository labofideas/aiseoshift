# AISEOShift — project notes for Claude

## Writing style: do not sound AI-written

All blog posts and page copy must read like a human wrote them. Apply these rules to every piece of content.

### Banned words and phrases (do not use)
- "delve into", "explore" (as filler), "leverage", "harness"
- "in today's digital landscape", "in conclusion"
- "it's worth noting that", "needless to say"
- "Complete Guide", "Ultimate Guide", "Everything You Need to Know" in titles

### Banned patterns
- **Triads.** No "fast, reliable, and effective"-style lists of three smooth adjectives. Break the rhythm or cut to one specific word.
- **Hedge stacking.** No "could potentially", "may generally", "in some cases might". Make the claim or don't.
- **Filler transitions.** Cut "Furthermore", "Additionally", "Moreover", "In summary". Replace with real logical connection, or nothing.

### Structure (disrupt the AI rhythm)
- Vary paragraph length. Use one-sentence paragraphs. Sometimes two words.
- Do not make every section follow topic sentence → explain → example → summary. Break the formula.
- Land sharp standalone lines for emphasis instead of smooth wrap-ups.

### Tone
- Plain language, opinionated, specific. Real numbers and first-hand judgment over generic claims.
- Avoid em dashes (—); use commas, periods, or rewrite.
- No emoji in article body copy.

## Content/site mechanics (for reference)
- Blog posts: MDX in `src/content/blog/`. Frontmatter supports optional `faqs: [{q,a}]` → renders FAQPage schema via `BlogPost.astro`.
- Hero images come from `src/data/image-manifest.json` keyed by slug; in-body infographics are embedded markdown images in `public/images/posts/`.
- Service vertical pages: `src/pages/ai-seo-services/<slug>.astro` (shared layout/CSS pattern).
- Claps: Cloudflare D1 (`DB` binding) via `/api/claps`; table in `migrations/0001_create_claps.sql`.
- Monthly AI-pricing refresh: `docs/ai-pricing-refresh-checklist.md` + reminder workflow.
