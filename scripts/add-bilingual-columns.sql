-- ============================================================
-- 双语改造：给 tools_articles 增加中文列（幂等，可重复执行）
-- Run this SQL in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/tixgzezefjjsyuzgdhcd/sql/new
-- ============================================================

-- 1. 增加中文列（全部 nullable，缺译时前端回落英文）
ALTER TABLE tools_articles
  ADD COLUMN IF NOT EXISTS title_zh       TEXT,
  ADD COLUMN IF NOT EXISTS description_zh TEXT,
  ADD COLUMN IF NOT EXISTS content_zh     TEXT,
  ADD COLUMN IF NOT EXISTS keywords_zh    TEXT[] NOT NULL DEFAULT '{}';

-- 2. 便于排查“尚未翻译”的文章（content_zh IS NULL）
CREATE INDEX IF NOT EXISTS idx_tools_articles_content_zh_null
  ON tools_articles (slug) WHERE content_zh IS NULL;

-- 注：RLS 的 anon SELECT policy（USING true）自动覆盖新列，无需额外授权。

-- 3. 验证
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'tools_articles' AND column_name LIKE '%_zh'
ORDER BY ordinal_position;
