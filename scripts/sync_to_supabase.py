"""
sync_to_supabase.py
把 articles.data.ts 中的 500 篇文章全量 upsert 到 Supabase
"""
import re
import json
import sys
import requests

SUPABASE_URL = "https://tixgzezefjjsyuzgdhcd.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTM3OCwiZXhwIjoyMDkzNzI1Mzc4fQ.CBarLrHnr-tr5ZPaGs2JvW3NJE6O5O1Hw7oTWsHuI-E"
DATA_FILE = "src/pages/articles/articles.data.ts"

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}


# ─── 解析 articles.data.ts ─────────────────────────────────────────────────────
def parse_articles(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    articles = []
    slug_pattern = re.compile(r"\n  \{\n    slug: '([^']+)'")
    positions = [(m.start(), m.group(1)) for m in slug_pattern.finditer(content)]

    for i, (pos, slug) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(content)
        chunk = content[pos:end]

        def get_field(name, c=chunk):
            m = re.search(rf"    {name}: '([^']*)'", c)
            return m.group(1) if m else ""

        def get_keywords(c=chunk):
            m = re.search(r"    keywords: \[([^\]]*)\]", c, re.DOTALL)
            if not m:
                return []
            return re.findall(r"'([^']*)'", m.group(1))

        def get_content(c=chunk):
            # 贪婪匹配到最后一个反引号
            m = re.search(r"    content: `([\s\S]*)`", c)
            if m:
                return m.group(1)
            return ""

        title = get_field("title")
        if not slug or not title:
            continue

        articles.append({
            "slug": slug,
            "tool_path": get_field("toolPath"),
            "title": title,
            "description": get_field("description"),
            "keywords": get_keywords(),
            "category": get_field("category"),
            "published_at": get_field("publishedAt"),
            "content": get_content(),
        })

    return articles


# ─── Supabase upsert ───────────────────────────────────────────────────────────
def upsert_batch(rows):
    # on_conflict=slug + Prefer: resolution=merge-duplicates → INSERT ... ON CONFLICT UPDATE
    url = f"{SUPABASE_URL}/rest/v1/tools_articles?on_conflict=slug"
    h = {**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"}
    resp = requests.post(url, headers=h, json=rows, timeout=60)
    if resp.status_code in (200, 201, 204):
        return True, resp.status_code
    return False, f"HTTP {resp.status_code}: {resp.text[:200]}"


def get_count():
    url = f"{SUPABASE_URL}/rest/v1/tools_articles?select=count"
    h = {**HEADERS, "Prefer": "count=exact", "Range": "0-0"}
    try:
        resp = requests.get(url, headers=h, timeout=10)
        cr = resp.headers.get("Content-Range", "")
        m = re.search(r"/(\d+)", cr)
        return int(m.group(1)) if m else "?"
    except Exception:
        return "?"


# ─── 主流程 ────────────────────────────────────────────────────────────────────
def main():
    print("🚀 开始同步文章到 Supabase...\n")

    print(f"📖 解析 {DATA_FILE} ...")
    articles = parse_articles(DATA_FILE)
    print(f"✅ 解析到 {len(articles)} 篇文章\n")

    before = get_count()
    print(f"📊 同步前数据库有 {before} 篇\n")

    BATCH = 20
    total = len(articles)
    success = 0
    failed = 0
    failed_batches = []

    for i in range(0, total, BATCH):
        batch = articles[i:i + BATCH]
        ok, status = upsert_batch(batch)
        if ok:
            success += len(batch)
        else:
            failed += len(batch)
            failed_batches.append((i // BATCH + 1, status))
            print(f"\n  ❌ 批次 {i // BATCH + 1} 失败: {status}")
        pct = int((i + len(batch)) / total * 100)
        print(f"\r  进度: {min(i + BATCH, total)}/{total} ({pct}%)  ", end="", flush=True)

    print("\n")
    after = get_count()

    print("=" * 45)
    print(f"  同步完成！")
    print(f"  上传成功: {success} 篇")
    print(f"  上传失败: {failed} 篇")
    print(f"  数据库总数: {after} 篇")
    print("=" * 45)

    if failed_batches:
        print("\n失败批次详情：")
        for bn, msg in failed_batches:
            print(f"  批次 {bn}: {msg}")
        sys.exit(1)


if __name__ == "__main__":
    main()
