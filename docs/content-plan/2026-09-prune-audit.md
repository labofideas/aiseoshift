# Prune audit, 2026-09-08

Source: 3-month GSC export (2026-06-07 to 2026-09-06). Read this before deleting or noindexing anything.

## Why this is two tiers, not one delete list

A mechanical cutoff ("0 clicks, position worse than 40 → delete") looks clean but is wrong right now. The site's impressions collapsed site-wide on June 24-25 (see [what-a-google-quality-hit-looks-like-gsc-data](/blog/what-a-google-quality-hit-looks-like-gsc-data/)). Since then, almost every page shows 0 clicks, including pages that are genuinely good, unique, and simply have not had a fair shot yet under the suppression. Applying a blunt cutoff would have flagged `how-to-measure-ai-visibility`, `aeo-kpis-metrics-ai-visibility`, `zero-click-search-strategy`, and `claude-pricing-2026` (refreshed today with verified September prices) as prune candidates. They are not. They are single, well-targeted pieces sitting in a site-wide penalty box.

The only defensible prune signal in this window is a **confirmed duplicate footprint**: multiple pages, or one page, absorbing a flat grid of near-identical queries that Google's own scaled-content systems are built to detect. That's Tier 1. Everything else with weak numbers goes to Tier 2, for re-evaluation after the site has 60-90 days of clean data (post-prune, post-URL-hygiene-fix), not for deletion now.

## Tier 1: confirmed duplicate footprint, act now

Evidence: the original Queries.csv export contains 22+ near-identical zero-click queries in two families, each 40-215 impressions at position 60-95:

- `ai mode seo checker` / `checkers` / `checking tool` / `checking tools` / `checking software` / `tracking software` / `analysis tool` / `analysis tools` / `analysis software` / `software`
- `copilot seo checker` / `checkers` / `checking tool` / `checking tools` / `checking software` / `tracking software` / `tracking tool` / `analysis tool` / `analysis tools` / `analysis software`

These queries all funnel into a small set of pages. That's the textbook shape of the pattern Google's scaled-content-abuse systems target: many query variants, one thin page trying to catch all of them, zero real answer for any of them.

| Page | Impressions | Position | Action |
|---|---|---|---|
| `/blog/ai-mode-seo-checking-software/` | 1,154 | 71.3 | Delete or fold into a genuinely different post (e.g. a real AI-Mode-tracking how-to) |
| `/copilot-seo/` | 759 | 69.4 | Rewrite as one real page (what Copilot SEO means, not a checker-tool permutation target) or delete |
| `/blog/ai-seo-tools-visibility-optimization/` | 493 | 55.7 | Delete or merge into `/ai-seo-tools/` |
| `/blog/ai-translators/` | 471 | 61.9 | Off-topic for an AI-SEO site; delete |
| `/blog/ai-grammar-checkers/` | 233 | 32.4 | Off-topic; delete |
| `/blog/plagiarism-checkers/` | 94 | 30.0 | Off-topic; delete |
| `/blog/ai-content-humanizers/` | 18 | 27.4 | Off-topic; delete |

Note: `/blog/ai-content-detection-tools/` is in the same topical cluster but earned 1 click at position 47.8. Leave it; it's proven, however marginally.

That's 7 pages, roughly 3,200 of the site's 9,700 three-month impressions, all zero-click. Removing them is the single highest-leverage action available before the next core-update cycle, because it's the cleanest, most falsifiable piece of the scaled-content footprint.

## Tier 2: hold and monitor, do not delete yet

Everything else with 0 clicks. This is the bulk of the catalog (roughly 220 pages), including:

- The **schema-for-AI-search series** (job posting, recipe, event, video, product schema). These are ranking well (positions 5-11) and are topically distinct technical guides, not permutations of each other. Not a prune candidate. Give them time.
- The **niche + AI SEO template** (`ai-seo-for-[industry]`). This looks templated, but several instances already proved out with real clicks at strong positions (nail salons, restaurants, pest control, chiropractors). The template works; specific low-performing instances (electricians, financial advisors, HVAC, roofing, criminal defense) may just need backlinks or a promotion push, not deletion.
- The **measurement/AEO series** (`how-to-measure-ai-visibility`, `aeo-kpis-metrics-ai-visibility`, `zero-click-search-strategy`, `ga4-for-ai-seo-tracking`, `how-to-refresh-old-seo-content`, `ai-seo-audit-guide`) and the **September 2026 cluster** published today. These are exactly the content type the recovery plan calls for. Keep, and watch them over the next reporting cycle.
- The four **pricing pages**, refreshed today with verified prices. Freshness is the whole strategy here; give the refresh time to register.
- Everything in the `REVIEW` and thin-ungrouped buckets from the raw pass (roughly 100 more pages): mostly single-topic posts sitting at position 20-90 with 0 clicks. Re-run this audit in 60-90 days, after Tier 1 is gone and the trailing-slash/www/http canonical fixes (see `public/_redirects`) have had time to consolidate. If a page still shows 0 clicks and no position improvement after that clean window, it's a real Tier 2-to-delete candidate. Right now, the data is contaminated by the site-wide penalty and can't tell you that yet.

## What NOT to do

Don't delete Tier 2 pages based on this export. The 0-click numbers for most of the catalog reflect the site-wide suppression, not individual page quality. Deleting broadly right now risks removing content that would recover fine once the site-level signal clears, and it doesn't address the actual cause (Tier 1's duplicate footprint).

## Suggested execution

1. Delete or consolidate the 7 Tier 1 pages. For each, either 410 it or 301 it to the nearest genuinely relevant surviving page (e.g. `/copilot-seo/` content could fold into a real `/blog/how-to-optimize-for-microsoft-copilot/` rewrite rather than disappearing entirely, since that keyword has commercial value done honestly).
2. Let the URL-hygiene redirects already added (`public/_redirects`, 2026-09-08) consolidate the duplicate-URL-variant impressions.
3. Hold Tier 2. Re-run this audit with a fresh GSC export in December 2026.
