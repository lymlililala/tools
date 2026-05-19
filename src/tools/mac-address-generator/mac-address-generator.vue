<script setup lang="ts">
import _ from 'lodash';
import { generateRandomMacAddress } from './mac-adress-generator.models';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { usePartialMacAddressValidation } from '@/utils/macAddress';

// ── 配置 ──────────────────────────────────────────────────────
const amount = useStorage('mac-address-generator-amount', 1);
const macAddressPrefix = useStorage('mac-address-generator-prefix', '64:16:7F');
const prefixValidation = usePartialMacAddressValidation(macAddressPrefix);

// 大小写
const caseOptions = [
  { label: '大写', key: 'upper', fn: (v: string) => v.toUpperCase() },
  { label: '小写', key: 'lower', fn: (v: string) => v.toLowerCase() },
] as const;
const selectedCase = useStorage<'upper' | 'lower'>('mac-address-generator-case', 'upper');
const caseTransformer = computed(() => caseOptions.find(o => o.key === selectedCase.value)!.fn);

// 分隔符
const separators = [
  { label: ':', value: ':' },
  { label: '-', value: '-' },
  { label: '.', value: '.' },
  { label: '无', value: '' },
];
const separator = useStorage('mac-address-generator-separator', ':');

// ── 生成 ──────────────────────────────────────────────────────
const [macAddresses, refreshMacAddresses] = computedRefreshable(() => {
  if (!prefixValidation.isValid) return '';
  const safeAmount = Math.min(Math.max(1, amount.value), 100);
  return _.times(safeAmount, () =>
    caseTransformer.value(generateRandomMacAddress({
      prefix: macAddressPrefix.value,
      separator: separator.value,
    })),
  ).join('\n');
});

// ── 复制 ──────────────────────────────────────────────────────
const { copy, isJustCopied } = useCopy({ source: macAddresses, text: 'MAC 地址已复制到剪贴板' });

// ── 数量控制 ──────────────────────────────────────────────────
const MIN = 1;
const MAX = 100;
function decAmount() { if (amount.value > MIN) amount.value--; }
function incAmount() { if (amount.value < MAX) amount.value++; }
function onAmountInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) amount.value = Math.min(MAX, Math.max(MIN, Math.floor(v)));
}
</script>

<template>
  <div class="mag-root">
    <!-- ── 配置区 ──────────────────────────────────────────── -->
    <div class="config-card">
      <!-- 数量 -->
      <div class="config-row">
        <span class="config-label">数量</span>
        <div class="qty-wrap">
          <button class="qty-btn" :disabled="amount <= MIN" @click="decAmount">
            <icon-mdi-minus />
          </button>
          <input
            class="qty-input"
            type="number"
            :value="amount"
            :min="MIN"
            :max="MAX"
            @change="onAmountInput"
          />
          <button class="qty-btn" :disabled="amount >= MAX" @click="incAmount">
            <icon-mdi-plus />
          </button>
        </div>
        <span class="config-hint">1 – 100</span>
      </div>

      <!-- 前缀 -->
      <div class="config-row">
        <span class="config-label">OUI 前缀</span>
        <div
          class="prefix-wrap"
          :class="{ 'prefix-wrap--error': prefixValidation.status === 'error' }"
        >
          <input
            v-model="macAddressPrefix"
            class="prefix-input"
            placeholder="可选，如 64:16:7F"
            spellcheck="false"
            autocomplete="off"
          />
          <button
            v-if="macAddressPrefix"
            class="prefix-clear"
            title="清空前缀"
            @click="macAddressPrefix = ''"
          >
            <icon-mdi-close />
          </button>
        </div>
        <transition name="slide-down">
          <span v-if="prefixValidation.status === 'error'" class="config-error">
            {{ prefixValidation.message }}
          </span>
        </transition>
      </div>

      <!-- 大小写 -->
      <div class="config-row">
        <span class="config-label">大小写</span>
        <div class="toggle-group">
          <button
            v-for="opt in caseOptions"
            :key="opt.key"
            class="toggle-btn"
            :class="{ 'toggle-btn--on': selectedCase === opt.key }"
            @click="selectedCase = opt.key"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 分隔符 -->
      <div class="config-row">
        <span class="config-label">分隔符</span>
        <div class="toggle-group">
          <button
            v-for="sep in separators"
            :key="sep.value"
            class="toggle-btn"
            :class="{ 'toggle-btn--on': separator === sep.value }"
            @click="separator = sep.value"
          >
            {{ sep.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── 结果区 ───────────────────────────────────────────── -->
    <div class="result-wrap" data-test-id="ulids">
      <textarea
        class="result-textarea"
        :value="macAddresses || ''"
        :rows="Math.min(Math.max(amount, 1), 12)"
        readonly
        spellcheck="false"
        placeholder="生成的 MAC 地址将显示在这里..."
      />
    </div>

    <!-- ── 操作按钮 ────────────────────────────────────────── -->
    <div class="btn-row">
      <button class="btn btn--primary" data-test-id="refresh" @click="refreshMacAddresses()">
        <icon-mdi-refresh class="btn-icon" />
        重新生成
      </button>
      <button
        class="btn"
        :class="{ 'btn--copied': isJustCopied }"
        :disabled="!macAddresses"
        @click="copy()"
      >
        <transition name="icon-fade" mode="out-in">
          <icon-mdi-check v-if="isJustCopied" key="check" class="btn-icon" />
          <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
        </transition>
        {{ isJustCopied ? '已复制！' : '复制全部' }}
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.mag-root {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ─── 配置卡 ─────────────────────────────────────────────────── */
.config-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: #fff;
  padding: 4px 0;
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }
}

.config-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  flex-wrap: wrap;

  &:last-child { border-bottom: none; }
  .dark & { border-color: rgba(255,255,255,0.05); }
}

.config-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  width: 60px;
  flex-shrink: 0;
  .dark & { color: #94a3b8; }
}

.config-hint {
  font-size: 11px;
  color: #94a3b8;
  .dark & { color: #6b7280; }
}

.config-error {
  font-size: 11.5px;
  color: #ef4444;
  width: 100%;
  padding-left: 70px;
  .dark & { color: #f87171; }
}

/* ─── 数量步进器 ─────────────────────────────────────────────── */
.qty-wrap {
  display: flex;
  align-items: center;
  border-radius: 7px;
  border: 1.5px solid rgba(0,0,0,0.1);
  overflow: hidden;
  .dark & { border-color: rgba(255,255,255,0.1); }
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0,0,0,0.03);
  color: #475569;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: rgba(99,102,241,0.08); color: #6366f1; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  .dark & { background: rgba(255,255,255,0.04); color: #94a3b8; }
  .dark &:hover:not(:disabled) { background: rgba(129,140,248,0.1); color: #a5b4fc; }
}

.qty-input {
  width: 52px;
  text-align: center;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  padding: 4px 0;
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  .dark & { color: #e2e8f0; }
}

/* ─── 前缀输入 ───────────────────────────────────────────────── */
.prefix-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 7px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 160px;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  &--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
  }
  .dark & { border-color: rgba(255,255,255,0.1); }
  .dark &:focus-within { border-color: #818cf8; }
  .dark &.prefix-wrap--error { border-color: #f87171 !important; }
}

.prefix-input {
  flex: 1;
  padding: 7px 10px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #1e293b;
  min-width: 0;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.28); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.prefix-clear {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  flex-shrink: 0;
  &:hover { color: #ef4444; background: rgba(239,68,68,0.06); }
}

/* ─── Toggle 按钮组 ─────────────────────────────────────────── */
.toggle-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 5px 14px;
  border-radius: 6px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(.toggle-btn--on) {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99,102,241,0.04);
  }

  &--on {
    background: #6366f1;
    border-color: #6366f1;
    color: #fff;
    font-weight: 600;
  }

  .dark & {
    border-color: rgba(255,255,255,0.1);
    color: #94a3b8;
  }
  .dark &:hover:not(.toggle-btn--on) { border-color: #818cf8; color: #a5b4fc; }
  .dark &.toggle-btn--on { background: #818cf8; border-color: #818cf8; color: #1e1b4b; }
}

/* ─── 结果区 ─────────────────────────────────────────────────── */
.result-wrap {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: #fff;
  overflow: hidden;
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }
}

.result-textarea {
  width: 100%;
  padding: 14px 16px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #1e293b;
  resize: none;
  display: block;
  min-height: 52px;

  .dark & { color: #e2e8f0; }

  &::placeholder { color: rgba(0,0,0,0.25); font-style: italic; .dark & { color: rgba(255,255,255,0.18); } }
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 3px; }
}

/* ─── 操作按钮行 ─────────────────────────────────────────────── */
.btn-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: transparent;
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99,102,241,0.05);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }

  &--primary {
    background: #6366f1;
    border-color: #6366f1;
    color: #fff;
    &:hover:not(:disabled) { background: #4f46e5; border-color: #4f46e5; color: #fff; }
    .dark & { background: #818cf8; border-color: #818cf8; color: #1e1b4b; }
    .dark &:hover:not(:disabled) { background: #6366f1; border-color: #6366f1; color: #fff; }
  }

  &--copied {
    border-color: #22c55e !important;
    color: #22c55e !important;
    background: rgba(34,197,94,0.06) !important;
  }

  .dark & { border-color: rgba(255,255,255,0.1); color: #94a3b8; }
  .dark &:hover:not(:disabled) { border-color: #818cf8; color: #a5b4fc; }
}

.btn-icon { font-size: 16px; }

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.icon-fade-enter-active, .icon-fade-leave-active { transition: opacity 0.12s; }
.icon-fade-enter-from, .icon-fade-leave-to { opacity: 0; }
</style>
