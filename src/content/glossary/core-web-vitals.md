---
term: Core Web Vitals
abbreviation: CWV
category: Technical SEO
summary: Google's set of user-experience metrics measuring loading speed, interactivity, and visual stability. They are a confirmed ranking signal and a baseline for page quality.
related:
  - crawl-budget
  - canonical-tag
pubDate: 2026-06-14
---

Core Web Vitals are three field metrics Google uses to quantify real-world page experience. They measure how fast a page shows content, how quickly it responds to input, and how stable the layout is as it loads.

## The three metrics

- **Largest Contentful Paint (LCP)** measures loading. It marks when the largest visible element renders. Aim for under 2.5 seconds.
- **Interaction to Next Paint (INP)** measures responsiveness. It captures the delay between a user action and the visual response. Aim for under 200 milliseconds. INP replaced First Input Delay in 2024.
- **Cumulative Layout Shift (CLS)** measures visual stability, the amount elements jump around during load. Aim for under 0.1.

## Why they matter

Google confirmed Core Web Vitals as a ranking signal as part of page experience. They are rarely the deciding factor against strong, relevant content, but they act as a tiebreaker and a floor. A page that frustrates users with slow loads and shifting layouts struggles to hold rankings against a faster competitor.

The data Google uses comes from real Chrome users (field data), not just lab tests. You can monitor it in Google Search Console and PageSpeed Insights.

## How to improve them

Compress and correctly size images, defer non-critical scripts, reserve space for images and ads to prevent shifts, and minimize heavy third-party code. These fixes also help AI crawlers reach and parse content efficiently, which supports citation eligibility.
