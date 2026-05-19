<script setup lang="ts">
import { randIntFromInterval } from '@/utils/random';
import { useStyleStore } from '@/stores/style.store';
import { useCopy } from '@/composable/copy';

const styleStore = useStyleStore();

// ── 配置参数 ──────────────────────────────────────────────────
const count = ref(1);          // 生成数量 1-10
const includeWellKnown = ref(false);  // 是否包含知名端口（0-1023）
const excludeRegistered = ref(false); // 是否排除注册端口（1024-49151，仅保留动态端口）

// ── 生成逻辑 ──────────────────────────────────────────────────
function generatePort(): number {
  const min = includeWellKnown.value ? 0 : (excludeRegistered.value ? 49152 : 1024);
  const max = 65535;
  return randIntFromInterval(min, max);
}

function generatePorts(): number[] {
  const set = new Set<number>();
  const max = 65535;
  const min = includeWellKnown.value ? 0 : (excludeRegistered.value ? 49152 : 1024);
  const available = max - min + 1;
  const n = Math.min(count.value, available);
  let attempts = 0;
  while (set.size < n && attempts < n * 10) {
    set.add(generatePort());
    attempts++;
  }
  return Array.from(set);
}

const ports = ref<number[]>([generatePort()]);

function refresh() {
  ports.value = generatePorts();
}

// 当配置改变时重新生成
watch([count, includeWellKnown, excludeRegistered], () => refresh());

// ── 复制单个端口 ──────────────────────────────────────────────
const copiedPort = ref<number | null>(null);
async function copySingle(p: number) {
  try { await navigator.clipboard.writeText(String(p)); }
  catch { /* ignore */ }
  copiedPort.value = p;
  setTimeout(() => (copiedPort.value = null), 2000);
}

// ── 复制全部 ─────────────────────────────────────────────────
const allCopied = ref(false);
async function copyAll() {
  const text = ports.value.join('\n');
  try { await navigator.clipboard.writeText(text); }
  catch { /* ignore */ }
  allCopied.value = true;
  setTimeout(() => (allCopied.value = false), 2000);
}

// ── 范围说明 ─────────────────────────────────────────────────
const rangeLabel = computed(() => {
  if (includeWellKnown.value && !excludeRegistered.value) return '0 – 65535（全范围）';
  if (!includeWellKnown.value && excludeRegistered.value) return '49152 – 65535（动态端口）';
  return '1024 – 65535（非知名端口）';
});
</script>

<template>
  <div class="port-root" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ── 主卡片 ─────────────────────────────────────────── -->
    <div class="main-card">
      <!-- 设置行 -->
      <div class="settings-row">
        <!-- 生成数量 -->
        <div class="setting-item">
          <label class="setting-label">生成数量</label>
          <div class="count-ctrl">
            <button class="count-btn" :disabled="count <= 1" @click="count = Math.max(1, count - 1)">−</button>
            <span class="count-val">{{ count }}</span>
            <button class="count-btn" :disabled="count >= 10" @click="count = Math.min(10, count + 1)">+</button>
          </div>
        </div>

        <!-- 包含知名端口 -->
        <div class="setting-item">
          <label class="setting-label">包含知名端口（0–1023）</label>
          <n-switch v-model:value="includeWellKnown" size="small" />
        </div>

        <!-- 仅动态端口 -->
        <div class="setting-item">
          <label class="setting-label">仅动态端口（49152–65535）</label>
          <n-switch v-model:value="excludeRegistered" size="small" />
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider" />

      <!-- 范围提示 -->
      <div class="range-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        当前范围：{{ rangeLabel }}
      </div>

      <!-- 端口展示区 -->
      <div class="ports-display">
        <!-- 单端口：大号数字 -->
        <template v-if="count === 1">
          <div class="single-port">
            <span class="port-number">{{ ports[0] }}</span>
            <button
              class="inline-copy-btn"
              :class="{ copied: copiedPort === ports[0] }"
              :title="copiedPort === ports[0] ? '已复制！' : '复制端口'"
              @click="copySingle(ports[0])"
            >
              <svg v-if="copiedPort !== ports[0]" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </template>

        <!-- 多端口：列表 -->
        <template v-else>
          <div class="multi-ports">
            <div
              v-for="p in ports"
              :key="p"
              class="port-row"
              :class="{ copied: copiedPort === p }"
              @click="copySingle(p)"
            >
              <span class="port-num-sm">{{ p }}</span>
              <span class="port-copy-hint">
                <svg v-if="copiedPort !== p" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ copiedPort === p ? '已复制' : '点击复制' }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- 操作按钮 -->
      <div class="action-row">
        <button class="btn-primary" @click="refresh">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          重新生成
        </button>
        <button
          class="btn-secondary"
          :class="{ copied: allCopied }"
          @click="count === 1 ? copySingle(ports[0]) : copyAll()"
        >
          <svg v-if="!allCopied" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ allCopied ? '已复制！' : (count === 1 ? '复制' : '复制全部') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.port-root {
  max-width: 520px;
  margin: 0 auto;
}

/* ── 主卡片 ───────────────────────────────────────────────────── */
.main-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);

  .dark & { background: #1a1a1a; border-color: #333; }
}

/* ── 设置行 ───────────────────────────────────────────────────── */
.settings-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.setting-label {
  font-size: 13px;
  color: #444;
  .dark & { color: #ccc; }
}

/* ── 数量控制 ─────────────────────────────────────────────────── */
.count-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1.5px solid #d1d5db;
  background: transparent;
  color: #555;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.06); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  .dark & {
    border-color: #444; color: #bbb;
    &:hover:not(:disabled) { border-color: #6366f1; color: #a5b4fc; }
  }
}

.count-val {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 20px;
  text-align: center;
  color: #222;
  .dark & { color: #eee; }
}

/* ── 分割线 ───────────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0 12px;
  .dark & { background: #2a2a2a; }
}

/* ── 范围提示 ─────────────────────────────────────────────────── */
.range-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #888;
  background: rgba(0,0,0,0.04);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 16px;

  .dark & { color: #aaa; background: rgba(255,255,255,0.06); }
}

/* ── 端口展示 ─────────────────────────────────────────────────── */
.ports-display {
  margin-bottom: 20px;
}

/* 单端口 */
.single-port {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.port-number {
  font-size: 52px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: #111;
  line-height: 1;
  .dark & { color: #f0f0f0; }
}

.inline-copy-btn {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: 1.5px solid #e0e0e0;
  background: transparent;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.06); }
  &.copied { border-color: #22c55e; background: rgba(34,197,94,0.08); color: #16a34a; }

  .dark & {
    border-color: #444; color: #aaa;
    &:hover { border-color: #6366f1; color: #a5b4fc; }
    &.copied { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #4ade80; }
  }
}

/* 多端口列表 */
.multi-ports {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.port-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid #eee;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #6366f1; background: rgba(99,102,241,0.04); }
  &.copied { border-color: #22c55e; background: rgba(34,197,94,0.06); }

  .dark & {
    background: #111; border-color: #2a2a2a;
    &:hover { border-color: #6366f1; background: rgba(99,102,241,0.08); }
    &.copied { border-color: #22c55e; background: rgba(34,197,94,0.08); }
  }
}

.port-num-sm {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #111;
  .dark & { color: #eee; }
  .copied & { color: #16a34a; }
  .dark .copied & { color: #4ade80; }
}

.port-copy-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #aaa;
  .dark & { color: #666; }
  .copied & { color: #16a34a; }
  .dark .copied & { color: #4ade80; }
}

/* ── 操作按钮 ─────────────────────────────────────────────────── */
.action-row {
  display: flex;
  gap: 10px;
}

.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover { background: #4f46e5; transform: translateY(-1px); }
  &:active { transform: none; }
}

.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
  background: transparent;
  color: #444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #9ca3af; background: #f3f4f6; color: #111; }
  &.copied { border-color: #22c55e; background: rgba(34,197,94,0.08); color: #16a34a; }

  .dark & {
    border-color: #444; color: #ccc;
    &:hover { border-color: #666; background: #2a2a2a; color: #eee; }
    &.copied { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #4ade80; }
  }
}
</style>
