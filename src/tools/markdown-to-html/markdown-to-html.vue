<script setup lang="ts">
import markdownit from 'markdown-it';
import { refDebounced } from '@vueuse/core';

// ── 状态 ─────────────────────────────────────────────────────────────────
const inputMarkdown = ref('');
const debouncedMd = refDebounced(inputMarkdown, 150);

// ── 选项 ─────────────────────────────────────────────────────────────────
const enableHtml = ref(false);
const enableLinkify = ref(true);
const enableTypographer = ref(false);

// ── 转换 ─────────────────────────────────────────────────────────────────
const outputHtml = computed(() => {
  const md = markdownit({
    html: enableHtml.value,
    linkify: enableLinkify.value,
    typographer: enableTypographer.value,
  });
  return md.render(debouncedMd.value);
});

const hasContent = computed(() => inputMarkdown.value.trim() !== '');
const hasOutput = computed(() => outputHtml.value.trim() !== '');

// ── Tab 切换 ─────────────────────────────────────────────────────────────
type Tab = 'html' | 'preview';
const activeTab = ref<Tab>('html');

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearInput() {
  inputMarkdown.value = '';
}

// ── 打印为 PDF ────────────────────────────────────────────────────────────
function printHtml() {
  if (!hasOutput.value) return;
  const w = window.open();
  if (w === null) return;
  w.document.body.innerHTML = outputHtml.value;
  w.print();
}

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copySuccess = ref(false);
async function copyHtml() {
  if (!hasOutput.value) return;
  await navigator.clipboard.writeText(outputHtml.value);
  copySuccess.value = true;
  setTimeout(() => (copySuccess.value = false), 1800);
}
</script>

<template>
  <div class="md-html-wrap tool-wide">
    <!-- 选项栏 -->
    <div class="settings-bar">
      <label class="setting-item">
        <n-switch v-model:value="enableHtml" size="small" />
        <span class="setting-label">Allow HTML in source</span>
      </label>
      <label class="setting-item">
        <n-switch v-model:value="enableLinkify" size="small" />
        <span class="setting-label">Auto-linkify URLs</span>
      </label>
      <label class="setting-item">
        <n-switch v-model:value="enableTypographer" size="small" />
        <span class="setting-label">Typographer</span>
      </label>
    </div>

    <!-- 双栏布局 -->
    <div class="editor-grid">
      <!-- 左：Markdown 输入 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">Markdown Input</span>
          <div class="pane-actions">
            <n-tooltip v-if="hasContent" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn icon-btn-danger" title="Clear" @click="clearInput">
                  <icon-mdi-close class="btn-icon" />
                </button>
              </template>
              Clear
            </n-tooltip>
          </div>
        </div>

        <c-code-input
          v-model="inputMarkdown"
          language="markdown"
          placeholder="Paste or type your Markdown here…&#10;&#10;# Hello World&#10;**bold**, _italic_, `code`"
          min-height="calc(100vh - 236px)"
        />
      </div>

      <!-- 右：输出区（HTML 源码 / 渲染预览） -->
      <div class="pane">
        <div class="pane-header">
          <!-- Tab 切换 -->
          <div class="tab-group">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'html' }"
              @click="activeTab = 'html'"
            >
              <icon-mdi-code-tags class="tab-icon" />
              HTML Source
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >
              <icon-mdi-eye-outline class="tab-icon" />
              Preview
            </button>
          </div>

          <div class="pane-actions">
            <!-- 复制 HTML -->
            <n-tooltip v-if="hasOutput" trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="icon-btn"
                  :class="{ 'icon-btn-success': copySuccess }"
                  title="Copy HTML"
                  @click="copyHtml"
                >
                  <icon-mdi-check v-if="copySuccess" class="btn-icon" />
                  <icon-mdi-content-copy v-else class="btn-icon" />
                </button>
              </template>
              {{ copySuccess ? 'Copied!' : 'Copy HTML' }}
            </n-tooltip>
            <!-- 打印为 PDF -->
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="icon-btn"
                  :class="{ 'icon-btn-disabled': !hasOutput }"
                  :disabled="!hasOutput"
                  title="Print as PDF"
                  @click="printHtml"
                >
                  <icon-mdi-printer-outline class="btn-icon" />
                </button>
              </template>
              {{ hasOutput ? 'Print as PDF (renders HTML)' : 'No content to print' }}
            </n-tooltip>
          </div>
        </div>

        <!-- HTML 源码 -->
        <c-code-input
          v-if="activeTab === 'html'"
          :model-value="outputHtml"
          language="xml"
          placeholder="Converted HTML will appear here…"
          min-height="calc(100vh - 236px)"
          readonly
        />

        <!-- 渲染预览 -->
        <div v-else class="preview-pane" style="min-height:calc(100vh - 236px)">
          <div v-if="!hasOutput" class="preview-empty">
            <icon-mdi-eye-off-outline class="pe-icon" />
            <span>No content yet — start typing on the left</span>
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else class="prose" v-html="outputHtml" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.md-html-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── 设置栏 ────────────────────────────────────────────────────────────────
.settings-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.12);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;
}

.setting-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
}

// ── 双栏网格 ──────────────────────────────────────────────────────────────
.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// ── 面板 ──────────────────────────────────────────────────────────────────
.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  min-height: 32px;
  gap: 8px;
}

.pane-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

.pane-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

// ── Tab 切换 ─────────────────────────────────────────────────────────────
.tab-group {
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 7px;
  padding: 2px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 5px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.5;
  color: inherit;
  transition: opacity 0.15s, background 0.15s;

  &:hover {
    opacity: 0.8;
  }

  &.active {
    opacity: 1;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  :global(.dark) & {
    &.active {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
  }
}

.tab-icon {
  font-size: 13px;
}

// ── 图标按钮 ──────────────────────────────────────────────────────────────
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  color: inherit;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  }

  &.icon-btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.icon-btn-success {
    opacity: 1;
    color: #22c55e;
  }

  &.icon-btn-disabled,
  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
}

.btn-icon {
  font-size: 15px;
}

// ── 渲染预览区 ────────────────────────────────────────────────────────────
.preview-pane {
  border-radius: 8px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  background: #fafafa;
  overflow: auto;
  padding: 20px 24px;

  :global(.dark) & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.preview-empty {
  height: 100%;
  min-height: calc(100vh - 236px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0.3;
  font-size: 13px;
}

.pe-icon {
  font-size: 32px;
}

// ── Markdown 渲染样式 (prose) ─────────────────────────────────────────────
.prose {
  font-size: 14px;
  line-height: 1.75;
  color: inherit;
  word-break: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    font-weight: 700;
    margin: 1.2em 0 0.5em;
    line-height: 1.3;
  }

  :deep(h1) { font-size: 1.6em; }
  :deep(h2) { font-size: 1.35em; }
  :deep(h3) { font-size: 1.15em; }

  :deep(p) { margin: 0.7em 0; }

  :deep(a) {
    color: #6366f1;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :deep(code) {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.88em;
    background: rgba(99, 102, 241, 0.1);
    padding: 1px 5px;
    border-radius: 4px;
  }

  :deep(pre) {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 7px;
    padding: 14px 16px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid #6366f1;
    margin: 1em 0;
    padding: 4px 16px;
    opacity: 0.75;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.6em;
    margin: 0.7em 0;
  }

  :deep(li) { margin: 0.25em 0; }

  :deep(hr) {
    border: none;
    border-top: 1.5px solid rgba(0, 0, 0, 0.1);
    margin: 1.5em 0;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92em;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 6px 12px;
    text-align: left;
  }

  :deep(th) {
    background: rgba(0, 0, 0, 0.04);
    font-weight: 600;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 6px;
  }
}
</style>
