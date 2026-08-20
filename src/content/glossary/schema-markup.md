---
term: Schema Markup
category: AI Search
summary: Structured-data annotations (usually JSON-LD) that describe a page's content in a machine-readable vocabulary, helping AI engines cite pages without parsing ambiguity.
related:
  - knowledge-graph
  - speakable
  - aeo
pubDate: 2026-06-14
---

Schema markup is structured data that describes what a page contains in a machine-readable vocabulary, most often written as JSON-LD. It sits alongside the visible content and tells engines what each piece of information means rather than leaving them to infer it.

## What it is

The vocabulary comes from schema.org, a shared standard maintained with major search engines. Common types include Organization, Person, Article, FAQPage, HowTo, LocalBusiness, and DefinedTerm. Each type defines properties, so an Article can declare its author, publish date, and headline in fields a machine reads directly. JSON-LD is the recommended format because it lives in a script block and does not tangle with page layout.

## Why it matters for AI search

AI engines preferentially cite pages with rich schema because it removes guesswork. Markup states facts as data, so an engine learns who wrote a page, what it answers, and how its parts relate without parsing prose that might be ambiguous. That clarity makes a page a safer, more verifiable source to draw from.

## How to apply it

Add the schema types that match your content, fill in the properties accurately, and keep the markup consistent with what users actually see. Validate it so errors do not silently disable it. For deeper coverage, see [our schema markup guide](/seo/schema-markup/).
