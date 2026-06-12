<script setup lang="ts">
import { escape, unescape } from 'lodash';
import { refDebounced } from '@vueuse/core';

// ── 双向绑定状态 ──────────────────────────────────────────────────────────
type ActivePane = 'plain' | 'escaped';
const activePane = ref<ActivePane>('plain');

const plainText = ref('<title>IT Tool</title>');
const escapedText = ref('&lt;title&gt;IT Tool&lt;/title&gt;');

const debouncedPlain = refDebounced(plainText, 120);
const debouncedEscaped = refDebounced(escapedText, 120);

// 上方（明文）编辑 → 下方（转义）实时更新
watch(debouncedPlain, (val) => {
  if (activePane.value !== 'plain') {
    return;
  }
  escapedText.value = escape(val);
});

// 下方（转义）编辑 → 上方（明文）实时更新
watch(debouncedEscaped, (val) => {
  if (activePane.value !== 'escaped') {
    return;
  }
  plainText.value = unescape(val);
});

// ── 焦点切换 ─────────────────────────────────────────────────────────────
function onPlainInput(e: Event) {
  activePane.value = 'plain';
  plainText.value = (e.target as HTMLTextAreaElement).value;
}

function onEscapedInput(e: Event) {
  activePane.value = 'escaped';
  escapedText.value = (e.target as HTMLTextAreaElement).value;
}

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearAll() {
  plainText.value = '';
  escapedText.value = '';
  activePane.value = 'plain';
}

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copyPlainSuccess = ref(false);
const copyEscapedSuccess = ref(false);

async function copyPlain() {
  if (!plainText.value) {
    return;
  }
  await navigator.clipboard.writeText(plainText.value);
  copyPlainSuccess.value = true;
  setTimeout(() => (copyPlainSuccess.value = false), 1600);
}

async function copyEscaped() {
  if (!escapedText.value) {
    return;
  }
  await navigator.clipboard.writeText(escapedText.value);
  copyEscapedSuccess.value = true;
  setTimeout(() => (copyEscapedSuccess.value = false), 1600);
}

// ── 字符统计 ─────────────────────────────────────────────────────────────
const plainCharCount = computed(() => [...plainText.value].length);
const escapedCharCount = computed(() => escapedText.value.length);
</script>

<template>
  <div class="html-entities-wrap">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="direction-hint">
        <icon-mdi-arrow-up-down class="dir-icon" />
        <span>Edit either box — they auto-translate in real time</span>
      </div>
      <n-tooltip v-if="plainText || escapedText" trigger="hover" placement="top">
        <template #trigger>
          <button class="icon-btn icon-btn-danger" @click="clearAll">
            <icon-mdi-close class="btn-icon" />
          </button>
        </template>
        Clear all
      </n-tooltip>
    </div>

    <!-- 上：明文区 -->
    <div class="pane" :class="{ 'pane-active': activePane === 'plain' }">
      <div class="pane-header">
        <span class="pane-title">Plain HTML</span>
        <div class="pane-right">
          <span class="char-count">{{ plainCharCount }} chars</span>
          <n-tooltip v-if="plainText" trigger="hover" placement="top">
            <template #trigger>
              <button
                class="icon-btn"
                :class="{ 'icon-btn-success': copyPlainSuccess }"
                @click="copyPlain"
              >
                <icon-mdi-check v-if="copyPlainSuccess" class="btn-icon" />
                <icon-mdi-content-copy v-else class="btn-icon" />
              </button>
            </template>
            {{ copyPlainSuccess ? 'Copied!' : 'Copy plain HTML' }}
          </n-tooltip>
        </div>
      </div>

      <textarea
        class="io-textarea"
        :class="{ 'is-active': activePane === 'plain' }"
        :value="plainText"
        placeholder="Type or paste raw HTML here…  e.g. <title>IT Tool</title>"
        rows="6"
        spellcheck="false"
        @input="onPlainInput"
        @focus="activePane = 'plain'"
      />
    </div>

    <!-- 中间方向指示器 -->
    <div class="pane-divider">
      <div class="arrow-track">
        <div class="arrow-line" />
        <div class="arrow-badge">
          <icon-mdi-arrow-down class="ab-icon" style="color:#6366f1" />
          <span class="ab-label" style="color:#6366f1">escape</span>
        </div>
        <div class="arrow-line" />
        <div class="arrow-badge reverse">
          <icon-mdi-arrow-up class="ab-icon" style="color:#059669" />
          <span class="ab-label" style="color:#059669">unescape</span>
        </div>
        <div class="arrow-line" />
      </div>
    </div>

    <!-- 下：转义区 -->
    <div class="pane" :class="{ 'pane-active': activePane === 'escaped' }">
      <div class="pane-header">
        <span class="pane-title">Escaped Entities</span>
        <div class="pane-right">
          <span class="char-count">{{ escapedCharCount }} chars</span>
          <n-tooltip v-if="escapedText" trigger="hover" placement="top">
            <template #trigger>
              <button
                class="icon-btn"
                :class="{ 'icon-btn-success': copyEscapedSuccess }"
                @click="copyEscaped"
              >
                <icon-mdi-check v-if="copyEscapedSuccess" class="btn-icon" />
                <icon-mdi-content-copy v-else class="btn-icon" />
              </button>
            </template>
            {{ copyEscapedSuccess ? 'Copied!' : 'Copy escaped string' }}
          </n-tooltip>
        </div>
      </div>

      <textarea
        class="io-textarea"
        :class="{ 'is-active': activePane === 'escaped' }"
        :value="escapedText"
        placeholder="Or paste HTML entities here…  e.g. &lt;title&gt;IT Tool&lt;/title&gt;"
        rows="6"
        spellcheck="false"
        @input="onEscapedInput"
        @focus="activePane = 'escaped'"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.html-entities-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 720px;
  margin: 0 auto;
}

// ── 工具栏 ────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.direction-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.45;
}

.dir-icon {
  font-size: 14px;
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

  &:hover {
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
}

.btn-icon {
  font-size: 15px;
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
  opacity: 0.45;
}

.pane-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-count {
  font-size: 11px;
  opacity: 0.35;
  font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

// ── 文本域 ────────────────────────────────────────────────────────────────
.io-textarea {
  width: 100%;
  padding: 12px 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.65;
  resize: vertical;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fafafa;
  color: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(0, 0, 0, 0.28);
    font-family: inherit;
  }

  &.is-active {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: #fff;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.25);
    border-radius: 3px;
  }

  // 深色模式
  :global(.dark) & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;

    &::placeholder {
      color: rgba(255, 255, 255, 0.22);
    }

    &.is-active {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
      background: #0f1117;
    }
  }
}

// ── 中间方向指示器 ────────────────────────────────────────────────────────
.pane-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
}

.arrow-track {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.arrow-line {
  width: 1.5px;
  height: 10px;
  background: rgba(99, 102, 241, 0.2);
}

.arrow-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  margin: 3px 0;

  &.reverse {
    background: rgba(16, 185, 129, 0.07);
    border-color: rgba(16, 185, 129, 0.18);
  }
}

.ab-icon {
  font-size: 12px;
}

.ab-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
</style>
