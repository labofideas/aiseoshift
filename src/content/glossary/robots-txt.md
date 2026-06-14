---
term: robots.txt
category: Technical SEO
summary: A plain-text file at the root of a domain that tells search engine crawlers which paths they may or may not request.
related:
  - xml-sitemap
  - indexation
  - crawl-budget
pubDate: 2026-06-14
---

The robots.txt file is a simple text file placed at the root of a site, such as example.com/robots.txt. It follows the Robots Exclusion Protocol and instructs crawlers which areas of the site they should avoid. Compliant bots like Googlebot read it before crawling.

## How it works

The file is made of groups. Each group names a user agent and lists the rules that apply to it. A basic example:

```
User-agent: *
Disallow: /admin/
Allow: /admin/public/
Sitemap: https://example.com/sitemap.xml
```

`User-agent: *` targets all crawlers, `Disallow` blocks a path, and `Allow` carves out an exception. Listing the sitemap URL helps engines find it.

## What it does and does not do

A `Disallow` rule stops compliant crawlers from requesting a path, which helps preserve [crawl budget](/glossary/crawl-budget/) on large sites. It does not guarantee a page stays out of search results. If other pages link to a blocked URL, Google can still index it without crawling, showing a bare result. To reliably keep a page out of the index, allow crawling and use a `noindex` meta tag instead.

## Common mistakes

Blocking CSS or JavaScript can stop Google from rendering pages correctly. Accidentally disallowing the whole site with `Disallow: /` can wipe out visibility. Test changes in Search Console before deploying.
