#!/usr/bin/env bash
# nightly 全流程：采集 → 工具感知聚类 → 英文合成 → 质量闸门入库 tools_articles。
# 用法：bash scripts/wechat/run-all.sh
# 环境：需 scripts/wechat/cimidata/.env（次幂凭证）、scripts/wechat/.env（DeepSeek）、
#       项目根 .env 的 SUPABASE_SECRET_KEY（入库）。配图可选（PEXELS/UNSPLASH key）。
set -euo pipefail
cd "$(dirname "$0")/../.."   # 切到项目根

DAYS="${DAYS:-14}"
MAX_CLUSTERS="${MAX_CLUSTERS:-8}"
THRESHOLD="${THRESHOLD:-80}"
MAX_PUBLISH="${MAX_PUBLISH:-6}"

echo "==[1/4] 采集（当天新文）=="
node scripts/wechat/1-crawl.mjs --today --max-pages 2

echo "==[2/4] 工具感知聚类（最近 ${DAYS} 天，≤${MAX_CLUSTERS} 簇）=="
node scripts/wechat/2-cluster.mjs --days "$DAYS" --max-clusters "$MAX_CLUSTERS"

echo "==[3/4] 合成英文工具文=="
node scripts/wechat/3-synthesize.mjs --days "$DAYS"

echo "==[4/4] 质量闸门 + 入库（阈值 ${THRESHOLD}，单次≤${MAX_PUBLISH}）=="
node scripts/wechat/4-publish.mjs --threshold "$THRESHOLD" --max-publish "$MAX_PUBLISH"

echo "全流程完成。复核 scripts/wechat/data/published.json。"
