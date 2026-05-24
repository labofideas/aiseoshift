# AISEOShift Session Handoff

## Project

- Local project path: `/Users/shashank/aiseoshift`
- GitHub repo: `https://github.com/labofideas/aiseoshift`
- Stack: `Astro` static site
- Local preview URL: `http://127.0.0.1:4321/`

## Current State

- Site exists locally and is backed up on GitHub.
- `npm run build` was passing in the latest working state.
- Deployment to the current cPanel host is not solved yet because external deploy ports were blocked/refused.
- Current GitHub Actions workflow is in a safe build-only state instead of auto-deploying.

## Content State

- Initial article set was created and expanded significantly.
- Posts were made more structured, longer, and more opinionated.
- Internal links and external references were added.
- Additional posts were added, including:
  - `ai-overviews-seo-strategy`
  - `how-to-get-cited-by-ai-search-systems`
  - `how-to-refresh-old-seo-content`

## Design State

- Site was pushed toward a minimal SaaS/editorial hybrid.
- Homepage and article typography were reduced and cleaned up.
- Article layout is currently stronger than the homepage.
- Header and homepage still need another cleanup pass.

## Latest UI Review Findings

### Homepage

1. The four-box strip at the top (`Coverage`, `Format`, `Speed`, `Mission`) takes too much attention before the lead story and hurts first impression, especially on mobile.
2. The header is still too tall and text-heavy on small screens.
3. Too many sections use the same thin-border treatment, which makes the page feel flat and wireframe-like.
4. The hero title is visually strong, but the rest of the homepage hierarchy is too weak around it.

### Article Page

1. The longform reading experience is decent.
2. The left meta rail still feels too editorial/publication-like for the SaaS direction.
3. A cleaner byline/meta row near the title would fit the product-blog direction better.

## Important Clarification

- The site was checked in Playwright at both mobile and desktop widths.
- Desktop layout is loading correctly on `1440x960`.
- There is no confirmed bug forcing mobile layout on desktop.
- If desktop looks mobile in the browser, likely causes are window width, zoom, or stale cache.

## Files Most Likely To Edit Next

- `src/components/Header.astro`
- `src/pages/index.astro`
- `src/layouts/BlogPost.astro`

## Recommended Next Work

1. Remove or greatly reduce the top four-box strip on the homepage.
2. Compress the header and simplify the mobile masthead.
3. Reduce the repeated border-box look across homepage sections.
4. Rebalance homepage hierarchy so the lead story and latest coverage feel more intentional.
5. Simplify article metadata presentation.

## Deployment Notes

- Current cPanel host rejected:
  - FTP on port `21`
  - SSH/SFTP on port `22`
  - FTPS on port `990`
- Best future options:
  - manual cPanel deploy from built `dist`
  - move to Cloudflare Pages or Netlify
  - get correct external deploy protocol/port from host

## If Continuing From Chat

Use this prompt:

`Continue AISEOShift from SESSION-HANDOFF.md. Start by simplifying the homepage header and removing the top coverage boxes, then review the result in Playwright on desktop and mobile.`
