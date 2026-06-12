<script setup lang="ts">
import { convertBase } from '../integer-base-converter/integer-base-converter.model';
import { ipv4ToInt, ipv4ToIpv6, isValidIpv4 } from './ipv4-address-converter.service';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const rawIpAddress = useStorage('ipv4-converter:ip', '192.168.1.1');

// ── 校验 ──────────────────────────────────────────────────────
const isValid = computed(() => isValidIpv4({ ip: rawIpAddress.value }));
const hasInput = computed(() => rawIpAddress.value.trim().length > 0);
const showError = computed(() => hasInput.value && !isValid.value);

// ── 结果 ──────────────────────────────────────────────────────
interface ResultRow {
  label: string
  value: string
  mono?: boolean
}

const resultRows = computed((): ResultRow[] => {
  if (!isValid.value) {
    return [];
  }

  const ipInDecimal = ipv4ToInt({ ip: rawIpAddress.value });
  const hex = convertBase({ fromBase: 10, toBase: 16, value: String(ipInDecimal) }).toUpperCase().padStart(8, '0');
  const bin = convertBase({ fromBase: 10, toBase: 2, value: String(ipInDecimal) }).padStart(32, '0');
  const binFormatted = bin.match(/.{8}/g)?.join('.') ?? bin;

  return [
    { label: t('tools.ipv4-address-converter.labelDecimal'), value: String(ipInDecimal) },
    { label: t('tools.ipv4-address-converter.labelHex'), value: hex, mono: true },
    { label: t('tools.ipv4-address-converter.labelBinary'), value: binFormatted, mono: true },
    { label: t('tools.ipv4-address-converter.labelIpv6'), value: ipv4ToIpv6({ ip: rawIpAddress.value }), mono: true },
    { label: t('tools.ipv4-address-converter.labelIpv6Short'), value: ipv4ToIpv6({ ip: rawIpAddress.value, prefix: '::ffff:' }), mono: true },
  ];
});

// ── 复制 ──────────────────────────────────────────────────────
const copiedLabel = ref('');
const { copy } = useCopy({ createToast: true, text: computed(() => t('tools.ipv4-address-converter.copied')) });

async function copyRow(label: string, value: string) {
  if (!value) {
    return;
  }
  await copy(value);
  copiedLabel.value = label;
  setTimeout(() => {
    copiedLabel.value = '';
  }, 1800);
}
</script>

<template>
  <div class="ipc-root">
    <!-- ── 输入区 ──────────────────────────────────────────── -->
    <div class="input-section">
      <label class="input-label">{{ t('tools.ipv4-address-converter.inputLabel') }}</label>
      <div class="input-wrap" :class="{ 'input-wrap--error': showError }">
        <input
          v-model="rawIpAddress"
          class="ip-input"
          :placeholder="t('tools.ipv4-address-converter.inputPlaceholder')"
          spellcheck="false"
          autocomplete="off"
          autofocus
        >
      </div>
      <transition name="slide-down">
        <div v-if="showError" class="error-msg">
          <icon-mdi-alert-circle-outline />
          {{ t('tools.ipv4-address-converter.errorMsg') }}
        </div>
      </transition>
    </div>

    <!-- ── 结果区 ───────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="isValid" class="result-card">
        <div
          v-for="row in resultRows"
          :key="row.label"
          class="result-row"
          @click="copyRow(row.label, row.value)"
        >
          <span class="row-label">{{ row.label }}</span>
          <span class="row-value" :class="{ 'row-value--mono': row.mono }">
            {{ row.value }}
          </span>
          <span class="row-copy">
            <icon-mdi-check v-if="copiedLabel === row.label" class="row-copy--ok" />
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </div>
    </transition>

    <!-- 空状态 -->
    <transition name="fade">
      <div v-if="!hasInput" class="empty-hint">
        <icon-mdi-ip-network class="empty-icon" />
        <span>{{ t('tools.ipv4-address-converter.emptyHint') }}</span>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.ipc-root {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ─── 输入区 ─────────────────────────────────────────────────── */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  .dark & { color: #94a3b8; }
}

.input-wrap {
  border-radius: 9px;
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
    &:focus-within { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.12); }
    &.input-wrap--error { border-color: #f87171 !important; }
  }
}

.ip-input {
  width: 100%;
  padding: 11px 14px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 15px;
  letter-spacing: 0.03em;
  color: #1e293b;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.28); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.error-msg {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12.5px;
  color: #ef4444;
  padding: 7px 12px;
  background: rgba(239,68,68,0.05);
  border: 1px solid rgba(239,68,68,0.15);
  border-radius: 7px;
  line-height: 1.5;
  .dark & { background: rgba(239,68,68,0.08); color: #f87171; }
}

/* ─── 结果卡片 ───────────────────────────────────────────────── */
.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  overflow: hidden;
  background: #fff;
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: background 0.12s;

  &:last-child { border-bottom: none; }

  &:nth-child(even) {
    background: rgba(0,0,0,0.018);
    .dark & { background: rgba(255,255,255,0.02); }
  }

  &:hover {
    background: rgba(99,102,241,0.07) !important;
    .dark & { background: rgba(129,140,248,0.1) !important; }
    .row-copy { opacity: 1; }
  }

  .dark & { border-color: rgba(255,255,255,0.05); }
}

.row-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  white-space: nowrap;
  width: 90px;
  flex-shrink: 0;
  .dark & { color: #6b7280; }
}

.row-value {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
  word-break: break-all;
  min-width: 0;

  &--mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    background: rgba(99,102,241,0.07);
    color: #4338ca;
    padding: 2px 8px;
    border-radius: 5px;
    border: 1px solid rgba(99,102,241,0.12);

    .dark & {
      background: rgba(129,140,248,0.1);
      color: #a5b4fc;
      border-color: rgba(129,140,248,0.18);
    }
  }

  .dark & { color: #e2e8f0; }
}

.row-copy {
  font-size: 14px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  &--ok { color: #22c55e; }
  .dark & { color: #6b7280; }
}

/* ─── 空状态 ─────────────────────────────────────────────────── */
.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 20px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  .dark & { color: #4b5563; }
}
.empty-icon { font-size: 32px; opacity: 0.45; }

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
