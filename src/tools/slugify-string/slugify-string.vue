<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import slugify from '@sindresorhus/slugify';
import { withDefaultOnError } from '@/utils/defaults';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();

const { copy } = useClipboard();
const styleStore = useStyleStore();

const input = ref('');
const slug = computed(() => withDefaultOnError(() => slugify(input.value), ''));

const hasInput = computed(() => input.value.trim().length > 0);
const hasSlug = computed(() => slug.value.length > 0);

// 复制反馈
const copied = ref(false);
async function copySlug() {
  if (!hasSlug.value) return;
  await copy(slug.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1400);
}

function clearInput() {
  input.value = '';
}
</script>

<template>
  <div class="slugify-wrap" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ① 输入区 ─────────────────────────────────────────────────── -->
    <div class="field-group">
      <div class="field-header">
        <label class="field-label" for="slug-input">{{ t('tools.slugify-string.inputLabel') }}</label>
        <button v-if="hasInput" class="clear-btn" :title="t('tools.slugify-string.clear')" @click="clearInput">
          <icon-mdi-close class="clear-icon" />
        </button>
      </div>
      <textarea
        id="slug-input"
        v-model="input"
        class="slug-textarea input-area"
        :placeholder="t('tools.slugify-string.inputPlaceholder')"
        rows="3"
        spellcheck="false"
        autofocus
      />
      <div class="field-hint">
        {{ t('tools.slugify-string.hint') }}
      </div>
    </div>

    <!-- ② 输出区 ─────────────────────────────────────────────────── -->
    <div class="field-group">
      <div class="field-header">
        <label class="field-label">{{ t('tools.slugify-string.outputLabel') }}</label>
        <span class="readonly-badge">
          <icon-mdi-lock-outline class="lock-icon" />
          {{ t('tools.slugify-string.readonly') }}
        </span>
      </div>
      <div class="slug-output" :class="{ empty: !hasSlug }">
        <span v-if="hasSlug" class="slug-text">{{ slug }}</span>
        <span v-else class="slug-placeholder">{{ t('tools.slugify-string.placeholder') }}</span>
      </div>
    </div>

    <!-- ③ 复制按钮 ──────────────────────────────────────────────── -->
    <div class="action-row">
      <button
        class="copy-btn"
        :class="{ 'copy-btn--success': copied, 'copy-btn--disabled': !hasSlug }"
        :disabled="!hasSlug"
        @click="copySlug"
      >
        <icon-mdi-check v-if="copied" class="btn-icon" />
        <icon-mdi-content-copy v-else class="btn-icon" />
        {{ copied ? t('tools.slugify-string.justCopied') : t('tools.slugify-string.copyResult') }}
      </button>

      <!-- 实时字符统计 -->
      <div v-if="hasSlug" class="char-stats">
        <span>{{ t('tools.slugify-string.charCount', { count: slug.length }) }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.slugify-wrap {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

// ── 字段组 ────────────────────────────────────────────────────────────────
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  // 提升标签对比度（原始设计过浅）
  color: rgba(0, 0, 0, 0.58);

  .dark & { color: rgba(255, 255, 255, 0.52); }
}

// 清空按钮
.clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.35;
  transition: opacity 0.15s, background 0.15s;

  &:hover { opacity: 0.8; background: rgba(239, 68, 68, 0.1); color: #ef4444; }
}

.clear-icon { font-size: 13px; }

// 只读标识
.readonly-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.38;
  user-select: none;
}

.lock-icon { font-size: 11px; }

// ── 输入文本框 ────────────────────────────────────────────────────────────
.slug-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder { color: rgba(0, 0, 0, 0.3); }

  .dark & {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
    &:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12); }
    &::placeholder { color: rgba(255, 255, 255, 0.22); }
  }
}

.field-hint {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.36);
  line-height: 1.4;

  .dark & { color: rgba(255, 255, 255, 0.3); }
}

// ── 输出展示框（只读） ────────────────────────────────────────────────────
.slug-output {
  min-height: 80px;
  padding: 10px 14px;
  border-radius: 8px;
  // 浅灰背景明确表示只读区域
  background: rgba(0, 0, 0, 0.035);
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  cursor: default;
  transition: border-color 0.15s;

  &:not(.empty) {
    border-color: rgba(99, 102, 241, 0.2);
    background: rgba(99, 102, 241, 0.03);
  }

  .dark & {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.07);

    &:not(.empty) {
      border-color: rgba(129, 140, 248, 0.2);
      background: rgba(99, 102, 241, 0.05);
    }
  }
}

.slug-text {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  font-weight: 600;
  // 使用深色调以确保对比度
  color: #4f46e5;
  word-break: break-all;
  line-height: 1.6;

  .dark & { color: #818cf8; }
}

.slug-placeholder {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.28);
  font-style: italic;
  line-height: 1.6;

  .dark & { color: rgba(255, 255, 255, 0.2); }
}

// ── 操作行 ────────────────────────────────────────────────────────────────
.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 复制按钮 - 使用明确背景色，解决原先对比度过低问题
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;

  // 默认状态：深色背景 + 白色文字，对比度远超 WCAG AA
  background: #4f46e5;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);

  &:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
  }

  &:active:not(:disabled) { transform: translateY(0); }

  // 成功状态
  &--success {
    background: #16a34a !important;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25) !important;
    color: #ffffff !important;
  }

  // 禁用状态
  &--disabled {
    background: rgba(0, 0, 0, 0.08) !important;
    color: rgba(0, 0, 0, 0.3) !important;
    box-shadow: none !important;
    cursor: not-allowed;

    .dark & {
      background: rgba(255, 255, 255, 0.07) !important;
      color: rgba(255, 255, 255, 0.25) !important;
    }
  }

  .dark & {
    background: #6366f1;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    &:hover:not(:disabled) { background: #818cf8; }
  }
}

.btn-icon { font-size: 14px; }

// 字符统计
.char-stats {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.38);
  font-variant-numeric: tabular-nums;

  .dark & { color: rgba(255, 255, 255, 0.3); }
}
</style>
