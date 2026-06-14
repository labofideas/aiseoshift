---
term: XML Sitemap
category: Technical SEO
summary: A structured file listing the important URLs on a site to help search engines discover and crawl them efficiently.
related:
  - robots-txt
  - indexation
  - crawl-budget
pubDate: 2026-06-14
---

An XML sitemap is a machine-readable file that lists the URLs you want search engines to know about, along with optional metadata like the last modified date. It acts as a roadmap, helping crawlers find pages they might otherwise miss through normal link discovery.

## What it looks like

Each entry sits inside a `<url>` block:

```xml
<url>
  <loc>https://example.com/blog/seo-basics/</loc>
  <lastmod>2026-06-01</lastmod>
</url>
```

A single sitemap can hold up to 50,000 URLs or 50MB uncompressed. Larger sites split URLs across multiple sitemaps and reference them in a sitemap index file.

## Why it matters

Sitemaps are most valuable for large sites, new sites with few backlinks, and sites with pages that are not well linked internally. They speed up discovery and support [indexation](/glossary/indexation/), though listing a URL does not force Google to index it. The engine still judges each page on its merits.

## Best practices

Include only canonical, indexable URLs that return a 200 status. Leave out pages with `noindex`, redirects, or duplicate content, since mixed signals confuse crawlers. Keep `lastmod` accurate so engines can prioritize recently changed pages. Submit the sitemap in Google Search Console and reference it in your robots.txt file with a `Sitemap:` line. Regenerate it automatically when content changes so it never drifts out of date.
