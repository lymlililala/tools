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
  // 双语：中文列（缺译时为空，前端回落英文）
  title_zh?: string | null
  description_zh?: string | null
  content_zh?: string | null
  keywords_zh?: string[] | null
  created_at?: string
  updated_at?: string
}

/** 按语言挑选展示字段：中文视图优先 *_zh，缺译自动回落英文。 */
export function pickLang(a: Partial<DbArticle>, zh: boolean): {
  title: string
  description: string
  content: string
  keywords: string[]
} {
  return {
    title: zh && a.title_zh ? a.title_zh : (a.title ?? ''),
    description: zh && a.description_zh ? a.description_zh : (a.description ?? ''),
    content: zh && a.content_zh ? a.content_zh : (a.content ?? ''),
    keywords: zh && a.keywords_zh?.length ? a.keywords_zh : (a.keywords ?? []),
  };
}

/** 该文章是否有可用的中文版（决定是否发 zh hreflang / 生成 /zh 页 / 提供语言切换）。 */
export function hasZh(a: Partial<DbArticle>): boolean {
  return !!(a.content_zh && a.content_zh.trim());
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) {
        message = body.error;
      }
    }
    catch { /* ignore non-JSON error bodies */ }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Fetch the full article list (lightweight columns), newest first. */
export async function fetchArticleList(): Promise<DbArticle[]> {
  const data = await getJson('/api/articles');
  return (data?.articles ?? []) as DbArticle[];
}

// 列表也做客户端缓存：进 /blog 会拉全量列表（~200KB / 519 篇），国内首次较慢。
// 缓存 Promise，使会话内重复进入/导航瞬开；可在导航 hover 时预热。
let listCache: Promise<DbArticle[]> | null = null;

/** Cached article list — first call fetches, later calls return instantly. */
export function getArticleListCached(): Promise<DbArticle[]> {
  if (!listCache) {
    listCache = fetchArticleList();
    listCache.catch(() => { listCache = null; }); // 失败不缓存，允许重试
  }
  return listCache;
}

/** Warm the list cache ahead of navigation (e.g. hovering the Blog nav link). */
export function prefetchArticleList(): void {
  void getArticleListCached().catch(() => {});
}

/** Fetch a single article plus related articles. Throws with status 404 if not found. */
export async function fetchArticleDetail(
  slug: string,
): Promise<{ article: DbArticle; related: DbArticle[] }> {
  const data = await getJson(`/api/articles?slug=${encodeURIComponent(slug)}`);
  return {
    article: data.article as DbArticle,
    related: (data?.related ?? []) as DbArticle[],
  };
}

// ─── Client-side detail cache ──────────────────────────────────────────────────
// 点击文章走 SPA 客户端导航，每次都现拉 /api/articles?slug= 才能渲染；国内访问
// Vercel 源站延迟会被放大成「好几秒」。这里把请求按 slug 缓存（缓存 Promise，使
// hover 预取与随后的点击自动去重到同一次请求），并提供 hover 预取入口。
const detailCache = new Map<string, Promise<{ article: DbArticle; related: DbArticle[] }>>();

/** Cached single-article fetch — repeat views in a session are instant. */
export function getArticleDetailCached(
  slug: string,
): Promise<{ article: DbArticle; related: DbArticle[] }> {
  let p = detailCache.get(slug);
  if (!p) {
    p = fetchArticleDetail(slug);
    detailCache.set(slug, p);
    // 失败时移出缓存，允许下次重试（否则会永久缓存一个 rejected promise）
    p.catch(() => detailCache.delete(slug));
  }
  return p;
}

/** Warm the cache ahead of a click (e.g. on hover/focus). Fire-and-forget. */
export function prefetchArticleDetail(slug: string): void {
  if (!slug || detailCache.has(slug)) {
    return;
  }
  void getArticleDetailCached(slug).catch(() => {});
}

