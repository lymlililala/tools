-- ============================================================
-- 公众号源文表 —— 给 nightly 采集流水线（scripts/wechat）落库用。
-- 在 Supabase Dashboard → SQL Editor 执行：
-- https://supabase.com/dashboard/project/tixgzezefjjsyuzgdhcd/sql/new
-- 与 tools_articles 同库；本表仅作内部数据源，不对 anon 公开读。
-- ============================================================

CREATE TABLE IF NOT EXISTS tools_wx_sources (
  sn           TEXT         PRIMARY KEY,        -- 微信文章 sn（去重主键）
  account      TEXT,                            -- 来源公众号名（accounts.json 的 name）
  wxid         TEXT,
  title        TEXT,
  digest       TEXT         DEFAULT '',
  content_url  TEXT,
  published_at TIMESTAMPTZ,
  body_text    TEXT         DEFAULT '',         -- 清洗后的正文纯文本
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tools_wx_sources_published ON tools_wx_sources (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_wx_sources_account   ON tools_wx_sources (account);

-- 开 RLS 但不加 anon 读策略：该表只由服务端脚本（secret key）读写，前端不直接访问。
ALTER TABLE tools_wx_sources ENABLE ROW LEVEL SECURITY;

SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'tools_wx_sources'
ORDER BY ordinal_position;
