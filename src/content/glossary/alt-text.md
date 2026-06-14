---
term: Alt Text
category: On-Page SEO
summary: A written description of an image in HTML that aids accessibility and helps search engines understand the image content.
related:
  - title-tag
  - core-web-vitals
  - keyword-research
pubDate: 2026-06-14
---

Alt text (alternative text) is the description added to an image through the HTML `alt` attribute: `<img src="dog.jpg" alt="A golden retriever catching a frisbee in a park">`. Screen readers announce it to visually impaired users, and it displays when an image fails to load.

## Why it matters

Alt text serves two audiences. For accessibility, it lets people using screen readers understand what an image conveys, which is a requirement under standards like WCAG. For search, it gives crawlers the textual context they need to understand and rank images in Google Images, which can be a meaningful source of traffic for product and recipe sites.

## How to write good alt text

Describe what the image actually shows, in plain language, as if explaining it to someone who cannot see it. Keep it concise, usually under about 125 characters, since some screen readers cut off longer text. Include a relevant keyword only when it fits naturally; stuffing keywords reads poorly and helps no one. For purely decorative images that carry no meaning, use an empty `alt=""` so screen readers skip them.

## Common mistakes

Avoid starting with "image of" or "picture of," since screen readers already announce that an image is present. Do not leave the attribute off entirely on meaningful images, and do not reuse the same generic text across every image on a page.
