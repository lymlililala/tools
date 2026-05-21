<script setup lang="ts">
import { normalizeEmail } from 'email-normalizer';
import { refDebounced } from '@vueuse/core';
import { withDefaultOnError } from '@/utils/defaults';
import { useCopy } from '@/composable/copy';

// ── 输入 ──────────────────────────────────────────────────────
const rawEmails = ref('');
const debouncedRaw = refDebounced(rawEmails, 150);

// 简单的 email 格式检测
function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// ── 处理逻辑 ──────────────────────────────────────────────────
interface ProcessResult {
  normalized: string
  totalCount: number
  validCount: number
  invalidCount: number
  dedupCount: number
  outputCount: number
}

const processResult = computed((): ProcessResult => {
  const lines = debouncedRaw.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const totalCount = lines.length;
  let validCount = 0;
  let invalidCount = 0;

  const normalizedList: string[] = [];
  for (const line of lines) {
    if (!looksLikeEmail(line)) {
      invalidCount++;
      continue;
    }
    const result = withDefaultOnError(() => normalizeEmail({ email: line }), null);
    if (result) {
      validCount++;
      normalizedList.push(result);
    }
    else {
      invalidCount++;
    }
  }

  // 去重
  const beforeDedup = normalizedList.length;
  const deduped = [...new Set(normalizedList)];
  const dedupCount = beforeDedup - deduped.length;

  return {
    normalized: deduped.join('\n'),
    totalCount,
    validCount,
    invalidCount,
    dedupCount,
    outputCount: deduped.length,
  };
});

const normalizedEmails = computed(() => processResult.value.normalized);
const hasInput  = computed(() => rawEmails.value.trim().length > 0);
const hasOutput = computed(() => normalizedEmails.value.length > 0);

// ── 文件上传 ──────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerUpload() { fileInputRef.value?.click(); }
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { rawEmails.value = reader.result as string; };
  reader.readAsText(file, 'utf-8');
  (e.target as HTMLInputElement).value = '';
}

// ── 下载 ──────────────────────────────────────────────────────
function downloadResult() {
  if (!normalizedEmails.value) return;
  const blob = new Blob([normalizedEmails.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'normalized-emails.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// ── 复制 ──────────────────────────────────────────────────────
const { t } = useI18n();

const { copy, isJustCopied } = useCopy({
  source: normalizedEmails,
});
</script>

<template>
  <div class="email-root tool-wide">
    <!-- ── 输入区 ──────────────────────────────────────────── -->
    <div class="section">
      <div class="section-header">
        <span class="section-label">{{ t('tools.email-normalizer.inputLabel') }}</span>
        <div class="action-group">
          <!-- 上传文件 -->
          <c-tooltip :tooltip="t('tools.email-normalizer.uploadTooltip')" position="bottom">
            <button class="hdr-btn" @click="triggerUpload">
              <icon-mdi-upload />
            </button>
          </c-tooltip>
          <input
            ref="fileInputRef"
            type="file"
            accept=".txt,.csv,text/plain"
            style="display:none"
            @change="onFileChange"
          />
          <!-- 清空 -->
          <c-tooltip v-if="hasInput" :tooltip="t('tools.email-normalizer.clearInput')" position="bottom">
            <button class="hdr-btn" @click="rawEmails = ''">
              <icon-mdi-close-circle-outline />
            </button>
          </c-tooltip>
        </div>
      </div>

      <div class="textarea-wrap" :class="{ 'focused': true }">
        <textarea
          v-model="rawEmails"
          class="email-textarea"
          :placeholder="t('tools.email-normalizer.placeholder')"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          autofocus
        />
      </div>
    </div>

    <!-- ── 统计信息 ───────────────────────────────────────── -->
    <transition name="slide-down">
      <div v-if="hasInput" class="stats-bar">
        <div class="stat-item">
          <span class="stat-num">{{ processResult.totalCount }}</span>
          <span class="stat-label">{{ t('tools.email-normalizer.statInput') }}</span>
        </div>
        <div class="stat-sep">→</div>
        <div class="stat-item stat-item--valid">
          <span class="stat-num">{{ processResult.validCount }}</span>
          <span class="stat-label">{{ t('tools.email-normalizer.statValid') }}</span>
        </div>
        <template v-if="processResult.invalidCount > 0">
          <div class="stat-sep">·</div>
          <div class="stat-item stat-item--invalid">
            <span class="stat-num">{{ processResult.invalidCount }}</span>
            <span class="stat-label">{{ t('tools.email-normalizer.statInvalid') }}</span>
          </div>
        </template>
        <template v-if="processResult.dedupCount > 0">
          <div class="stat-sep">·</div>
          <div class="stat-item stat-item--dedup">
            <span class="stat-num">-{{ processResult.dedupCount }}</span>
            <span class="stat-label">{{ t('tools.email-normalizer.statDuplicate') }}</span>
          </div>
        </template>
        <div class="stat-sep">→</div>
        <div class="stat-item stat-item--output">
          <span class="stat-num">{{ processResult.outputCount }}</span>
          <span class="stat-label">{{ t('tools.email-normalizer.statOutput') }}</span>
        </div>
      </div>
    </transition>

    <!-- ── 输出区 ──────────────────────────────────────────── -->
    <div class="section">
      <div class="section-header">
        <span class="section-label">{{ t('tools.email-normalizer.outputLabel') }}</span>
        <div class="action-group">
          <!-- 复制 -->
          <c-tooltip :tooltip="isJustCopied ? t('tools.email-normalizer.copied') : t('tools.email-normalizer.copyResult')" position="bottom">
            <button
              class="hdr-btn"
              :class="{ 'hdr-btn--success': isJustCopied }"
              :disabled="!hasOutput"
              @click="copy()"
            >
              <icon-mdi-check v-if="isJustCopied" />
              <icon-mdi-content-copy v-else />
            </button>
          </c-tooltip>
          <!-- 下载 -->
          <c-tooltip :tooltip="t('tools.email-normalizer.downloadTooltip')" position="bottom">
            <button class="hdr-btn" :disabled="!hasOutput" @click="downloadResult">
              <icon-mdi-download />
            </button>
          </c-tooltip>
        </div>
      </div>

      <div class="textarea-wrap textarea-wrap--readonly">
        <textarea
          :value="normalizedEmails"
          class="email-textarea email-textarea--readonly"
          :placeholder="t('tools.email-normalizer.outputPlaceholder')"
          readonly
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.email-root {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── 区块 ─────────────────────────────────────────────────────── */
.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
}

.section-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #666;
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .dark & { color: #888; }
}

/* ── 操作按钮 ─────────────────────────────────────────────────── */
.action-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.hdr-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.45;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: opacity 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(99,102,241,0.08);
  }
  &:disabled { opacity: 0.2; cursor: not-allowed; }
  &--success { opacity: 1 !important; color: #22c55e !important; }

  .dark &:hover:not(:disabled) { background: rgba(129,140,248,0.1); }
}

/* ── 文本框包装 ───────────────────────────────────────────────── */
.textarea-wrap {
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: #fafafa;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }

  &--readonly {
    background: #f8f9fb;
    &:focus-within {
      border-color: rgba(0,0,0,0.1);
      box-shadow: none;
    }
    .dark & { background: #111; }
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.1);

    &:focus-within {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
    }
  }
}

/* ── 文本框本体 ───────────────────────────────────────────────── */
.email-textarea {
  width: 100%;
  min-height: 140px;
  height: calc((100vh - 400px) / 2);
  max-height: 320px;
  padding: 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.7;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #1e293b;
  caret-color: #6366f1;
  display: block;

  .dark & { color: #e2e8f0; }

  &::placeholder {
    color: rgba(0,0,0,0.28);
    font-style: italic;
    .dark & { color: rgba(255,255,255,0.2); }
  }

  &--readonly {
    cursor: default;
    user-select: text;
    color: #334155;
    .dark & { color: #cbd5e1; }
  }

  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,0.2);
    border-radius: 3px;
  }
}

/* ── 统计信息栏 ───────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(0,0,0,0.025);
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);
  flex-wrap: wrap;

  .dark & {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.07);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;

  &--valid .stat-num   { color: #16a34a; }
  &--invalid .stat-num { color: #dc2626; }
  &--dedup .stat-num   { color: #d97706; }
  &--output .stat-num  { color: #6366f1; font-weight: 700; }

  .dark & {
    &.stat-item--valid .stat-num   { color: #4ade80; }
    &.stat-item--invalid .stat-num { color: #f87171; }
    &.stat-item--dedup .stat-num   { color: #fbbf24; }
    &.stat-item--output .stat-num  { color: #a5b4fc; }
  }
}

.stat-num {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #333;
  line-height: 1;
  .dark & { color: #eee; }
}

.stat-label {
  font-size: 10px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  .dark & { color: #666; }
}

.stat-sep {
  font-size: 14px;
  color: #ccc;
  .dark & { color: #444; }
}

/* ── 动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
