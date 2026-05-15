-- ============================================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/tixgzezefjjsyuzgdhcd/sql/new
-- ============================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS tools_articles (
  id           BIGSERIAL    PRIMARY KEY,
  slug         TEXT         NOT NULL UNIQUE,
  tool_path    TEXT         NOT NULL,
  title        TEXT         NOT NULL,
  description  TEXT         NOT NULL,
  keywords     TEXT[]       NOT NULL DEFAULT '{}',
  category     TEXT         NOT NULL,
  published_at DATE         NOT NULL,
  content      TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_tools_articles_slug     ON tools_articles (slug);
CREATE INDEX IF NOT EXISTS idx_tools_articles_category ON tools_articles (category);

-- 3. Enable Row Level Security
ALTER TABLE tools_articles ENABLE ROW LEVEL SECURITY;

-- 4. Allow public read access (anonymous users can read all articles)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tools_articles' AND policyname = 'tools_articles_public_read'
  ) THEN
    CREATE POLICY tools_articles_public_read ON tools_articles
      FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- 5. Verify creation
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'tools_articles'
ORDER BY ordinal_position;
