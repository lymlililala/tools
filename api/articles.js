/**
 * Vercel Serverless Function — articles API.
 *
 * Runs server-side ONLY, so it safely uses the Supabase secret key
 * (process.env.SUPABASE_SECRET_KEY). The key never reaches the browser bundle.
 *
 * Routes:
 *   GET /api/articles            → list (lightweight columns), newest first
 *   GET /api/articles?slug=xxx   → { article, related }, 404 if not found
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tixgzezefjjsyuzgdhcd.supabase.co'
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY

// Reuse the client across warm invocations.
let _supabase = null
function getClient() {
  if (!SUPABASE_SECRET_KEY)
    throw new Error('Missing SUPABASE_SECRET_KEY environment variable')
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false },
    })
  }
  return _supabase
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let supabase
  try {
    supabase = getClient()
  }
  catch (e) {
    return res.status(500).json({ error: e.message })
  }

  const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined

  try {
    // ─── Detail: single article + related ─────────────────────────────────────
    if (slug) {
      const { data, error } = await supabase
        .from('tools_articles')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        // PGRST116 = row not found
        if (error.code === 'PGRST116')
          return res.status(404).json({ error: 'Article not found' })
        return res.status(500).json({ error: error.message })
      }

      const { data: related } = await supabase
        .from('tools_articles')
        .select('slug, title, description, category')
        .eq('category', data.category)
        .neq('slug', slug)
        .limit(3)

      // 边缘缓存拉长：内容很少变，且发布管线会触发 Vercel 重新部署、自动刷新该缓存，
      // 故可长缓存让绝大多数请求命中 CDN（HIT），不再打冷源站。
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
      return res.status(200).json({ article: data, related: related ?? [] })
    }

    // ─── List ─────────────────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from('tools_articles')
      .select('slug, title, description, keywords, category, published_at')
      .order('published_at', { ascending: false })

    if (error)
      return res.status(500).json({ error: error.message })

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    return res.status(200).json({ articles: data ?? [] })
  }
  catch (e) {
    return res.status(500).json({ error: e?.message ?? 'Internal error' })
  }
}
