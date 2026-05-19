<script setup lang="ts">
import { evaluate } from 'mathjs';
import { refDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';
import { useStorage } from '@vueuse/core';

// ── 输入 ──────────────────────────────────────────────────────
const expression = ref('');
const debouncedExpr = refDebounced(expression, 120);

// 历史记录（最近 8 条，LocalStorage 持久化）
const history = useStorage<string[]>('math-evaluator:history', []);

// ── 计算逻辑 ──────────────────────────────────────────────────
interface CalcState {
  value: string
  isError: boolean
  isEmpty: boolean
}

const calcState = computed((): CalcState => {
  const expr = debouncedExpr.value.trim();
  if (!expr) return { value: '', isError: false, isEmpty: true };

  try {
    const raw = evaluate(expr);
    if (raw === undefined || raw === null) return { value: '', isError: false, isEmpty: true };
    const val = typeof raw === 'function' ? '函数已定义' : String(raw);
    return { value: val, isError: false, isEmpty: false };
  }
  catch (e: any) {
    const msg: string = e?.message ?? '无效的表达式';
    return { value: msg, isError: true, isEmpty: false };
  }
});

// 记录历史（结果合法时）
watch(calcState, (state) => {
  const expr = expression.value.trim();
  if (!state.isError && !state.isEmpty && expr) {
    const entry = `${expr} = ${state.value}`;
    if (history.value[0] !== entry) {
      history.value = [entry, ...history.value].slice(0, 8);
    }
  }
});

// ── 快捷函数面板 ─────────────────────────────────────────────
const SNIPPETS = [
  'sqrt()', 'abs()', 'sin()', 'cos()', 'tan()',
  'log()', 'log2()', 'exp()', 'pi', 'e',
];

function insertSnippet(s: string) {
  const needsParen = s.endsWith(')');
  expression.value += needsParen ? s.slice(0, -1) + ')' : s;
  // focus
  nextTick(() => inputRef.value?.focus());
}

const inputRef = ref<HTMLInputElement | null>(null);

// ── 历史记录展开 ──────────────────────────────────────────────
const showHistory = ref(false);

function applyHistory(entry: string) {
  // entry 形如 "2+3 = 5"，取 = 左侧的表达式
  const expr = entry.split(' = ')[0];
  expression.value = expr;
  showHistory.value = false;
  nextTick(() => inputRef.value?.focus());
}

// ── 复制结果 ──────────────────────────────────────────────────
const resultText = computed(() =>
  !calcState.value.isError && !calcState.value.isEmpty ? calcState.value.value : '',
);
const { copy, isJustCopied } = useCopy({ source: resultText, text: '计算结果已复制' });
</script>

<template>
  <div class="me-root">
    <!-- ── 输入区 ──────────────────────────────────────────── -->
    <div class="input-section">
      <div class="input-wrap" :class="{ 'input-wrap--error': calcState.isError }">
        <span class="input-equals">=</span>
        <input
          ref="inputRef"
          v-model="expression"
          class="expr-input"
          placeholder="输入数学表达式，例如：2 * sqrt(9) + abs(-5)"
          spellcheck="false"
          autocomplete="off"
          autofocus
          @keydown.enter.prevent="() => {}"
        />
        <button
          v-if="expression"
          class="clear-btn"
          title="清空"
          @click="expression = ''"
        >
          <icon-mdi-close />
        </button>
        <!-- 历史记录按钮 -->
        <button
          v-if="history.length"
          class="history-btn"
          :class="{ 'history-btn--active': showHistory }"
          title="计算历史"
          @click="showHistory = !showHistory"
        >
          <icon-mdi-history />
        </button>
      </div>

      <!-- 历史记录下拉 -->
      <transition name="slide-down">
        <div v-if="showHistory && history.length" class="history-panel">
          <div class="history-title">
            最近计算
            <button class="history-clear" @click="history = []">
              清除记录
            </button>
          </div>
          <div
            v-for="(entry, i) in history"
            :key="i"
            class="history-item"
            @click="applyHistory(entry)"
          >
            <code>{{ entry }}</code>
          </div>
        </div>
      </transition>
    </div>

    <!-- ── 快捷函数 Chips ─────────────────────────────────── -->
    <div class="snippet-row">
      <button
        v-for="s in SNIPPETS"
        :key="s"
        class="snippet-chip"
        @click="insertSnippet(s)"
      >
        {{ s }}
      </button>
    </div>

    <!-- ── 结果区 ───────────────────────────────────────────── -->
    <transition name="result-pop" mode="out-in">
      <!-- 有结果 -->
      <div
        v-if="!calcState.isEmpty && !calcState.isError"
        key="result"
        class="result-card"
      >
        <div class="result-header">
          <span class="result-label">计算结果</span>
          <button
            class="copy-btn"
            :class="{ 'copy-btn--copied': isJustCopied }"
            title="复制结果"
            @click="copy()"
          >
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="isJustCopied" key="check" />
              <icon-mdi-content-copy v-else key="copy" />
            </transition>
            {{ isJustCopied ? '已复制' : '复制' }}
          </button>
        </div>
        <div class="result-value">
          {{ calcState.value }}
        </div>
        <div class="result-expr">
          {{ expression.trim() }}
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="calcState.isError" key="error" class="error-card">
        <icon-mdi-alert-circle-outline class="error-icon" />
        <div>
          <p class="error-title">表达式语法错误</p>
          <p class="error-detail">
            {{ calcState.value }}
          </p>
        </div>
      </div>

      <!-- 空状态（首次加载或已清空） -->
      <div v-else key="empty" class="empty-hint">
        <icon-mdi-calculator-variant-outline class="empty-icon" />
        <span>输入表达式后，结果将实时显示</span>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.me-root {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ─── 输入区 ─────────────────────────────────────────────────── */
.input-section {
  position: relative;
}

.input-wrap {
  display: flex;
  align-items: center;
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
    box-shadow: 0 0 0 3px rgba(239,68,68,0.09) !important;
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.12);
    &:focus-within { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.12); }
    &.input-wrap--error { border-color: #f87171 !important; }
  }
}

.input-equals {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
  padding: 0 4px 0 14px;
  font-family: monospace;
  user-select: none;
  .dark & { color: #818cf8; }
}

.expr-input {
  flex: 1;
  padding: 13px 8px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 15px;
  color: #1e293b;
  min-width: 0;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.28); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.clear-btn, .history-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;
  font-size: 15px;
  flex-shrink: 0;
  color: #94a3b8;
  transition: all 0.14s;
}
.clear-btn {
  &:hover { color: #ef4444; background: rgba(239,68,68,0.07); }
}
.history-btn {
  margin-right: 6px;
  &:hover { color: #6366f1; background: rgba(99,102,241,0.07); }
  &--active { color: #6366f1; background: rgba(99,102,241,0.1); }
  .dark &--active { color: #a5b4fc; }
}

/* ─── 历史面板 ───────────────────────────────────────────────── */
.history-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  border-radius: 9px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: #fff;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
}

.history-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  .dark & { border-color: rgba(255,255,255,0.06); }
}

.history-clear {
  font-size: 11px;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  padding: 1px 6px;
  border-radius: 4px;
  &:hover { background: rgba(239,68,68,0.07); }
}

.history-item {
  padding: 8px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(99,102,241,0.05); .dark & { background: rgba(129,140,248,0.07); } }

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    color: #475569;
    .dark & { color: #94a3b8; }
  }
  .dark & { border-color: rgba(255,255,255,0.04); }
}

/* ─── 快捷函数 Chips ─────────────────────────────────────────── */
.snippet-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.snippet-chip {
  padding: 3px 10px;
  border-radius: 5px;
  border: 1px solid rgba(0,0,0,0.09);
  background: rgba(0,0,0,0.02);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #4338ca;
  cursor: pointer;
  transition: all 0.13s;

  &:hover {
    background: rgba(99,102,241,0.08);
    border-color: rgba(99,102,241,0.25);
    color: #6366f1;
  }

  .dark & {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.08);
    color: #a5b4fc;
    &:hover { background: rgba(129,140,248,0.1); border-color: rgba(129,140,248,0.3); }
  }
}

/* ─── 结果卡片 ───────────────────────────────────────────────── */
.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(99,102,241,0.2);
  background: #fff;
  overflow: hidden;
  .dark & { background: #0f1117; border-color: rgba(129,140,248,0.2); }
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 14px;
  background: rgba(99,102,241,0.04);
  border-bottom: 1px solid rgba(99,102,241,0.1);
  .dark & { background: rgba(129,140,248,0.05); border-color: rgba(129,140,248,0.12); }
}

.result-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6366f1;
  .dark & { color: #818cf8; }
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.14s;

  &:hover { background: #4f46e5; }
  &--copied { background: #22c55e !important; }

  .dark & { background: #818cf8; color: #1e1b4b; }
  .dark &:hover { background: #6366f1; color: #fff; }
  .dark &.copy-btn--copied { background: #4ade80 !important; color: #052e16 !important; }
}

.result-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  padding: 18px 18px 6px;
  word-break: break-all;
  .dark & { color: #f1f5f9; }
}

.result-expr {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #94a3b8;
  padding: 0 18px 14px;
  word-break: break-all;
  .dark & { color: #4b5563; }
}

/* ─── 错误卡片 ───────────────────────────────────────────────── */
.error-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(239,68,68,0.2);
  background: rgba(239,68,68,0.04);
  .dark & { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.22); }
}

.error-icon {
  font-size: 20px;
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 1px;
  .dark & { color: #f87171; }
}

.error-title {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
  margin: 0 0 3px 0;
  .dark & { color: #f87171; }
}

.error-detail {
  font-size: 12.5px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #b91c1c;
  margin: 0;
  word-break: break-word;
  .dark & { color: #fca5a5; }
}

/* ─── 空状态 ─────────────────────────────────────────────────── */
.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 20px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  .dark & { color: #4b5563; }
}
.empty-icon { font-size: 30px; opacity: 0.45; }

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }

.result-pop-enter-active { transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
.result-pop-leave-active { transition: all 0.15s ease; }
.result-pop-enter-from { opacity: 0; transform: scale(0.96) translateY(6px); }
.result-pop-leave-to { opacity: 0; transform: scale(0.98); }

.icon-fade-enter-active, .icon-fade-leave-active { transition: opacity 0.12s; }
.icon-fade-enter-from, .icon-fade-leave-to { opacity: 0; }
</style>
