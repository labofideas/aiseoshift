---
term: Speakable Schema
category: AI Search
summary: A schema.org type (SpeakableSpecification) that marks specific page sections as suitable for voice or audio reading by AI assistants.
related:
  - schema-markup
  - featured-snippet
  - aeo
pubDate: 2026-06-14
---

Speakable schema is a schema.org type, SpeakableSpecification, that flags which parts of a page are well suited to being read aloud by a voice assistant. It points the assistant at the passages that make sense spoken, rather than leaving it to guess.

## What it is

The markup identifies specific sections, by CSS selector or by text fragment, that work as standalone audio. Good candidates are short and self-contained: a TL;DR block, a one-sentence definition, the lead answer to a question. Content that depends on surrounding visuals, long tables, or step-by-step formatting reads poorly aloud and is a poor fit.

## Why it matters

Voice and audio answers strip away the visual context a reader normally has. An assistant reading a result aloud needs a passage that stands on its own, and Speakable tells it which passage that is. Marking the right section reduces the chance the assistant reads an awkward fragment or skips your content for a clearer source. The type is recognized by Google Assistant and similar systems.

## How to apply it

Write a tight summary or definition near the top of the page, then mark it with Speakable so an assistant can read it cleanly. Keep the marked text accurate out of context, since spoken answers carry no link for the listener to check.
