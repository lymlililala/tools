#!/usr/bin/env bash
# nightly 全流程：采集 → 聚类 → 英文合成 → 质量闸门(含虚构否决)入库 tools_articles → 触发 Vercel 重建。
# 两条线（LINE 切换）：
#   tool（默认）：按站内工具关键词搜常青料（1-search）→ 锚定工具页科普文。
#   blog        ：按账号采新闻流（1-crawl）→ 开发者主题博客（当前新闻源易触发虚构否决，暂缓）。
# 用法：bash scripts/wechat/run-all.sh           # 工具科普线
#       LINE=blog bash scripts/wechat/run-all.sh # 博客线
# 环境：需 scripts/wechat/cimidata/.env（次幂）、scripts/wechat/.env（DeepSeek）、根 .env 的 SUPABASE_SECRET_KEY。
#       可选 PEXELS/UNSPLASH key（配图）、VERCEL_DEPLOY_HOOK_URL（入库后自动重建刷 sitemap）。
set -euo pipefail
cd "$(dirname "$0")/../.."   # 切到项目根

LINE="${LINE:-tool}"
DAYS="${DAYS:-14}"
MAX_CLUSTERS="${MAX_CLUSTERS:-8}"
THRESHOLD="${THRESHOLD:-80}"
MAX_PUBLISH="${MAX_PUBLISH:-6}"
IMAGES="${IMAGES:-1}"   # 1=合成插配图占位(由 4-publish 解析为真实图/兜底图)；0=纯文字

echo "==[1/4] 采集（line=${LINE}）=="
if [ "$LINE" = "blog" ]; then
  # 博客线：按账号采新闻流。日常 --today；首次/补量可传 CRAWL_ARGS="--since 2026-06-14 --max-pages 3"
  CRAWL_ARGS="${CRAWL_ARGS:---today --max-pages 2}"
  node scripts/wechat/1-crawl.mjs $CRAWL_ARGS
  CLUSTER_MODE=blog
else
  # 工具科普线：按工具关键词搜常青料。SEARCH_ARGS 可调（--queries/--pages/--since）
  SEARCH_ARGS="${SEARCH_ARGS:---queries 40 --pages 1}"
  node scripts/wechat/1-search.mjs $SEARCH_ARGS
  CLUSTER_MODE=tool
fi

echo "==[2/4] 聚类（mode=${CLUSTER_MODE}，最近 ${DAYS} 天，≤${MAX_CLUSTERS} 簇）=="
node scripts/wechat/2-cluster.mjs --mode "$CLUSTER_MODE" --days "$DAYS" --max-clusters "$MAX_CLUSTERS"

echo "==[3/4] 合成英文文章=="
IMG_FLAG=""; [ "$IMAGES" = "1" ] && IMG_FLAG="--images"
node scripts/wechat/3-synthesize.mjs --days "$DAYS" $IMG_FLAG

echo "==[4/4] 质量闸门 + 虚构否决 + 入库（阈值 ${THRESHOLD}，单次≤${MAX_PUBLISH}）=="
node scripts/wechat/4-publish.mjs --threshold "$THRESHOLD" --max-publish "$MAX_PUBLISH"

echo "全流程完成。复核 scripts/wechat/data/published.json。"
