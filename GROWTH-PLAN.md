# AISEOShift Growth Plan

Persistent orchestration brief. Any session (human or agent) should read this
first, do the next highest-leverage item, commit, push, and update the
"Progress log" at the bottom. Target: 1,000 organic visits/day.

## Honest model of the goal

Traffic is a lagging metric Google controls. The path is:
publish -> index -> rank -> click. Moving from the current state (roughly
6,700 impressions and near-zero clicks in 28 days, average positions on
pages 5-9) to 1,000 visits/day is a multi-month compounding effort. No
single session "hits" the number. The job each session is to advance the
leading indicators that cause it: indexed pages, average position, striking
distance count, internal-link depth, and citations.

## Current state (update each measurement)

- 299 blog posts, 50+ tool roundups, 44-term glossary, ~12 vertical playbooks.
- Fundamentals strong: titles/meta coverage, schema on key pages, clean URLs
  (year/number removed from flagship slugs, 301s in place).
- Weakness: almost nothing ranks on page 1 yet (new-site authority), and the
  large cluster is loosely interlinked. Few internal hubs concentrate equity.

## Strategy, in priority order

The constraint is authority and structure, not raw post count. Weight effort:

1. **Structure and internal linking (highest ROI now).**
   - Hub pages that aggregate clusters (e.g. /best-ai-tools/, vertical hubs).
   - "Related" cross-links within clusters so equity flows.
   - Surface hubs from nav/homepage so authority concentrates.
2. **Striking-distance optimization.** Refresh pages at positions ~8-30 first
   (closest to page 1). Add FAQ schema, tighten title/intro to the exact
   query, expand thin sections, refresh dates. This is where the next clicks
   come from, not new posts.
3. **Intent mapping / de-cannibalization.** Where multiple pages target one
   query, make one canonical and have the others defer via cross-links.
4. **Authority building (off-site).** The durable lever for a new site:
   genuine brand mentions, third-party listings, digital PR, getting listed
   in others' roundups, presence where the audience discusses the topic.
   AI engines weight independent corroboration heavily.
5. **New content only where demand is unserved.** Before writing, check GSC
   for queries with impressions but no strong page, and confirm no existing
   post already targets it (avoid cannibalization). Quality gate below.
6. **Distribution.** Sharing new posts to owned channels (social, newsletter)
   drives early traffic and discovery signals. Requires credentials and
   explicit authorization; never auto-post externally without sign-off.

## Quality gate (every published page must pass)

- CLAUDE.md style: no em dashes, no banned words/filler transitions, no
  triads-as-tic, varied paragraph length, no emoji.
- Year-free, number-free slugs (titles may reference a year).
- Valid FAQPage JSON-LD in the template-literal form
  `<script type="application/ld+json">{` ...JSON... `}</script>`
  (NEVER React `dangerouslySetInnerHTML`; validate it parses as JSON).
- Named entities and concrete specifics, not abstract advice.
- Internal links into the relevant cluster + the matching hub.
- `npm run build` green before commit.

## Measurement cadence

The operator re-shares the GSC Queries + Pages export (Last 28 days) roughly
every 2-4 weeks. Each time:
1. Recompute current state above.
2. List striking-distance pages (pos 8-30) sorted by impressions.
3. List high-impression queries with no strong matching page.
4. Re-prioritize the backlog accordingly.

## Backlog (re-prioritize against GSC each cycle)

- Build /best-ai-tools/ hub linking every roundup (DONE if checked in log).
- Add "Related tools" cross-links across roundups.
- Refresh remaining striking-distance pages with FAQ schema + tightened intent.
- Vertical hub pages (healthcare, legal, home services, local) linking each
  vertical playbook + its support spokes.
- Wire the 44-term glossary into money pages with targeted anchors.
- Off-site: build a target list for digital PR and directory listings.

## Operating model

The orchestrator (lead session) reads this file, picks the top unblocked
item, and either does it directly or dispatches sub-agents (parallel,
background) with: the exact file/spec, the relevant template to read, the
quality gate above, and an instruction NOT to build/commit. The orchestrator
then validates every output (JSON-LD parse, em-dash/banned scan), builds
once, commits in logical groups, pushes, and updates the log.

## Progress log

- 2026-06-15: Plan created. 13 new tool roundups + FAQ schema on 6
  striking-distance pages shipped earlier in the day. Next: /best-ai-tools/
  hub + cluster cross-linking.
