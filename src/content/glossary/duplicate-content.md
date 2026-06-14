---
term: Duplicate Content
category: Technical SEO
summary: Substantially identical content that appears at more than one URL, which can split signals and confuse search engines about which version to rank.
related:
  - canonical-tag
  - redirects
  - indexation
pubDate: 2026-06-14
---

Duplicate content is the same or very similar text living at multiple URLs, whether on one site or across different sites. Examples include a product reachable through several category paths, HTTP and HTTPS versions of a page, www and non-www variants, and printer-friendly copies.

## Is there a penalty?

There is a common myth of a "duplicate content penalty." For ordinary duplication, Google does not penalize a site. Instead it picks one version to index and ranking signals, like links, get split across the copies rather than concentrated on one URL. The real cost is diluted authority and Google sometimes choosing a version you did not intend. Deliberate, large-scale copying to manipulate rankings is a different matter and can draw action.

## Common causes

- URL parameters for sorting, filtering, or tracking that generate many addresses for one page.
- Both secure and non-secure or both www and non-www versions resolving.
- Boilerplate text repeated across many thin pages.
- Syndicated content republished without attribution back to the original.

## How to fix it

Point duplicates at the preferred version with a [canonical tag](/glossary/canonical-tag/), which tells Google which URL to treat as the master. Use a 301 [redirect](/glossary/redirects/) when a duplicate should not exist at all, such as collapsing www and non-www. Keep internal links pointing at the canonical URL, and set a sitewide preference for one protocol and one hostname so signals stay consolidated.
