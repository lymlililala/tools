<script setup lang="ts">
import { Copy, Eraser } from '@vicons/tabler';
import { getStringSizeInBytes } from './text-statistics.service';
import { useCopy } from '@/composable/copy';
import { formatBytes } from '@/utils/convert';

const { t } = useI18n();

const text = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// ── 统计计算 ──────────────────────────────────────
const charCount = computed(() => [...text.value].length); // 正确处理 Emoji 多码点

const wordCount = computed(() => {
  if (!text.value.trim()) {
    return 0;
  }
  // 支持中文（每个汉字算一词）、英文单词、数字
  const matches = text.value.match(/[\u4E00-\u9FA5]|[a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*/g);
  return matches ? matches.length : 0;
});

const lineCount = computed(() =>
  text.value === '' ? 0 : text.value.split(/\r\n|\r|\n/).length,
);

const byteSize = computed(() => formatBytes(getStringSizeInBytes(text.value)));

// ── 文本框自适应高度 ──────────────────────────────
watch(text, async () => {
  await nextTick();
  const el = textareaRef.value;
  if (!el) {
    return;
  }
  el.style.height = 'auto';
  el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
});

// ── 复制 ──────────────────────────────────────────
const copied = ref(false);
const { copy: copyRaw } = useCopy({ source: text, createToast: false });
const message = useMessage();

async function handleCopyInternal() {
  await copyRaw();
  message.success(t('tools.text-statistics.copied'));
}

async function handleCopy() {
  await handleCopyInternal();
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}

// ── 清空 ──────────────────────────────────────────
function clearText() {
  text.value = '';
  nextTick(() => {
    const el = textareaRef.value;
    if (el) {
      el.style.height = '120px';
      el.focus();
    }
  });
}

// 统计项配置
const stats = computed(() => [
  { key: 'char', label: t('tools.text-statistics.chars'), value: charCount.value },
  { key: 'word', label: t('tools.text-statistics.words'), value: wordCount.value },
  { key: 'line', label: t('tools.text-statistics.lines'), value: lineCount.value },
  { key: 'byte', label: t('tools.text-statistics.bytes'), value: byteSize.value, isString: true },
]);

const hasContent = computed(() => text.value.length > 0);
</script>

<template>
  <div class="ts-wrapper">
    <c-card class="ts-card">
      <!-- 文本框 + 工具栏 -->
      <div class="textarea-wrapper">
        <textarea
          ref="textareaRef"
          v-model="text"
          class="ts-textarea"
          :placeholder="t('tools.text-statistics.placeholder')"
          spellcheck="false"
        />
        <!-- 右上角操作图标 -->
        <div class="textarea-actions">
          <c-tooltip :tooltip="t('tools.text-statistics.copyTooltip')">
            <button
              class="action-btn"
              :class="{ copied }"
              :disabled="!hasContent"
              @click="handleCopy"
            >
              <span v-if="copied" class="check-mark">✓</span>
              <n-icon v-else :component="Copy" size="15" />
            </button>
          </c-tooltip>
          <c-tooltip :tooltip="t('tools.text-statistics.clearTooltip')">
            <button
              class="action-btn"
              :disabled="!hasContent"
              @click="clearText"
            >
              <n-icon :component="Eraser" size="15" />
            </button>
          </c-tooltip>
        </div>
      </div>

      <!-- 统计区 -->
      <div class="stats-grid">
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="stat-item"
          :class="{ 'has-content': hasContent }"
        >
          <div class="stat-label">
            {{ stat.label }}
          </div>
          <div class="stat-value">
            {{ stat.value }}
          </div>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
/* ── 容器 ── */
.ts-wrapper {
  max-width: 680px;
  margin: 0 auto;
}

.ts-card {
  padding: 20px;
}

/* ── 文本框区域 ── */
.textarea-wrapper {
  position: relative;
}

.ts-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 120px;
  max-height: 480px;
  resize: vertical;
  padding: 12px 44px 12px 14px; /* 右侧留出图标位置 */
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.75;
  font-family: inherit;
  color: var(--n-text-color, #333);
  background: var(--n-input-color, #fafafa);
  outline: none;
  overflow-y: auto;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ts-textarea::placeholder {
  color: #999; /* 加深占位符颜色，提升可读性 */
}

.ts-textarea:hover {
  border-color: var(--n-border-color-hover, #bbb);
}

.ts-textarea:focus {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.12);
  background: var(--n-input-color-focus, #fff);
}

/* ── 右上角图标按钮 ── */
.textarea-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: var(--n-text-color-3, #bbb);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  padding: 0;
}

.action-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.06);
  color: var(--n-text-color, #444);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.copied {
  color: var(--primary-color, #18a058);
}

.check-mark {
  font-size: 13px;
  font-weight: 700;
}

/* ── 统计网格 ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin-top: 16px;
  border-top: 1px solid var(--n-divider-color, #f0f0f0);
}

.stat-item {
  padding: 14px 12px 10px;
  text-align: center;
  border-right: 1px solid var(--n-divider-color, #f0f0f0);
  transition: background 0.2s;
}

.stat-item:last-child {
  border-right: none;
}

.stat-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #999; /* 明确颜色，满足对比度要求 */
  margin-bottom: 6px;
  white-space: nowrap;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  /* 空状态：置灰；有内容时：深色 */
  color: #ccc;
  transition: color 0.3s;
}

.stat-item.has-content .stat-value {
  color: var(--n-text-color, #1a1a1a);
}

/* ── 响应式：移动端 2x2 网格 ── */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item:nth-child(2) {
    border-right: none;
  }

  .stat-item:nth-child(3) {
    border-top: 1px solid var(--n-divider-color, #f0f0f0);
  }

  .stat-item:nth-child(4) {
    border-top: 1px solid var(--n-divider-color, #f0f0f0);
    border-right: none;
  }

  .ts-card {
    padding: 14px;
  }
}
</style>
