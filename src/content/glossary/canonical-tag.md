---
term: Canonical Tag
abbreviation: rel=canonical
category: Technical SEO
summary: An HTML element that tells search engines which version of a page is the primary one, consolidating ranking signals when duplicate or near-duplicate URLs exist.
related:
  - crawl-budget
  - schema-markup
  - indexation
pubDate: 2026-06-14
---

A canonical tag is a line of code (`<link rel="canonical" href="...">`) placed in a page's head that names the preferred URL for a piece of content. When the same or very similar content is reachable at several URLs, the canonical tag tells search engines which one to index and rank.

## Why it matters

Duplicate URLs are common and often unintentional: tracking parameters, session IDs, HTTP and HTTPS variants, trailing slashes, and printer-friendly pages all create copies. Left unmanaged, they split ranking signals across versions and waste crawl resources.

A correct canonical consolidates those signals onto one URL, so the authority earned by every variant accrues to a single page rather than being divided.

## How to use it

Point each duplicate or parameterized version at the clean, preferred URL. Self-reference the canonical on the primary page itself, so there is no ambiguity. Keep the canonical URL consistent with what appears in your sitemap and internal links.

A few rules keep canonicals working as intended:

- Use absolute URLs, not relative paths.
- Only one canonical per page.
- Do not canonicalize every page to the homepage, a frequent and damaging error.

## A signal, not a directive

Search engines treat the canonical tag as a strong hint rather than an absolute command. If your internal links, sitemap, and canonical disagree, engines may pick a different URL than you intended. Consistency across all of those signals is what makes the canonical reliable. For the structured-data layer that complements clean canonicalization, see [schema markup](/seo/schema-markup/).
