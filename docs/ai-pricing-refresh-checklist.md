# Monthly AI pricing & benchmark refresh

AI model pricing and benchmarks change almost every month. This checklist keeps the
AI-model pillar and its cluster accurate. Run it once a month (a reminder issue is
opened automatically by `.github/workflows/ai-pricing-refresh-reminder.yml`).

Budget: ~30–45 minutes.

## Pages to review

Pillar:
- `src/content/blog/claude-models-openai-codex-pricing-2026.mdx`

Vendor sub-pages:
- `src/content/blog/claude-pricing-2026.mdx`
- `src/content/blog/openai-gpt-pricing-2026.mdx`
- `src/content/blog/gemini-pricing-2026.mdx`
- `src/content/blog/grok-pricing-2026.mdx`

Intent sub-pages:
- `src/content/blog/best-ai-model-for-coding-2026.mdx`
- `src/content/blog/cheapest-ai-model-2026.mdx`

## Data to verify (with official sources)

- **Anthropic Claude:** model rates, plans — https://platform.claude.com/docs/en/about-claude/pricing and https://claude.com/pricing
- **OpenAI GPT + Codex:** model rates, plans — https://openai.com/api/pricing/ and https://developers.openai.com/codex/pricing
- **Google Gemini:** model rates, AI plans — https://ai.google.dev/gemini-api/docs/pricing
- **xAI Grok:** model rates, plans — https://x.ai/api and https://docs.x.ai/developers/models
- **Coding benchmarks (SWE-bench Verified / Pro):** https://www.swebench.com/ and public leaderboards

Watch for: new model releases, price cuts, context-window changes, new plan tiers, and
benchmark leaderboard movement.

## Update steps

1. **Update the prose tables** in each page above with any changed rates, models, plans, or scores.
2. **Update the infographics' source data** in `scripts/_gen-ai-models-images.mjs`
   (the `pages[].bars` arrays hold the chart values), then regenerate:
   ```
   node scripts/_gen-ai-models-images.mjs
   ```
   This rewrites the hero + chart `.webp` files and refreshes the manifest byte sizes.
3. **Bump freshness** on every page you touched:
   - set `updatedDate:` to today in the frontmatter
   - update the "Last updated:" line (pillar) and the changelog footer
4. **Build to verify:** `npm run build` (confirm pages render, no errors).
5. **Commit, push, open a PR, and merge** once the Cloudflare build is green.
6. **Close the reminder issue** for the month.

## Notes

- Sources disagree on exact rates and dates; prefer the official provider pages, and keep
  the "verify current figures / pricing" disclaimers in place.
- Keep the honest caveats in the benchmark section (contamination concerns, scaffold sensitivity).
