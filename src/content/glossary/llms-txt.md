---
term: llms.txt
category: AI Search
summary: A plain-text file at /llms.txt that lists a site's most important pages with one-line descriptions formatted for AI consumers, the AI-citation equivalent of robots.txt.
related:
  - schema-markup
  - aeo
  - ai-citation
pubDate: 2026-06-14
---

llms.txt is a plain-text file placed at the root of a site, at /llms.txt, that lists the pages most worth reading and gives each a one-line description written for AI consumers. It functions as the AI-citation counterpart to robots.txt and sitemap.xml.

## What it is

Where robots.txt tells crawlers what they may access and sitemap.xml lists every URL, llms.txt curates. It points an AI system at the handful of pages that best represent the site and explains in plain language what each one covers. The format is deliberately simple: Markdown-style headings and links that a model can read without parsing a full page. The convention was proposed by llmstxt.org in 2024.

## Why it matters

AI systems work under tight context limits and cannot read an entire site before answering. A curated index lets a publisher signal which pages carry the canonical, citable information, reducing the chance an engine pulls from a thin or outdated page instead. Adoption has grown across tools like Yoast and Rank Math and a widening set of publishers.

## How to apply it

Create the file at your site root, list your strongest reference pages with short, accurate descriptions, and keep it current as priorities change. See the live example at [/llms.txt](/llms.txt).
