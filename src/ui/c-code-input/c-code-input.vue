<script setup lang="ts">
/**
 * c-code-input — 带语法高亮的代码输入框
 *
 * 实现原理：textarea 透明叠在 highlight.js 渲染的 pre/code 上方，
 * 两者内容同步，用户输入仍走 textarea，视觉高亮来自 hljs。
 *
 * 支持语言：json / sql / xml / yaml / toml / markdown
 */
import hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import sqlLang from 'highlight.js/lib/languages/sql';
import xmlLang from 'highlight.js/lib/languages/xml';
import yamlLang from 'highlight.js/lib/languages/yaml';

import iniLang from 'highlight.js/lib/languages/ini'; // toml
import markdownLang from 'highlight.js/lib/languages/markdown';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{
  modelValue?: string
  language?: string
  placeholder?: string
  minHeight?: string
  readonly?: boolean
  label?: string
  wrap?: boolean
}>(), {
  modelValue: '',
  language: 'json',
  placeholder: '',
  minHeight: '200px',
  readonly: false,
  label: '',
  wrap: false,
});
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('sql', sqlLang);
hljs.registerLanguage('xml', xmlLang);
hljs.registerLanguage('html', xmlLang);
hljs.registerLanguage('yaml', yamlLang);
hljs.registerLanguage('toml', iniLang);
hljs.registerLanguage('markdown', markdownLang);

const styleStore = useStyleStore();
const textarea = ref<HTMLTextAreaElement | null>(null);
const scrollTop = ref(0);

const highlighted = computed(() => {
  const raw = props.modelValue ?? '';
  if (!raw.trim()) {
    return '';
  }
  try {
    return hljs.highlight(raw, { language: props.language }).value;
  }
  catch {
    return escapeHtml(raw);
  }
});

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
}

function onScroll(e: Event) {
  scrollTop.value = (e.target as HTMLTextAreaElement).scrollTop;
}

// 行号
const lineCount = computed(() => (props.modelValue ?? '').split('\n').length);
const lineNumbers = computed(() => Array.from({ length: lineCount.value }, (_, i) => i + 1));
</script>

<template>
  <div class="c-code-input" :class="{ dark: styleStore.isDarkTheme, readonly, wrap }">
    <div v-if="label" class="code-label">
      {{ label }}
      <span class="lang-badge">{{ language }}</span>
    </div>

    <div class="editor-wrap" :style="{ minHeight }">
      <!-- 行号 -->
      <div class="line-numbers" :style="{ transform: `translateY(-${scrollTop}px)` }">
        <div v-for="n in lineNumbers" :key="n" class="line-num">
          {{ n }}
        </div>
      </div>

      <!-- 语法高亮层（底层，只读） -->
      <pre
        class="highlight-layer"
        aria-hidden="true"
        :style="{ transform: `translateY(-${scrollTop}px)` }"
      ><code class="hljs" v-html="highlighted || '&ZeroWidthSpace;'" /></pre>

      <!-- 透明 textarea（顶层，可交互） -->
      <textarea
        ref="textarea"
        class="code-textarea"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        @input="onInput"
        @scroll="onScroll"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.c-code-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lang-badge {
  background: rgba(99,102,241,0.1);
  color: #6366f1;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.editor-wrap {
  position: relative;
  display: flex;
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.1);
  overflow: hidden;
  background: #fafafa;
  transition: border-color 0.15s, background 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
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

// 行号
.line-numbers {
  flex-shrink: 0;
  width: 40px;
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  background: rgba(0,0,0,0.03);
  border-right: 1px solid rgba(0,0,0,0.06);
  user-select: none;
  pointer-events: none;
  overflow: hidden;

  .dark & {
    background: rgba(255,255,255,0.02);
    border-right-color: rgba(255,255,255,0.06);
  }
}

.line-num {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  padding-right: 8px;
  color: rgba(0,0,0,0.25);
  min-height: 1.6em;

  .dark & {
    color: rgba(255,255,255,0.2);
  }
}

// highlight 层
.highlight-layer {
  position: absolute;
  top: 0;
  left: 40px; // 与行号同宽
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 14px 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  overflow: hidden;
  pointer-events: none;
  background: transparent;
  border: none;

  code.hljs {
    background: transparent;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
  }
}

// 透明 textarea
.code-textarea {
  position: relative;
  flex: 1;
  min-height: 100%;
  padding: 14px 14px;
  padding-left: 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  overflow: auto;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: transparent; // 文字透明，用高亮层显示颜色
  caret-color: #6366f1; // 但光标可见
  z-index: 1;

  &::placeholder {
    color: rgba(0,0,0,0.25);

    .dark & {
      color: rgba(255,255,255,0.2);
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,0.25);
    border-radius: 3px;
  }

  .dark & {
    caret-color: #818cf8;
  }
}

.readonly .code-textarea {
  cursor: default;
  user-select: text;
}

/* ── wrap 模式：长行换行,内容全可见(只读输出场景)。
   换行会破坏行号对齐,故隐藏行号,让高亮层与 textarea 同宽同换行点 → 对齐不破。 */
.c-code-input.wrap {
  .line-numbers {
    display: none;
  }

  .highlight-layer {
    left: 0;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .code-textarea {
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
}

/* ── 移动端适配：长行换行显示，避免代码结果被裁切且无法横向滚动 ──
   高亮层只做纵向同步(无横向同步),窄屏下让 textarea 与高亮层都按 pre-wrap 换行、
   并隐藏行号(换行会破坏行号对齐),两者同宽同字体同换行点 → 完美对齐、内容全可见。 */
@media (max-width: 480px) {
  .line-numbers {
    display: none;
  }

  .highlight-layer {
    left: 0;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    font-size: 16px; // 与 textarea 一起提到 16px:消除 iOS 聚焦缩放,且两者同步 → 高亮对齐不破
  }

  .code-textarea {
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    font-size: 16px;
  }
}
</style>

<style>
/* hljs 主题 - 浅色 */
.c-code-input:not(.dark) .hljs-string { color: #0a8a0a; }
.c-code-input:not(.dark) .hljs-number { color: #d4680a; }
.c-code-input:not(.dark) .hljs-literal { color: #7c3aed; }
.c-code-input:not(.dark) .hljs-keyword { color: #7c3aed; font-weight: 600; }
.c-code-input:not(.dark) .hljs-attr { color: #2563eb; }
.c-code-input:not(.dark) .hljs-attribute { color: #2563eb; }
.c-code-input:not(.dark) .hljs-comment { color: #94a3b8; font-style: italic; }
.c-code-input:not(.dark) .hljs-tag { color: #dc2626; }
.c-code-input:not(.dark) .hljs-name { color: #7c3aed; }
.c-code-input:not(.dark) .hljs-variable { color: #d4680a; }
.c-code-input:not(.dark) .hljs-built_in { color: #0891b2; }
.c-code-input:not(.dark) .hljs-function { color: #0891b2; }
.c-code-input:not(.dark) .hljs-title { color: #0891b2; }

/* hljs 主题 - 深色 */
.c-code-input.dark .hljs-string { color: #86efac; }
.c-code-input.dark .hljs-number { color: #fb923c; }
.c-code-input.dark .hljs-literal { color: #c084fc; }
.c-code-input.dark .hljs-keyword { color: #c084fc; font-weight: 600; }
.c-code-input.dark .hljs-attr { color: #60a5fa; }
.c-code-input.dark .hljs-attribute { color: #60a5fa; }
.c-code-input.dark .hljs-comment { color: #64748b; font-style: italic; }
.c-code-input.dark .hljs-tag { color: #f87171; }
.c-code-input.dark .hljs-name { color: #c084fc; }
.c-code-input.dark .hljs-variable { color: #fb923c; }
.c-code-input.dark .hljs-built_in { color: #22d3ee; }
.c-code-input.dark .hljs-function { color: #22d3ee; }
.c-code-input.dark .hljs-title { color: #22d3ee; }

.c-code-input.dark .highlight-layer code.hljs {
  color: #e2e8f0;
}
.c-code-input:not(.dark) .highlight-layer code.hljs {
  color: #1e293b;
}
</style>
