---
term: Redirect (301 and 302)
category: Technical SEO
summary: A server instruction that sends users and search engines from one URL to another, used to preserve traffic and ranking when pages move.
related:
  - canonical-tag
  - indexation
  - duplicate-content
pubDate: 2026-06-14
---

A redirect automatically forwards a request for one URL to a different URL. When a browser or crawler asks for the old address, the server responds with a status code and the location of the new page. Redirects keep links from breaking when content moves and consolidate signals onto a single canonical URL.

## 301 versus 302

The two codes you use most differ in meaning:

- **301 Moved Permanently.** The page has moved for good. Use it when retiring an old URL, switching to HTTPS, or merging pages. A 301 passes nearly all ranking signals to the new URL and tells Google to swap the old page for the new one in the index.
- **302 Found.** A temporary move. Use it when the original URL will return, such as during maintenance or a short campaign. Google keeps the original URL indexed and passes signals more cautiously.

Using a 302 when you mean 301 is a frequent mistake that can stall the transfer of ranking signals.

## Best practices

Map each old URL to the single most relevant new page rather than dumping everything on the homepage, which Google may treat as a soft 404. Avoid redirect chains, where one URL points to another that points to a third, since each hop adds latency and can dilute signals. After migrating, update internal links to point straight at the final destination instead of relying on the redirect.
