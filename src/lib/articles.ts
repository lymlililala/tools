/**
 * Frontend articles API client.
 *
 * The browser NEVER talks to Supabase directly anymore — legacy JWT keys are
 * disabled and the secret key must stay server-side. All reads go through the
 * Vercel serverless function at /api/articles, which uses SUPABASE_SECRET_KEY.
 */

export interface DbArticle {
  id?: number
  slug: string
  tool_path: string
  title: string
  description: string
  keywords: string[]
  category: string
  published_at: string
  content: string
  created_at?: string
  updated_at?: string
}

async function getJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error)
        message = body.error
    }
    catch { /* ignore non-JSON error bodies */ }
    const err = new Error(message) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return res.json()
}

/** Fetch the full article list (lightweight columns), newest first. */
export async function fetchArticleList(): Promise<DbArticle[]> {
  const data = await getJson('/api/articles')
  return (data?.articles ?? []) as DbArticle[]
}

/** Fetch a single article plus related articles. Throws with status 404 if not found. */
export async function fetchArticleDetail(
  slug: string,
): Promise<{ article: DbArticle, related: DbArticle[] }> {
  const data = await getJson(`/api/articles?slug=${encodeURIComponent(slug)}`)
  return {
    article: data.article as DbArticle,
    related: (data?.related ?? []) as DbArticle[],
  }
}
