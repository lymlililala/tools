// 配图（可选）—— 按关键词搜技术/抽象题材图（热链 CDN），含相关性校验 + 关键词降级 + 缓存。
// 主力 Pexels，未命中回退 Unsplash；都搜不到返回 null，由调用方回退写死图池。
// 与旅游版不同：开发者工具题材无需「他国地名黑名单」，去掉了那套地理过滤。
//
// 默认本流水线**不强制配图**（站内现有工具文多为纯文字/表格）；需要时在 synthesize
// 用 --images 产出 ![alt](IMG: kw) 占位，再由 4-publish 解析为真实图。

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadEnv, DATA_DIR } from './env.mjs'

const CACHE_FILE = join(DATA_DIR, 'image-cache.json')

// 相关性校验时忽略的通用词，只看实义词（技术主体）是否命中
const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'in', 'at', 'on', 'and', 'to', 'for', 'with',
  'view', 'photo', 'image', 'picture', 'background', 'abstract', 'concept', 'modern',
  'technology', 'tech', 'digital', 'computer', 'screen', 'closeup', 'close', 'up'])

function loadCache() {
  if (!existsSync(CACHE_FILE)) return {}
  try { return JSON.parse(readFileSync(CACHE_FILE, 'utf8')) } catch { return {} }
}
function saveCache(c) {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2))
}

function terms(s) {
  return (s || '').toLowerCase().match(/[a-z]{3,}/g)?.filter(w => !STOPWORDS.has(w)) || []
}

/** 相关性：查询里的实义词，至少一个出现在结果描述里，才算真命中 */
function isRelevant(query, desc) {
  const qt = terms(query)
  if (!qt.length) return false
  const dt = new Set(terms(desc))
  return qt.some(w => dt.has(w))
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── 图源适配器：search(query) → [{ url, desc, credit?, downloadLocation? }] ──
class PexelsSource {
  constructor(key) { this.key = key; this.name = 'pexels' }
  async search(query) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`
    const res = await fetch(url, { headers: { Authorization: this.key } })
    if (res.status === 429) throw { rateLimited: true }
    if (!res.ok) return []
    const json = await res.json()
    return (json.photos || []).map(p => ({
      url: p.src?.large || p.src?.original,
      desc: p.alt || '',
      credit: p.photographer || '',
    })).filter(p => p.url)
  }
}

class UnsplashSource {
  constructor(key) { this.key = key; this.name = 'unsplash' }
  async search(query) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${this.key}` } })
    if (res.status === 403 || res.status === 429) throw { rateLimited: true }
    if (!res.ok) return []
    const json = await res.json()
    return (json.results || []).map(p => {
      const base = p.urls?.raw || p.urls?.regular || ''
      const url = base ? `${base}${base.includes('?') ? '&' : '?'}w=1200&q=85&fit=crop` : ''
      return {
        url,
        desc: p.description || p.alt_description || '',
        credit: p.user?.name || '',
        downloadLocation: p.links?.download_location || '',
      }
    }).filter(p => p.url)
  }
}

/**
 * 统一配图客户端：Pexels 优先 → Unsplash 回退。
 * find(keyword, alt) → { url, source, credit } | null
 */
export class ImageFinder {
  constructor(opts = {}) {
    loadEnv()
    const pk = opts.pexelsKey || process.env.PEXELS_API_KEY
    const uk = opts.unsplashKey || process.env.UNSPLASH_ACCESS_KEY
    this.sources = []
    if (pk) this.sources.push(new PexelsSource(pk))
    if (uk) this.sources.push(new UnsplashSource(uk))
    this.enabled = this.sources.length > 0
    this.unsplashKey = uk || null
    this.cache = loadCache()
    this.used = new Set()
    this.disabled = new Set()
    this.stats = { pexels: 0, unsplash: 0, miss: 0, calls: 0 }
  }

  async _search(source, query) {
    const ck = `${source.name}:${query}`
    if (this.cache[ck]) return this.cache[ck]
    let photos = []
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        this.stats.calls++
        photos = await source.search(query)
        break
      } catch (e) {
        if (e && e.rateLimited) { this.disabled.add(source.name); return [] }
        await sleep(700 * (attempt + 1))
      }
    }
    this.cache[ck] = photos
    saveCache(this.cache)
    return photos
  }

  /** 合规：Unsplash 用图前 ping 一次 download_location（失败不影响展示） */
  async _pingDownload(loc) {
    if (!loc || !this.unsplashKey) return
    try { await fetch(`${loc}&client_id=${this.unsplashKey}`) } catch { /* 忽略 */ }
  }

  /**
   * @param {string} keyword  IMG: 后的关键词（如 "json data structure"）
   * @param {string} [alt]    合成产出的 alt，用于降级查询与相关性判断
   * @returns {Promise<{url,source,credit}|null>}
   */
  async find(keyword, alt = '') {
    if (!this.enabled) return null
    const kw = (keyword || '').trim()
    const core = terms(kw).slice(0, 2).join(' ')
    const altCore = terms(alt).slice(0, 2).join(' ')
    const queries = [...new Set([kw, core, altCore].filter(q => q && q.length >= 3))]

    for (const source of this.sources) {
      if (this.disabled.has(source.name)) continue
      for (const q of queries) {
        const photos = await this._search(source, q)
        const pick = photos.find(p => !this.used.has(p.url) && isRelevant(kw, p.desc))
        if (pick) {
          this.used.add(pick.url)
          this.stats[source.name]++
          if (source.name === 'unsplash') await this._pingDownload(pick.downloadLocation)
          return { url: pick.url, source: source.name, credit: pick.credit }
        }
      }
    }
    this.stats.miss++
    return null
  }
}

export default ImageFinder
