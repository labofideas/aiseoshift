---
term: Indexation
category: Technical SEO
summary: The process by which a search engine stores and organizes a page in its index so it can appear in search results.
related:
  - xml-sitemap
  - robots-txt
  - canonical-tag
pubDate: 2026-06-14
---

Indexation is the step where a search engine adds a crawled page to its searchable database. A page can be discovered and crawled but still never indexed, and only indexed pages are eligible to rank. Crawling, indexing, and ranking are three separate stages.

## How a page gets indexed

After a crawler fetches a URL, the engine evaluates the content, renders any JavaScript, and decides whether the page is worth storing. It checks for a `noindex` directive, a canonical tag pointing elsewhere, thin or duplicate content, and whether the page returns a healthy 200 status code. Pages that pass these checks enter the index.

## Why it matters

If important pages are not indexed, they cannot bring in [organic traffic](/glossary/organic-traffic/) no matter how good the content is. Common reasons a page stays out of the index include a stray `noindex` tag, blocking in robots.txt, low perceived value, or a canonical signal pointing at a different URL.

## How to check and control it

Use Google Search Console's URL Inspection tool to see whether a specific page is indexed and why. The Pages report groups URLs by status, such as "Crawled, currently not indexed." To encourage indexing, submit an XML sitemap, build internal links to the page, and make sure the content offers something distinct. To keep low-value pages out, apply a `noindex` meta tag rather than only blocking the crawler.
