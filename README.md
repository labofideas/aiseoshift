# AISEOShift

Astro-based editorial site for `aiseoshift.com`, designed as a fast news-style publication covering AI visibility, answer engines, GEO, AI citations, tooling, and search strategy.

## Stack

- Astro
- Markdown content collection
- Static build output
- GitHub for version control and publishing workflow
- GitHub Actions for deploy to cPanel hosting

## Local development

```bash
npm install
npm run dev
```

## Publish a new article

1. Add a Markdown file in `src/content/blog/`
2. Include the required frontmatter:

```yaml
title:
description:
deck:
pubDate:
category:
tags:
author:
featured:
draft:
```

3. Push to `main`
4. GitHub Actions builds the site and deploys `dist/` to hosting

## Editorial images

The site supports local optimized editorial images generated from API search results.

```bash
PEXELS_API_KEY=your_key npm run images:fetch
```

- Images are downloaded to `public/images/posts/`
- Attribution metadata is stored in `src/data/image-manifest.json`
- The fetch script targets sub-`300 KB` `.webp` assets
- Update `scripts/fetch-editorial-images.mjs` to change queries or add more inline images

## Deploy setup

The repo includes `.github/workflows/deploy.yml`.

To activate deployment, add these GitHub repository secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_SERVER_DIR`

Typical `FTP_SERVER_DIR` values:

- `/public_html/`
- `/public_html/aiseoshift/`

Use the document root that serves `aiseoshift.com`.

## Domain notes

If `aiseoshift.com` already points to the same hosting account in WHM/cPanel, deployment is enough. If not, the final domain step is updating DNS or the document root to the correct hosting destination.
