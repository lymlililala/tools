<script setup lang="ts">
import {
  type UnicodeFormat,
  convertTextToUnicode,
  convertUnicodeToText,
  unicodeFormatOptions,
} from './text-to-unicode.service';
import { useCopy } from '@/composable/copy';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

// ── 格式选项 ─────────────────────────────────────────────────────────────
const selectedFormat = ref<UnicodeFormat>('js');
const currentFormatOption = computed(() =>
  unicodeFormatOptions.find(o => o.value === selectedFormat.value)!,
);

// ── 双向绑定核心状态 ─────────────────────────────────────────────────────
const activeSource = ref<'text' | 'unicode'>('text');

const textInput = ref('');
const unicodeInput = ref('');

const debouncedText = refDebounced(textInput, 80);
const debouncedUnicode = refDebounced(unicodeInput, 80);

// 计算展示值
const displayUnicode = computed(() => {
  if (activeSource.value === 'text') {
    return convertTextToUnicode(debouncedText.value, selectedFormat.value);
  }
  return unicodeInput.value;
});

const displayText = computed(() => {
  if (activeSource.value === 'unicode') {
    return withDefaultOnError(() => convertUnicodeToText(debouncedUnicode.value), '');
  }
  return textInput.value;
});

// ── 事件处理 ─────────────────────────────────────────────────────────────
function onTextInput(val: string) {
  activeSource.value = 'text';
  textInput.value = val;
}

function onUnicodeInput(val: string) {
  activeSource.value = 'unicode';
  unicodeInput.value = val;
}

// 格式切换时重新格式化（仅当文本侧是激活源）
watch(selectedFormat, () => {
  if (activeSource.value === 'text' && textInput.value) {
    unicodeInput.value = convertTextToUnicode(textInput.value, selectedFormat.value);
  }
});

// ── Unicode 输入验证 ──────────────────────────────────────────────────────
const unicodeValidationRules = [
  {
    validator: (value: string) => {
      if (!value.trim()) {
        return true;
      }
      // 允许合法的 Unicode 转义序列 + 普通文本 + 空白
      // 如果包含 \u 但格式不完整则报错
      const hasInvalidEscape = /\\u(?![0-9a-fA-F]{4}|\{[0-9a-fA-F]{1,6}\})/.test(value);
      return !hasInvalidEscape;
    },
    message: 'Contains invalid Unicode escape sequence (e.g. \\uXXXX or \\u{XXXXX})',
  },
];

// ── 复制 ─────────────────────────────────────────────────────────────────
const { copy: copyUnicode, isJustCopied: unicodeCopied } = useCopy({ source: displayUnicode, createToast: false });
const { copy: copyText, isJustCopied: textCopied } = useCopy({ source: displayText, createToast: false });
</script>

<template>
  <div class="tool-wide ttu-wrap">
    <!-- 工具栏：格式选择 -->
    <div class="toolbar">
      <span class="toolbar-label">Output format:</span>
      <div class="format-tabs">
        <button
          v-for="opt in unicodeFormatOptions"
          :key="opt.value"
          class="format-tab"
          :class="{ active: selectedFormat === opt.value }"
          @click="selectedFormat = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <span class="format-hint">{{ currentFormatOption.example }}</span>
    </div>

    <!-- 双框主体 -->
    <div class="converter-grid">
      <!-- 左：文本 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">Text</span>
          <c-button
            v-if="displayText"
            size="small"
            variant="text"
            class="copy-btn"
            :class="{ copied: textCopied }"
            @click="copyText()"
          >
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="textCopied" key="check" class="icon-check" />
              <icon-mdi-content-copy v-else key="copy" />
            </transition>
            {{ textCopied ? 'Copied!' : 'Copy' }}
          </c-button>
        </div>

        <c-input-text
          v-if="activeSource === 'text'"
          :value="textInput"
          multiline
          autosize
          :rows="5"
          raw-text
          autofocus
          :placeholder="t('tools.text-to-unicode.textPlaceholder')"
          class="pane-textarea"
          test-id="text-to-unicode-input"
          @update:value="onTextInput"
        />
        <div
          v-else
          class="readonly-pane"
          :class="{ empty: !displayText }"
          @click="activeSource = 'text'"
        >
          <span v-if="displayText">{{ displayText }}</span>
          <span v-else class="placeholder-text">Decoded text will appear here</span>
        </div>

        <div class="pane-footer">
          <span class="pane-hint" @click="activeSource = 'text'">
            <icon-mdi-pencil-outline class="hint-icon" />
            Click to edit text
          </span>
        </div>
      </div>

      <!-- 中间箭头 -->
      <div class="pane-divider">
        <div class="arrow-wrap">
          <icon-mdi-arrow-left-right class="arrow-icon" />
        </div>
      </div>

      <!-- 右：Unicode -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">Unicode</span>
          <c-button
            v-if="displayUnicode"
            size="small"
            variant="text"
            class="copy-btn"
            :class="{ copied: unicodeCopied }"
            @click="copyUnicode()"
          >
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="unicodeCopied" key="check" class="icon-check" />
              <icon-mdi-content-copy v-else key="copy" />
            </transition>
            {{ unicodeCopied ? 'Copied!' : 'Copy' }}
          </c-button>
        </div>

        <c-input-text
          v-if="activeSource === 'unicode'"
          :value="unicodeInput"
          multiline
          autosize
          :rows="5"
          raw-text
          monospace
          :placeholder="currentFormatOption.example"
          class="pane-textarea mono"
          :validation-rules="unicodeValidationRules"
          test-id="unicode-to-text-input"
          @update:value="onUnicodeInput"
        />
        <div
          v-else
          class="readonly-pane mono"
          :class="{ empty: !displayUnicode }"
          @click="activeSource = 'unicode'"
        >
          <span v-if="displayUnicode">{{ displayUnicode }}</span>
          <span v-else class="placeholder-text">Unicode output will appear here</span>
        </div>

        <div class="pane-footer">
          <span class="pane-hint" @click="activeSource = 'unicode'">
            <icon-mdi-pencil-outline class="hint-icon" />
            Click to edit Unicode
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ttu-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── 工具栏 ────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(128, 128, 128, 0.055);
  border-radius: 8px;
}

.toolbar-label {
  font-size: 12px;
  opacity: 0.5;
  flex-shrink: 0;
}

.format-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.format-tab {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: transparent;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.15s;
  color: inherit;

  &:hover {
    opacity: 0.9;
    background: rgba(128, 128, 128, 0.1);
  }

  &.active {
    background: rgba(24, 160, 88, 0.12);
    border-color: rgba(24, 160, 88, 0.4);
    color: #18a058;
    opacity: 1;
    font-weight: 600;
  }
}

.format-hint {
  font-size: 11px;
  opacity: 0.35;
  font-family: 'SF Mono', monospace;
  margin-left: 4px;

  @media (max-width: 640px) {
    display: none;
  }
}

// ── 双框网格 ──────────────────────────────────────────────────────────────
.converter-grid {
  display: grid;
  grid-template-columns: 1fr 28px 1fr;
  gap: 0;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

// ── 分隔箭头 ──────────────────────────────────────────────────────────────
.pane-divider {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 36px;

  @media (max-width: 640px) {
    padding: 4px 0;
    transform: rotate(90deg);
  }
}

.arrow-wrap {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.1);
}

.arrow-icon {
  font-size: 14px;
  opacity: 0.4;
}

// ── 面板 ──────────────────────────────────────────────────────────────────
.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.pane-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.55;
  transition: opacity 0.15s, color 0.2s;

  &:hover { opacity: 1; }
  &.copied { color: #22c55e; opacity: 1; }
}

.icon-check { color: #22c55e; }

// ── 只读区 ────────────────────────────────────────────────────────────────
.readonly-pane {
  min-height: 120px;
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid rgba(128, 128, 128, 0.12);
  font-size: 13px;
  line-height: 1.65;
  cursor: pointer;
  transition: background 0.15s;
  word-break: break-all;
  white-space: pre-wrap;

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }

  &.mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.8;
    letter-spacing: 0.02em;
  }

  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.placeholder-text {
  font-size: 12px;
  opacity: 0.25;
  font-style: italic;
}

// 激活态等宽字体
.pane-textarea.mono :deep(.input) {
  font-family: 'SF Mono', 'Fira Code', monospace !important;
  font-size: 12px;
  line-height: 1.8;
}

// ── 底部提示 ──────────────────────────────────────────────────────────────
.pane-footer {
  padding: 0 2px;
}

.pane-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  opacity: 0.3;
  cursor: pointer;
  transition: opacity 0.15s;
  user-select: none;

  &:hover { opacity: 0.7; }
}

.hint-icon { font-size: 11px; }

// ── 图标动画 ──────────────────────────────────────────────────────────────
.icon-fade-enter-active,
.icon-fade-leave-active { transition: all 0.15s ease; }

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}
</style>
