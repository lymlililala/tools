<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { format } from 'prettier';
import htmlParser from 'prettier/plugins/html';
import { useStorage } from '@vueuse/core';
import hljs from 'highlight.js/lib/core';
import xmlHljs from 'highlight.js/lib/languages/xml';
import Editor from './editor/editor.vue';
import { useStyleStore } from '@/stores/style.store';

hljs.registerLanguage('html', xmlHljs);

const html = useStorage('html-wysiwyg-editor--html', '<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>');
const formattedHtml = asyncComputed(() => format(html.value, { parser: 'html', plugins: [htmlParser] }), '');

const styleStore = useStyleStore();
const { copy } = useClipboard();

// 复制反馈
const copied = ref(false);
async function copyHtml() {
  if (!formattedHtml.value) return;
  await copy(formattedHtml.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1400);
}

// 清空编辑器
function clearEditor() {
  html.value = '';
}

const hasContent = computed(() => html.value.trim().length > 0);

// 语法高亮渲染
const highlightedHtml = computed(() => {
  if (!formattedHtml.value) return '';
  try {
    return hljs.highlight(formattedHtml.value, { language: 'html' }).value;
  }
  catch {
    return formattedHtml.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
});
</script>

<template>
  <div class="wysiwyg-wrap" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ── 主编辑区（左右分栏）─────────────────────────────────────── -->
    <div class="editor-grid">
      <!-- 左侧：所见即所得编辑器 -->
      <div class="pane editor-pane">
        <div class="pane-header">
          <span class="pane-title">
            <icon-mdi-pencil-outline class="pane-icon" />
            编辑器
          </span>
          <div class="pane-actions">
            <n-tooltip v-if="hasContent" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn icon-btn-danger" title="清空内容" @click="clearEditor">
                  <icon-mdi-delete-outline class="btn-icon" />
                </button>
              </template>
              清空内容
            </n-tooltip>
          </div>
        </div>
        <Editor v-model:html="html" />
      </div>

      <!-- 右侧：HTML 源码预览 -->
      <div class="pane code-pane">
        <div class="pane-header">
          <span class="pane-title">
            <icon-mdi-code-tags class="pane-icon" />
            HTML 源码
          </span>
          <div class="pane-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="icon-btn"
                  :class="{ 'icon-btn-success': copied }"
                  :disabled="!formattedHtml"
                  title="复制 HTML"
                  @click="copyHtml"
                >
                  <icon-mdi-check v-if="copied" class="btn-icon" />
                  <icon-mdi-content-copy v-else class="btn-icon" />
                </button>
              </template>
              {{ copied ? '已复制！' : '复制 HTML' }}
            </n-tooltip>
          </div>
        </div>

        <div class="code-scroll">
          <div v-if="formattedHtml" class="code-block">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <pre class="code-pre"><code class="hljs" v-html="highlightedHtml" /></pre>
          </div>
          <div v-else class="code-empty">
            <icon-mdi-code-tags-check class="ce-icon" />
            <span>在左侧编辑器输入内容后，HTML 源码将自动出现在这里</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.wysiwyg-wrap {
  max-width: 1200px;
  margin: 0 auto;
}

// ── 主分栏网格 ────────────────────────────────────────────────────────────
.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// ── 通用面板样式 ──────────────────────────────────────────────────────────
.pane {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  // 增加投影让面板从背景浮现出来
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06), 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  background: #ffffff;

  .dark & {
    background: #1a1a2e;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3), 0 2px 12px rgba(0, 0, 0, 0.2);
  }
}

// ── 面板标题栏 ────────────────────────────────────────────────────────────
.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: rgba(0, 0, 0, 0.015);
  flex-shrink: 0;

  .dark & {
    border-color: rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.02);
  }
}

.pane-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5);

  .dark & { color: rgba(255, 255, 255, 0.42); }
}

.pane-icon { font-size: 14px; }

.pane-actions {
  display: flex;
  gap: 4px;
}

// ── 图标按钮 ──────────────────────────────────────────────────────────────
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  color: inherit;
  transition: background 0.15s, color 0.15s;

  &:hover { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  &.icon-btn-success { color: #16a34a; border-color: rgba(22, 163, 74, 0.3); background: rgba(22, 163, 74, 0.08); }
  &.icon-btn-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }

  .dark & { border-color: rgba(255, 255, 255, 0.1); }
}

.btn-icon { font-size: 14px; }

// ── 左侧编辑器面板 ────────────────────────────────────────────────────────
.editor-pane {
  // 让内部 c-card 撑满
  :deep(.c-card) {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
  }
}

// ── 右侧源码面板 ──────────────────────────────────────────────────────────
.code-pane {
  min-height: 300px;
}

.code-scroll {
  flex: 1;
  overflow: auto;
  padding: 12px 16px;
}

.code-block {
  height: 100%;
}

.code-pre {
  margin: 0;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12.5px;
  line-height: 1.65;
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
  color: inherit;
  background: transparent;
}

// hljs 语法高亮颜色（基于 atom-one 风格，深浅模式均适配）
:deep(.hljs) {
  background: transparent;
  color: #383a42;

  .hljs-tag { color: #e45649; }
  .hljs-name { color: #e45649; }
  .hljs-attr { color: #986801; }
  .hljs-string { color: #50a14f; }
  .hljs-comment { color: #a0a1a7; font-style: italic; }

  .dark & {
    color: #abb2bf;
    .hljs-tag  { color: #e06c75; }
    .hljs-name { color: #e06c75; }
    .hljs-attr { color: #d19a66; }
    .hljs-string { color: #98c379; }
    .hljs-comment { color: #5c6370; }
  }
}

.code-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  gap: 10px;
  opacity: 0.3;
  text-align: center;
}

.ce-icon { font-size: 36px; }
</style>
