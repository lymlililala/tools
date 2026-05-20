<script setup lang="ts">
import RandExp from 'randexp';
import { render } from '@regexper/render';
import type { ShadowRootExpose } from 'vue-shadow-dom';
import { refDebounced } from '@vueuse/core';
import { matchRegex } from './regex-tester.service';
import { useQueryParamOrStorage } from '@/composable/queryParams';

const { t } = useI18n();

// ── 输入状态 ─────────────────────────────────────────────────
const regex = useQueryParamOrStorage({ name: 'regex', storageName: 'regex-tester:regex', defaultValue: '' });
const text = ref('');

// 修饰符
const flagGlobal      = ref(true);
const flagIgnoreCase  = ref(false);
const flagMultiline   = ref(false);
const flagDotAll      = ref(true);
const flagUnicode     = ref(true);
const flagUnicodeSets = ref(false);

const flags = computed(() => {
  let f = 'd';
  if (flagGlobal.value)      f += 'g';
  if (flagIgnoreCase.value)  f += 'i';
  if (flagMultiline.value)   f += 'm';
  if (flagDotAll.value)      f += 's';
  if (flagUnicode.value)     f += 'u';
  else if (flagUnicodeSets.value) f += 'v';
  return f;
});

const FLAG_DEFS = computed(() => [
  { key: 'g', label: 'g', title: t('tools.regex-tester.flagGlobal'), ref: flagGlobal },
  { key: 'i', label: 'i', title: t('tools.regex-tester.flagIgnoreCase'), ref: flagIgnoreCase },
  { key: 'm', label: 'm', title: t('tools.regex-tester.flagMultiline'), ref: flagMultiline },
  { key: 's', label: 's', title: t('tools.regex-tester.flagDotAll'), ref: flagDotAll },
  { key: 'u', label: 'u', title: t('tools.regex-tester.flagUnicode'), ref: flagUnicode },
  { key: 'v', label: 'v', title: t('tools.regex-tester.flagUnicodeSets'), ref: flagUnicodeSets },
]);

// ── 正则解析 & 错误 ────────────────────────────────────────────
const regexError = computed((): string => {
  if (!regex.value) return '';
  try {
    // eslint-disable-next-line no-new
    new RegExp(regex.value, flags.value.replace('d', ''));
    return '';
  }
  catch (e: any) {
    return e?.message ?? t('tools.regex-tester.invalidRegex');
  }
});

const debouncedRegex = refDebounced(regex, 120);
const debouncedText  = refDebounced(text, 120);

const results = computed(() => {
  if (!debouncedRegex.value || !debouncedText.value || regexError.value) return [];
  try {
    return matchRegex(debouncedRegex.value, debouncedText.value, flags.value);
  }
  catch (_) {
    return [];
  }
});

// ── 高亮文本 ──────────────────────────────────────────────────
const highlightColors = ['rgba(99,102,241,0.22)', 'rgba(16,185,129,0.22)'];

const highlightedText = computed((): string => {
  if (!debouncedText.value) return '';
  if (!results.value.length) return escapeHtml(debouncedText.value);

  const raw = debouncedText.value;
  let out = '';
  let cursor = 0;

  for (let i = 0; i < results.value.length; i++) {
    const match = results.value[i];
    const start = match.index as number;
    const end = start + match.value.length;

    if (start > cursor) {
      out += escapeHtml(raw.slice(cursor, start));
    }
    const color = highlightColors[i % 2];
    out += `<mark style="background:${color};border-radius:2px;padding:0 1px;">${escapeHtml(match.value)}</mark>`;
    cursor = end;
  }
  if (cursor < raw.length) {
    out += escapeHtml(raw.slice(cursor));
  }
  // preserve newlines
  return out.replace(/\n/g, '<br>');
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── 状态判断 ──────────────────────────────────────────────────
const isEmpty   = computed(() => !regex.value && !text.value);
const hasMatch  = computed(() => results.value.length > 0);
const matchCount = computed(() => results.value.length);

// ── 示例文本 ──────────────────────────────────────────────────
const sample = computed(() => {
  try {
    const randexp = new RandExp(new RegExp(regex.value.replace(/\(\?\<[^\>]*\>/g, '(?:')));
    return randexp.gen();
  }
  catch (_) {
    return '';
  }
});

// ── 正则可视化 ────────────────────────────────────────────────
const visualizerSVG = ref<ShadowRootExpose>();
watchEffect(async () => {
  const regexValue = regex.value;
  const visualizer = visualizerSVG.value?.shadow_root;
  if (visualizer) {
    while (visualizer.lastChild) visualizer.removeChild(visualizer.lastChild);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    try { await render(regexValue, svg); } catch (_) {}
    visualizer.appendChild(svg);
  }
});
</script>

<template>
  <div class="rt-root">
    <!-- ── 顶部：正则输入行 ──────────────────────────────── -->
    <div class="regex-row" :class="{ 'regex-row--error': !!regexError }">
      <span class="regex-slash">/</span>
      <input
        v-model="regex"
        class="regex-input"
        :placeholder="t('tools.regex-tester.regexPlaceholder')"
        spellcheck="false"
        autocomplete="off"
        autofocus
      />
      <span class="regex-slash">/</span>

      <!-- 修饰符 Toggle Chips -->
      <div class="flag-chips">
        <button
          v-for="fd in FLAG_DEFS"
          :key="fd.key"
          class="flag-chip"
          :class="{ 'flag-chip--on': fd.ref.value }"
          :title="fd.title"
          @click="(fd.ref as any).value = !(fd.ref as any).value"
        >
          {{ fd.label }}
        </button>
      </div>

      <!-- 跳转备忘录 -->
      <router-link target="_blank" to="/regex-memo" class="memo-link" :title="t('tools.regex-tester.viewMemo')">
        <icon-mdi-book-open-variant />
      </router-link>
    </div>

    <!-- 语法错误提示 -->
    <transition name="slide-down">
      <div v-if="regexError" class="error-banner">
        <icon-mdi-alert-circle-outline class="error-icon" />
        <span>{{ regexError }}</span>
      </div>
    </transition>

    <!-- ── 主体双列 ──────────────────────────────────────── -->
    <div class="main-grid">
      <!-- 左列：待测文本 -->
      <div class="panel panel--left">
        <div class="panel-header">
          <span class="panel-title">{{ t('tools.regex-tester.testText') }}</span>
          <transition name="fade">
            <span v-if="hasMatch" class="match-badge">
              {{ t('tools.regex-tester.matchCount', { n: matchCount }) }}
            </span>
          </transition>
          <button v-if="text" class="panel-btn" :title="t('tools.regex-tester.clear')" @click="text = ''">
            <icon-mdi-close-circle-outline />
          </button>
        </div>

        <!-- 高亮层 + 透明 textarea 叠加 -->
        <div class="editor-wrap">
          <div
            class="highlight-layer"
            aria-hidden="true"
            v-html="highlightedText || ''"
          />
          <textarea
            v-model="text"
            class="editor-textarea"
            :placeholder="t('tools.regex-tester.textPlaceholder')"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- 右列：匹配结果 -->
      <div class="panel panel--right">
        <div class="panel-header">
          <span class="panel-title">{{ t('tools.regex-tester.matchResults') }}</span>
        </div>

        <!-- 空状态（灰色，无警告感） -->
        <div v-if="isEmpty" class="state-empty">
          <icon-mdi-regex class="state-icon" />
          <span>{{ t('tools.regex-tester.emptyHint') }}</span>
        </div>

        <!-- 正则有错误 -->
        <div v-else-if="regexError" class="state-error">
          <icon-mdi-alert-circle-outline class="state-icon" />
          <span>{{ t('tools.regex-tester.syntaxError') }}</span>
        </div>

        <!-- 无匹配（灰色中性） -->
        <div v-else-if="!hasMatch" class="state-empty">
          <icon-mdi-text-search class="state-icon" />
          <span>{{ t('tools.regex-tester.noMatch') }}</span>
        </div>

        <!-- 匹配列表 -->
        <div v-else class="match-list">
          <div
            v-for="(match, idx) in results"
            :key="match.index"
            class="match-item"
            :style="{ '--hi-color': highlightColors[idx % 2] }"
          >
            <div class="match-header">
              <span class="match-num">#{{ idx + 1 }}</span>
              <code class="match-value">{{ match.value }}</code>
              <span class="match-pos">{{ t('tools.regex-tester.position') }} {{ match.index }} – {{ match.index + match.value.length }}</span>
            </div>
            <div v-if="match.captures.length || match.groups.length" class="match-details">
              <template v-if="match.captures.length">
                <div v-for="cap in match.captures" :key="cap.name" class="detail-row">
                  <span class="detail-key">{{ t('tools.regex-tester.captureGroup') }} {{ cap.name }}</span>
                  <code class="detail-val">{{ cap.value ?? t('tools.regex-tester.undefined') }}</code>
                  <span class="detail-range">[{{ cap.start }} – {{ cap.end }}]</span>
                </div>
              </template>
              <template v-if="match.groups.length">
                <div v-for="grp in match.groups" :key="grp.name" class="detail-row">
                  <span class="detail-key">{{ t('tools.regex-tester.namedGroup') }} "{{ grp.name }}"</span>
                  <code class="detail-val">{{ grp.value ?? t('tools.regex-tester.undefined') }}</code>
                  <span class="detail-range">[{{ grp.start }} – {{ grp.end }}]</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 底部辅助卡片 ──────────────────────────────────── -->
    <div class="aux-grid">
      <c-card v-if="sample" :title="t('tools.regex-tester.sampleText')">
        <pre class="aux-pre">{{ sample }}</pre>
      </c-card>
      <c-card :title="t('tools.regex-tester.visualization')" style="overflow-x:auto;">
        <shadow-root ref="visualizerSVG">&#xa0;</shadow-root>
      </c-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.rt-root {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ─── 正则输入行 ──────────────────────────────────────────────── */
.regex-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.12);
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }

  &--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.12);
    &:focus-within {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
    }
    &.regex-row--error {
      border-color: #f87171 !important;
    }
  }
}

.regex-slash {
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
  font-family: monospace;
  user-select: none;
  .dark & { color: #818cf8; }
}

.regex-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 15px;
  color: #1e293b;
  min-width: 0;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.25); font-style: italic; }
}

/* ─── 修饰符 Chips ───────────────────────────────────────────── */
.flag-chips {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.flag-chip {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1.5px solid rgba(0,0,0,0.12);
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover { background: rgba(99,102,241,0.06); border-color: #6366f1; color: #6366f1; }

  &--on {
    background: rgba(99,102,241,0.12);
    border-color: #6366f1;
    color: #6366f1;
  }

  .dark & {
    border-color: rgba(255,255,255,0.12);
    color: #94a3b8;
    &--on { background: rgba(129,140,248,0.18); border-color: #818cf8; color: #a5b4fc; }
    &:hover { color: #a5b4fc; border-color: #818cf8; }
  }
}

.memo-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: inherit;
  opacity: 0.4;
  transition: opacity 0.15s;
  font-size: 16px;
  &:hover { opacity: 1; }
}

/* ─── 错误横幅 ───────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  .dark & { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); }
}
.error-icon { flex-shrink: 0; font-size: 15px; }

/* ─── 主体双列 ───────────────────────────────────────────────── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
}

/* ─── 面板通用 ───────────────────────────────────────────────── */
.panel {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: #fff;
  overflow: hidden;

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.1);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  min-height: 36px;

  .dark & { border-color: rgba(255,255,255,0.07); }
}

.panel-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  flex: 1;
  .dark & { color: #718096; }
}

.match-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(99,102,241,0.1);
  color: #6366f1;
  .dark & { background: rgba(129,140,248,0.15); color: #a5b4fc; }
}

.panel-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.35;
  border-radius: 4px;
  color: inherit;
  font-size: 14px;
  &:hover { opacity: 0.85; background: rgba(0,0,0,0.05); }
  .dark &:hover { background: rgba(255,255,255,0.06); }
}

/* ─── 高亮编辑器 ─────────────────────────────────────────────── */
.editor-wrap {
  position: relative;
  flex: 1;
  min-height: 220px;
}

.highlight-layer,
.editor-textarea {
  position: absolute;
  inset: 0;
  padding: 12px 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
}

.highlight-layer {
  pointer-events: none;
  color: transparent;
  background: transparent;
  z-index: 0;

  :deep(mark) {
    color: transparent;
  }
}

.editor-textarea {
  z-index: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #1e293b;
  caret-color: #6366f1;
  width: 100%;
  height: 100%;

  .dark & { color: #e2e8f0; }

  &::placeholder {
    color: rgba(0,0,0,0.25);
    font-style: italic;
    .dark & { color: rgba(255,255,255,0.2); }
  }

  &::-webkit-scrollbar { width: 5px; height: 5px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,0.2);
    border-radius: 3px;
  }
}

/* ─── 状态空页 ───────────────────────────────────────────────── */
.state-empty,
.state-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 20px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  .dark & { color: #4b5563; }
}
.state-error {
  color: #ef4444;
  .dark & { color: #f87171; }
}
.state-icon { font-size: 28px; opacity: 0.5; }

/* ─── 匹配结果列表 ───────────────────────────────────────────── */
.match-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 460px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 3px; }
}

.match-item {
  border-radius: 7px;
  background: var(--hi-color, rgba(99,102,241,0.08));
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
  .dark & { border-color: rgba(255,255,255,0.05); }
}

.match-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  flex-wrap: wrap;
}
.match-num {
  font-size: 11px;
  font-weight: 700;
  color: #6366f1;
  .dark & { color: #a5b4fc; }
}
.match-value {
  flex: 1;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-all;
  color: #1e293b;
  .dark & { color: #e2e8f0; }
}
.match-pos {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  .dark & { color: #6b7280; }
}

.match-details {
  border-top: 1px solid rgba(0,0,0,0.06);
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  .dark & { border-color: rgba(255,255,255,0.06); }
}
.detail-row {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex-wrap: wrap;
}
.detail-key {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  .dark & { color: #6b7280; }
}
.detail-val {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #334155;
  .dark & { color: #cbd5e1; }
}
.detail-range {
  font-size: 11px;
  color: #94a3b8;
  .dark & { color: #4b5563; }
}

/* ─── 底部辅助卡片 ───────────────────────────────────────────── */
.aux-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.aux-pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #1e293b;
  .dark & { color: #e2e8f0; }
}

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
