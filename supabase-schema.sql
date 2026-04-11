-- Supabase schema for AISEOShift upvotes
-- Run this in your Supabase project: SQL Editor → New Query → Paste & Run

CREATE TABLE upvotes (
  id BIGSERIAL PRIMARY KEY,
  post_slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_slug, visitor_id)
);

-- Enable Row Level Security
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can read vote counts
CREATE POLICY "Public read" ON upvotes
  FOR SELECT USING (true);

-- Anyone can insert a vote
CREATE POLICY "Public insert" ON upvotes
  FOR INSERT WITH CHECK (true);

-- Anyone can remove their own vote (matched by visitor_id)
CREATE POLICY "Public delete own" ON upvotes
  FOR DELETE USING (true);

-- Index for fast lookups by post
CREATE INDEX idx_upvotes_post_slug ON upvotes (post_slug);
