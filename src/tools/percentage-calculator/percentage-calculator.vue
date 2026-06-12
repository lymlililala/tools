<script setup lang="ts">
import { computed, ref } from 'vue';

const { t } = useI18n();

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
/** 格式化数字结果，最多保留 8 位有效小数；超大数用科学计数法 */
function formatResult(n: number): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    return '';
  }
  // 科学计数法阈值
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toPrecision(6);
  }
  // 保留最多 8 位小数，去除尾零
  return Number.parseFloat(n.toFixed(8)).toString();
}

/** 解析输入字符串为数字，返回 null 表示无效 */
function parseNum(v: string): number | null {
  if (v === '' || v === null || v === undefined) {
    return null;
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// ─── 卡片 1：X 的 Y% 是多少 ─────────────────────────────────────────────────
const pctX = ref('');
const pctY = ref('');
const pctXNum = computed(() => parseNum(pctX.value));
const pctYNum = computed(() => parseNum(pctY.value));

const pctResult = computed(() => {
  if (pctXNum.value === null || pctYNum.value === null) {
    return '';
  }
  return formatResult((pctYNum.value / 100) * pctXNum.value);
});

// ─── 卡片 2：X 是 Y 的百分之多少 ────────────────────────────────────────────
const numX = ref('');
const numY = ref('');
const numXNum = computed(() => parseNum(numX.value));
const numYNum = computed(() => parseNum(numY.value));

const numResult = computed(() => {
  if (numXNum.value === null || numYNum.value === null) {
    return '';
  }
  if (numYNum.value === 0) {
    return '';
  }
  return formatResult((numXNum.value / numYNum.value) * 100);
});

const numYIsZero = computed(() => numYNum.value !== null && numYNum.value === 0);

// ─── 卡片 3：从 From 到 To 的百分比变化 ─────────────────────────────────────
const numFrom = ref('');
const numTo = ref('');
const numFromNum = computed(() => parseNum(numFrom.value));
const numToNum = computed(() => parseNum(numTo.value));

const changeResult = computed(() => {
  if (numFromNum.value === null || numToNum.value === null) {
    return '';
  }
  if (numFromNum.value === 0) {
    return '';
  }
  return formatResult(((numToNum.value - numFromNum.value) / numFromNum.value) * 100);
});

const fromIsZero = computed(() => numFromNum.value !== null && numFromNum.value === 0);

// ─── 复制逻辑 ─────────────────────────────────────────────────────────────────
const copiedKey = ref<string | null>(null);
function copyValue(key: string, val: string) {
  if (!val) {
    return;
  }
  navigator.clipboard.writeText(val).then(() => {
    copiedKey.value = key;
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null;
      }
    }, 2000);
  });
}
</script>

<template>
  <div class="pc-root">
    <!-- ─── 卡片 1 ───────────────────────────────────────────── -->
    <div class="pc-card">
      <div class="card-title">
        <span class="card-num">1</span>
        <span>{{ t('tools.percentage-calculator.card1Title') }}</span>
      </div>
      <div class="formula-row">
        <div class="formula-item formula-item--wide">
          <label class="fi-label">{{ t('tools.percentage-calculator.value') }}</label>
          <input
            v-model="pctY"
            class="fi-input"
            type="number"
            placeholder="Y"
            data-test-id="percentageY"
          >
        </div>
        <span class="formula-op">{{ t('tools.percentage-calculator.of') }}</span>
        <div class="formula-item">
          <label class="fi-label">{{ t('tools.percentage-calculator.percent') }}</label>
          <input
            v-model="pctX"
            class="fi-input"
            type="number"
            placeholder="X"
            data-test-id="percentageX"
          >
        </div>
        <span class="formula-op">%&nbsp;=</span>
        <div class="formula-item formula-item--result">
          <label class="fi-label">{{ t('tools.percentage-calculator.result') }}</label>
          <div class="result-wrap" :class="{ 'result-wrap--filled': !!pctResult }">
            <span class="result-text">{{ pctResult || '—' }}</span>
            <button
              v-if="pctResult"
              class="copy-btn"
              :class="{ 'copy-btn--copied': copiedKey === 'pct' }"
              :title="copiedKey === 'pct' ? t('tools.percentage-calculator.copied') : t('tools.percentage-calculator.copyResult')"
              @click="copyValue('pct', pctResult)"
            >
              <icon-mdi-check v-if="copiedKey === 'pct'" />
              <icon-mdi-content-copy v-else />
            </button>
          </div>
        </div>
      </div>
      <div class="formula-desc">
        {{ t('tools.percentage-calculator.formula1') }}: <em>result = Y × X ÷ 100</em>
      </div>
    </div>

    <!-- ─── 卡片 2 ───────────────────────────────────────────── -->
    <div class="pc-card">
      <div class="card-title">
        <span class="card-num">2</span>
        <span>{{ t('tools.percentage-calculator.card2Title') }}</span>
      </div>
      <div class="formula-row">
        <div class="formula-item formula-item--wide">
          <label class="fi-label">{{ t('tools.percentage-calculator.numerator') }}</label>
          <input
            v-model="numX"
            class="fi-input"
            type="number"
            placeholder="X"
            data-test-id="numberX"
          >
        </div>
        <span class="formula-op">÷</span>
        <div class="formula-item formula-item--wide">
          <label class="fi-label">{{ t('tools.percentage-calculator.denominator') }}</label>
          <input
            v-model="numY"
            class="fi-input"
            :class="{ 'fi-input--error': numYIsZero }"
            type="number"
            placeholder="Y"
            data-test-id="numberY"
          >
        </div>
        <span class="formula-op">× 100 =</span>
        <div class="formula-item formula-item--result">
          <label class="fi-label">{{ t('tools.percentage-calculator.resultPct') }}</label>
          <div class="result-wrap" :class="{ 'result-wrap--filled': !!numResult }">
            <span class="result-text">{{ numResult ? `${numResult}%` : '—' }}</span>
            <button
              v-if="numResult"
              class="copy-btn"
              :class="{ 'copy-btn--copied': copiedKey === 'num' }"
              :title="copiedKey === 'num' ? t('tools.percentage-calculator.copied') : t('tools.percentage-calculator.copyResult')"
              @click="copyValue('num', `${numResult}%`)"
            >
              <icon-mdi-check v-if="copiedKey === 'num'" />
              <icon-mdi-content-copy v-else />
            </button>
          </div>
        </div>
      </div>
      <transition name="slide-down">
        <div v-if="numYIsZero" class="error-hint">
          <icon-mdi-alert-circle-outline />
          {{ t('tools.percentage-calculator.zeroDenominator') }}
        </div>
      </transition>
      <div class="formula-desc">
        {{ t('tools.percentage-calculator.formula2') }}: <em>result = X ÷ Y × 100%</em>
      </div>
    </div>

    <!-- ─── 卡片 3 ───────────────────────────────────────────── -->
    <div class="pc-card">
      <div class="card-title">
        <span class="card-num">3</span>
        <span>{{ t('tools.percentage-calculator.card3Title') }}</span>
      </div>
      <div class="formula-row">
        <div class="formula-item formula-item--wide">
          <label class="fi-label">{{ t('tools.percentage-calculator.from') }}</label>
          <input
            v-model="numFrom"
            class="fi-input"
            :class="{ 'fi-input--error': fromIsZero }"
            type="number"
            placeholder="From"
            data-test-id="numberFrom"
          >
        </div>
        <span class="formula-op">→</span>
        <div class="formula-item formula-item--wide">
          <label class="fi-label">{{ t('tools.percentage-calculator.to') }}</label>
          <input
            v-model="numTo"
            class="fi-input"
            type="number"
            placeholder="To"
            data-test-id="numberTo"
          >
        </div>
        <span class="formula-op">=</span>
        <div class="formula-item formula-item--result">
          <label class="fi-label">{{ t('tools.percentage-calculator.change') }}</label>
          <div
            class="result-wrap"
            :class="{
              'result-wrap--filled': !!changeResult,
              'result-wrap--positive': !!changeResult && parseFloat(changeResult) > 0,
              'result-wrap--negative': !!changeResult && parseFloat(changeResult) < 0,
            }"
          >
            <span class="result-text">
              <template v-if="changeResult">
                {{ parseFloat(changeResult) > 0 ? '+' : '' }}{{ changeResult }}%
              </template>
              <template v-else>—</template>
            </span>
            <button
              v-if="changeResult"
              class="copy-btn"
              :class="{ 'copy-btn--copied': copiedKey === 'chg' }"
              :title="copiedKey === 'chg' ? t('tools.percentage-calculator.copied') : t('tools.percentage-calculator.copyResult')"
              @click="copyValue('chg', `${parseFloat(changeResult) > 0 ? '+' : ''}${changeResult}%`)"
            >
              <icon-mdi-check v-if="copiedKey === 'chg'" />
              <icon-mdi-content-copy v-else />
            </button>
          </div>
        </div>
      </div>
      <transition name="slide-down">
        <div v-if="fromIsZero" class="error-hint">
          <icon-mdi-alert-circle-outline />
          {{ t('tools.percentage-calculator.zeroFrom') }}
        </div>
      </transition>
      <div class="formula-desc">
        {{ t('tools.percentage-calculator.formula3') }}: <em>change = (To − From) ÷ From × 100%</em>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 根容器 ─────────────────────────────────── */
.pc-root {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 780px;
  margin: 0 auto;
  padding: 4px 0 24px;
}

/* ── 卡片 ───────────────────────────────────── */
.pc-card {
  background: var(--c-bg, #fff);
  border: 1px solid var(--c-border, rgba(0,0,0,.08));
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  transition: box-shadow 0.2s;
}
.pc-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,.1);
}

/* ── 卡片标题 ───────────────────────────────── */
.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-1, #1a1a1a);
  margin-bottom: 16px;
}
.card-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary-color, #7c3aed);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── 公式行 ─────────────────────────────────── */
.formula-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.formula-op {
  font-size: 18px;
  font-weight: 500;
  color: var(--c-text-2, #555);
  padding-bottom: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── 输入项 ─────────────────────────────────── */
.formula-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 80px;
  min-width: 80px;
}
.formula-item--wide {
  flex: 1.4 1 100px;
  min-width: 100px;
}
.formula-item--result {
  flex: 1.6 1 120px;
  min-width: 120px;
}

.fi-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-3, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
}

.fi-input {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid var(--c-border, rgba(0,0,0,.15));
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Fira Code', 'Consolas', monospace;
  background: var(--c-bg, #fff);
  color: var(--c-text-1, #1a1a1a);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  /* 隐藏 number 步进箭头 */
  -moz-appearance: textfield;
  appearance: textfield;
}
.fi-input::-webkit-outer-spin-button,
.fi-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.fi-input:focus {
  border-color: var(--primary-color, #7c3aed);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #7c3aed) 15%, transparent);
}
.fi-input--error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239,68,68,.15) !important;
}

/* ── 结果区 ─────────────────────────────────── */
.result-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  border: 1.5px dashed var(--c-border, rgba(0,0,0,.15));
  border-radius: 8px;
  background: var(--c-bg-2, rgba(0,0,0,.025));
  transition: background 0.2s, border-color 0.2s;
}
.result-wrap--filled {
  border-style: solid;
  border-color: var(--primary-color, #7c3aed);
  background: color-mix(in srgb, var(--primary-color, #7c3aed) 6%, transparent);
}
.result-wrap--positive {
  border-color: #16a34a;
  background: rgba(22,163,74,.07);
}
.result-wrap--negative {
  border-color: #dc2626;
  background: rgba(220,38,38,.07);
}

.result-text {
  font-size: 16px;
  font-weight: 700;
  font-family: 'Fira Code', 'Consolas', monospace;
  color: var(--c-text-1, #1a1a1a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result-wrap--filled .result-text {
  color: var(--primary-color, #7c3aed);
}
.result-wrap--positive .result-text { color: #16a34a; }
.result-wrap--negative .result-text { color: #dc2626; }

/* ── 复制按钮 ───────────────────────────────── */
.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--c-text-3, #888);
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}
.copy-btn:hover { color: var(--primary-color, #7c3aed); background: rgba(0,0,0,.05); }
.copy-btn--copied { color: #16a34a !important; }

/* ── 错误提示 ───────────────────────────────── */
.error-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 7px;
  background: rgba(239,68,68,.08);
  color: #dc2626;
  font-size: 13px;
}

/* ── 公式说明 ───────────────────────────────── */
.formula-desc {
  margin-top: 12px;
  font-size: 12px;
  color: var(--c-text-3, #999);
}
.formula-desc em {
  font-style: normal;
  font-family: 'Fira Code', 'Consolas', monospace;
  color: var(--c-text-2, #666);
}

/* ── 过渡动画 ───────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── 响应式：移动端垂直堆叠 ─────────────────── */
@media (max-width: 600px) {
  .pc-card {
    padding: 16px;
  }
  .formula-row {
    gap: 8px;
  }
  .formula-item,
  .formula-item--wide,
  .formula-item--result {
    flex: 1 1 100%;
    min-width: 0;
  }
  .formula-op {
    padding-bottom: 0;
    font-size: 15px;
    align-self: center;
  }
  .result-wrap {
    height: 42px;
  }
}

/* ── 深色模式适配 ────────────────────────────── */
@media (prefers-color-scheme: dark) {
  .pc-card {
    background: var(--c-bg, #1e1e1e);
    border-color: var(--c-border, rgba(255,255,255,.1));
  }
  .fi-input {
    background: var(--c-bg-2, #2a2a2a);
    color: var(--c-text-1, #e8e8e8);
    border-color: rgba(255,255,255,.2);
  }
  .result-wrap {
    background: var(--c-bg-2, rgba(255,255,255,.04));
  }
}
</style>
