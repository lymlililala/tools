<script setup lang="ts">
import { isValidIpv4 } from '../ipv4-address-converter/ipv4-address-converter.service';
import type { Ipv4RangeExpanderResult } from './ipv4-range-expander.types';
import { calculateCidr } from './ipv4-range-expander.service';
import { useValidation } from '@/composable/validation';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const rawStartAddress = useStorage('ipv4-range-expander:startAddress', '192.168.1.1');
const rawEndAddress   = useStorage('ipv4-range-expander:endAddress',   '192.168.6.255');

const result = computed(() => calculateCidr({
  startIp: rawStartAddress.value,
  endIp: rawEndAddress.value,
}));

// ── 校验 ──────────────────────────────────────────────────────
const startIpValidation = useValidation({
  source: rawStartAddress,
  rules: [{ message: computed(() => t('tools.ipv4-range-expander.invalidIpv4')), validator: ip => isValidIpv4({ ip }) }],
});
const endIpValidation = useValidation({
  source: rawEndAddress,
  rules: [{ message: computed(() => t('tools.ipv4-range-expander.invalidIpv4')), validator: ip => isValidIpv4({ ip }) }],
});

const bothValid   = computed(() => startIpValidation.isValid && endIpValidation.isValid);
const orderError  = computed(() => bothValid.value && result.value === undefined);
const showResult  = computed(() => bothValid.value && result.value !== undefined);

// ── 结果行定义 ────────────────────────────────────────────────
interface CalcRow {
  labelKey: string
  getOldValue: (r: Ipv4RangeExpanderResult | undefined) => string
  getNewValue:  (r: Ipv4RangeExpanderResult | undefined) => string
  isCode?: boolean
  copyNew?: boolean
}

const rows: CalcRow[] = [
  {
    labelKey: 'tools.ipv4-range-expander.startAddress',
    getOldValue: () => rawStartAddress.value,
    getNewValue: r => r?.newStart ?? '',
    isCode: true,
  },
  {
    labelKey: 'tools.ipv4-range-expander.endAddress',
    getOldValue: () => rawEndAddress.value,
    getNewValue: r => r?.newEnd ?? '',
    isCode: true,
  },
  {
    labelKey: 'tools.ipv4-range-expander.addressCount',
    getOldValue: r => r?.oldSize?.toLocaleString() ?? '',
    getNewValue: r => r?.newSize?.toLocaleString() ?? '',
  },
  {
    labelKey: 'tools.ipv4-range-expander.cidr',
    getOldValue: () => '',
    getNewValue: r => r?.newCidr ?? '',
    isCode: true,
    copyNew: true,
  },
];

// ── 互换起止地址 ──────────────────────────────────────────────
function switchAddresses() {
  const tmp = rawStartAddress.value;
  rawStartAddress.value = rawEndAddress.value;
  rawEndAddress.value = tmp;
}

// ── 复制 CIDR ─────────────────────────────────────────────────
const cidrValue = computed(() => result.value?.newCidr ?? '');
const { copy: copyCidr, isJustCopied } = useCopy({
  source: cidrValue,
  text: computed(() => t('tools.ipv4-range-expander.cidrCopied')),
});
</script>

<template>
  <div class="re-root">
    <!-- ── 输入行 ──────────────────────────────────────────── -->
    <div class="input-row">
      <!-- 起始地址 -->
      <div class="input-group">
        <label class="input-label">{{ t('tools.ipv4-range-expander.startAddress') }}</label>
        <div class="input-wrap" :class="{ 'input-wrap--error': startIpValidation.status === 'error' }">
          <input
            v-model="rawStartAddress"
            class="ip-input"
            :placeholder="t('tools.ipv4-range-expander.startPlaceholder')"
            spellcheck="false"
            autocomplete="off"
            autofocus
          />
          <button
            v-if="rawStartAddress"
            class="clear-btn"
            :title="t('tools.ipv4-range-expander.clear')"
            @click="rawStartAddress = ''"
          >
            <icon-mdi-close />
          </button>
        </div>
        <transition name="slide-down">
          <span v-if="startIpValidation.status === 'error'" class="field-error">
            {{ startIpValidation.message }}
          </span>
        </transition>
      </div>

      <!-- 互换按钮 -->
      <div class="swap-col">
        <button class="swap-btn" :title="t('tools.ipv4-range-expander.swapAddresses')" @click="switchAddresses">
          <icon-mdi-swap-horizontal />
        </button>
      </div>

      <!-- 结束地址 -->
      <div class="input-group">
        <label class="input-label">{{ t('tools.ipv4-range-expander.endAddress') }}</label>
        <div class="input-wrap" :class="{ 'input-wrap--error': endIpValidation.status === 'error' }">
          <input
            v-model="rawEndAddress"
            class="ip-input"
            :placeholder="t('tools.ipv4-range-expander.endPlaceholder')"
            spellcheck="false"
            autocomplete="off"
          />
          <button
            v-if="rawEndAddress"
            class="clear-btn"
            :title="t('tools.ipv4-range-expander.clear')"
            @click="rawEndAddress = ''"
          >
            <icon-mdi-close />
          </button>
        </div>
        <transition name="slide-down">
          <span v-if="endIpValidation.status === 'error'" class="field-error">
            {{ endIpValidation.message }}
          </span>
        </transition>
      </div>
    </div>

    <!-- ── 顺序错误提示 ──────────────────────────────────── -->
    <transition name="slide-down">
      <div v-if="orderError" class="order-error">
        <icon-mdi-alert-circle-outline class="oe-icon" />
        <div class="oe-body">
          <p>{{ t('tools.ipv4-range-expander.orderError') }}</p>
          <button class="oe-swap-btn" @click="switchAddresses">
            <icon-mdi-swap-horizontal />
            {{ t('tools.ipv4-range-expander.swapAddresses') }}
          </button>
        </div>
      </div>
    </transition>

    <!-- ── 结果表格 ────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="showResult" class="result-card" data-test-id="result">
        <table class="re-table">
          <thead>
            <tr>
              <th class="th-label" />
              <th>{{ t('tools.ipv4-range-expander.inputRange') }}</th>
              <th>
                <span class="th-new-wrap">
                  {{ t('tools.ipv4-range-expander.expandedRange') }}
                  <c-tooltip :tooltip="t('tools.ipv4-range-expander.copyCidr')" position="top">
                    <button
                      class="copy-cidr-btn"
                      :class="{ 'copy-cidr-btn--copied': isJustCopied }"
                      @click="copyCidr()"
                    >
                      <icon-mdi-check v-if="isJustCopied" />
                      <icon-mdi-content-copy v-else />
                    </button>
                  </c-tooltip>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.labelKey"
              class="re-row"
            >
              <td class="td-label">
                {{ t(row.labelKey) }}
              </td>
              <td class="td-value">
                <code v-if="row.getOldValue(result) && row.isCode">{{ row.getOldValue(result) }}</code>
                <span v-else-if="row.getOldValue(result)">{{ row.getOldValue(result) }}</span>
                <span v-else class="td-empty">—</span>
              </td>
              <td class="td-value td-value--new">
                <code v-if="row.getNewValue(result) && row.isCode">{{ row.getNewValue(result) }}</code>
                <span v-else-if="row.getNewValue(result)">{{ row.getNewValue(result) }}</span>
                <span v-else class="td-empty">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.re-root {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ─── 输入行 ─────────────────────────────────────────────────── */
.input-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: start;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  .dark & { color: #94a3b8; }
}

.input-wrap {
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.12);
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  &--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.12);
    &:focus-within { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.12); }
    &.input-wrap--error { border-color: #f87171 !important; }
  }
}

.ip-input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13.5px;
  color: #1e293b;
  min-width: 0;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.28); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.clear-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 3px;
  &:hover { color: #ef4444; background: rgba(239,68,68,0.06); }
}

.field-error {
  font-size: 11.5px;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
  .dark & { color: #f87171; }
}

/* ─── 互换按钮 ───────────────────────────────────────────────── */
.swap-col {
  display: flex;
  align-items: center;
  padding-top: 22px; /* align with input */

  @media (max-width: 560px) {
    justify-content: center;
    padding-top: 0;
  }
}

.swap-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  transition: all 0.15s;
  &:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.05); }
  .dark & { border-color: rgba(255,255,255,0.1); color: #94a3b8; }
  .dark &:hover { border-color: #818cf8; color: #a5b4fc; }
}

/* ─── 顺序错误 ───────────────────────────────────────────────── */
.order-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239,68,68,0.05);
  border: 1px solid rgba(239,68,68,0.18);
  border-radius: 9px;
  color: #ef4444;
  font-size: 13px;
  .dark & { background: rgba(239,68,68,0.08); color: #f87171; }
}
.oe-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.oe-body { display: flex; flex-direction: column; gap: 8px; }
.oe-body p { margin: 0; }
.oe-swap-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(239,68,68,0.3);
  background: rgba(239,68,68,0.06);
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(239,68,68,0.12); }
  .dark & { color: #f87171; }
}

/* ─── 结果表格 ───────────────────────────────────────────────── */
.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  overflow: hidden;
  background: #fff;
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }
}

.re-table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block; /* allow scroll */

  @media (min-width: 480px) { display: table; }
}

thead {
  background: rgba(0,0,0,0.025);
  .dark & { background: rgba(255,255,255,0.03); }
}

th {
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  white-space: nowrap;
  .dark & { color: #94a3b8; border-color: rgba(255,255,255,0.08); }
}

.th-label { width: 100px; }

.th-new-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-cidr-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  opacity: 0.55;

  &:hover { opacity: 1; background: rgba(99,102,241,0.08); color: #6366f1; }
  &--copied { opacity: 1 !important; color: #22c55e !important; }
  .dark &:hover { color: #a5b4fc; background: rgba(129,140,248,0.1); }
}

.re-row {
  &:nth-child(even) {
    background: rgba(0,0,0,0.018);
    .dark & { background: rgba(255,255,255,0.02); }
  }
  &:hover {
    background: rgba(99,102,241,0.06) !important;
    .dark & { background: rgba(129,140,248,0.08) !important; }
  }
}

td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  font-size: 13.5px;
  vertical-align: middle;
  color: #334155;
  .dark & { color: #cbd5e1; border-color: rgba(255,255,255,0.05); }
}

.re-row:last-child td { border-bottom: none; }

.td-label {
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
  .dark & { color: #94a3b8; }
}

.td-value {
  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12.5px;
    background: rgba(0,0,0,0.04);
    color: #1e293b;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.07);
    .dark & { background: rgba(255,255,255,0.06); color: #e2e8f0; border-color: rgba(255,255,255,0.08); }
  }

  &--new code {
    background: rgba(99,102,241,0.07);
    color: #4338ca;
    border-color: rgba(99,102,241,0.12);
    .dark & { background: rgba(129,140,248,0.1); color: #a5b4fc; border-color: rgba(129,140,248,0.18); }
  }
}

.td-empty { color: #cbd5e1; .dark & { color: #374151; } }

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
