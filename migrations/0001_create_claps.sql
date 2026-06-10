-- Clap counts for AISEOShift blog posts (Cloudflare D1)
-- Apply with:
--   npx wrangler d1 execute aiseoshift-claps --remote --file=./migrations/0001_create_claps.sql

CREATE TABLE IF NOT EXISTS claps (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
