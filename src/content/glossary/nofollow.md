---
term: Nofollow Link
abbreviation: rel=nofollow
category: Off-Page SEO
summary: A link attribute that tells search engines not to pass ranking credit to the destination page.
related:
  - backlink
  - anchor-text
  - domain-authority
pubDate: 2026-06-14
---

A nofollow link carries the `rel="nofollow"` attribute, which signals to search engines that the linking site does not vouch for the destination. It looks like `<a href="https://example.com" rel="nofollow">example</a>`. Introduced by Google in 2005 to fight comment spam, it tells crawlers to discount the link as a ranking signal.

## How it affects SEO

A standard "dofollow" backlink can pass authority, sometimes called link equity, to the target page. A nofollow link traditionally passed none. Since 2019, Google treats `nofollow` as a hint rather than a strict rule, meaning it may still use the link for crawling or context, but generally does not pass full ranking credit. A nofollow link is still worth having for referral traffic, brand exposure, and a natural-looking [backlink](/glossary/backlink/) profile.

## Related attributes

Google added two more specific values you can use alongside or instead of nofollow:

- **`rel="sponsored"`** marks paid or advertising links.
- **`rel="ugc"`** marks user-generated content like forum posts and comments.

## When to use it

Apply nofollow or sponsored to paid placements and affiliate links to comply with Google's guidelines, since unmarked paid links that pass credit violate them. Use ugc on comment sections. A healthy link profile naturally contains a mix of followed and nofollowed links, so an all-followed profile can itself look unnatural.
