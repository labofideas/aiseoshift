# CLAUDE.md — AISEOShift writing and project standards

Read this before writing anything for the site. Every piece of content follows it.

The goal is narrow and specific: content that ranks, that a human actually wants
to read, and that an AI engine can lift and cite without effort. Those three pull
in the same direction more than people assume. The rules below keep them aligned.

## The two modes

Not every page is the same kind of writing. Decide which mode a page is before
you start, because the rules differ.

**Editorial** — explainers, opinion, news analysis, strategy pieces. These win on
voice and argument. Prose first, lists rare. This is where the voice section below
applies in full.

**Reference** — tool roundups, comparisons, checklists, step-by-step guides,
schema references. People scan these. Structure is the feature: tables, named
entries, short bullets, clear headings. Do not force these into flowing prose.
A "best 20 tools" page with no lists is worse, not better.

When in doubt, ask what the reader is doing. Reading to think? Editorial. Scanning
to decide? Reference.

## Voice (editorial mode)

First person, conversational, and authoritative. Write like someone with real
experience explaining something they worked out, not someone lecturing.

Speak to the reader as "you." Be opinionated but generous, never aggressive.

Short paragraphs. Often one or two sentences. Build context with a longer passage,
then land a sharp standalone line for emphasis.

Reframe familiar ideas. Take something the reader thinks they understand and turn
it over so they see it differently.

Use concrete analogies to make an abstract idea tangible. A cook's instinct versus
a written recipe teaches more than a definition does.

Invite the reader to stop and think. "Sit with that for a second." "Here is where
it gets uncomfortable."

Reference your own experience naturally, without making it the subject.

End on a sharp line that stays with the reader. Not "the future is exciting." Not a
hollow call to action. Something that lands.

## Write for AI citation (both modes)

This is grounded in 2026 citation research, not preference.

**Front-load the answer.** Roughly 44% of AI citations come from the first 30% of
a page. Put a direct, self-contained answer near the top, before the setup. The
reader who wants depth reads on. The engine that wants a quote already has one.

**Make every section liftable on its own.** An engine extracts a section without
the three sections above it. If a passage only makes sense in context, it will not
get quoted. Each section should stand alone.

**Write headings as the questions people ask.** "How much does a CPA charge" beats
"Pricing." The heading tells the engine what the section answers.

**Add one real visual where it fits.** Multimodal pages are selected far more often
than text-only ones. An original chart, a labeled diagram, or a real screenshot
counts. A decorative stock photo does not.

**Structure beats similarity.** AI search retrieves the exact section, it does not
match your whole page by vibe. Clean heading hierarchy and self-contained sections
are what get you pulled.

## Rank (E-E-A-T and relevance)

- Name the author and their credentials. Anonymous content loses in every
  high-trust category and in AI extraction.
- Write specifically: named entities, real numbers, concrete examples. Vague
  advice does not get cited and does not rank.
- Match the query's intent and format. Read the current top results before writing.
- Freshness matters, but earn it. Set `updatedDate` only when the content genuinely
  changed. A fake-fresh date on stale content gets discounted.
- Link internally into the relevant cluster and its hub. Link externally to
  authoritative primary sources (Google docs, Schema.org, original studies).
- Never manufacture signals. Google treats bought citations and fabricated mention
  patterns as spam (May 2026 policy). Earn the mention or skip it.

## Eliminate the AI tells

### Banned words and phrases
- "delve into", "explore" (as filler), "leverage", "harness"
- "in today's digital landscape", "in conclusion"
- "it's worth noting that", "needless to say"

### Banned constructions
- **Triads.** No "fast, reliable, and effective" patterns. The smooth three-item
  list is a dead giveaway. Use one, or two, or break the rhythm.
- **Hedge stacking.** No "could potentially", "may generally", "in some cases
  might". Commit to a claim or cut it.
- **Title clichés.** No "Complete Guide", "Ultimate Guide", or "Everything You Need
  to Know" in titles.

### Structure tells to break
- **Vary paragraph length.** Do not make every paragraph the same size. Use
  one-sentence paragraphs. Sometimes two words. Disrupt the visual rhythm.
- **Break the formula.** Not every section runs topic sentence, explain, example,
  summary. Disrupt the pattern.
- **Cut connective-tissue transitions.** No "Furthermore", "Additionally",
  "Moreover", "In summary" as openers. Cut them or replace them with real logic.

### Other house rules
- No em dashes. Use commas, parentheses, or separate sentences.
- No emoji in posts.
- No hollow endings ("the future is exciting") and no generic calls to action.

## Slugs and URLs
- No year and no number in any URL slug. Titles may reference a year.
- Renamed slugs get a 301 in `public/_redirects`.

## Structured data (FAQPage and other JSON-LD)
- Always use the template-literal form:
  `<script type="application/ld+json">{` ...valid JSON... `}</script>`
- NEVER React `dangerouslySetInnerHTML`; Astro MDX silently drops it.
- The content between the backticks must parse as valid JSON (escape inner double
  quotes as \", keep each answer on one line).
- Google dropped FAQ rich results in 2026. Keep FAQ schema anyway: it still feeds
  AI extraction. Do not expect a SERP rich result from it.

## Quality gate before committing
- `npm run build` green.
- No em dashes, no banned words, no React-style JSON-LD, valid JSON-LD.
- Front-loaded answer, self-contained sections, named author.
- Internal links into the cluster and matching hub; external links to real sources.
