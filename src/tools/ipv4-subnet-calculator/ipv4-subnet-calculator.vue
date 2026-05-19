<script setup lang="ts">
import { Netmask } from 'netmask';
import { useStorage } from '@vueuse/core';
import { getIPClass } from './ipv4-subnet-calculator.models';
import { withDefaultOnError } from '@/utils/defaults';
import { isNotThrowing } from '@/utils/boolean';
import { useCopy } from '@/composable/copy';

const ip = useStorage('ipv4-subnet-calculator:ip', '192.168.0.1/24');

const getNetworkInfo = (address: string) => new Netmask(address.trim());

const networkInfo = computed(() => withDefaultOnError(() => getNetworkInfo(ip.value), undefined));

// ── 错误信息 ──────────────────────────────────────────────────
const parseError = computed((): string => {
  if (!ip.value.trim()) return '';
  if (!isNotThrowing(() => getNetworkInfo(ip.value.trim()))) {
    return '无法解析此地址，请检查格式（例如：192.168.1.0/24）';
  }
  return '';
});

const hasError = computed(() => !!parseError.value);

// ── 结果行定义 ────────────────────────────────────────────────
interface Section {
  label: string
  getValue: (block: Netmask) => string | undefined
  undefinedFallback?: string
  isCode?: boolean
}

const sections: Section[] = [
  {
    label: '网络（CIDR）',
    getValue: block => block.toString(),
    isCode: true,
  },
  {
    label: '网络地址',
    getValue: ({ base }) => base,
    isCode: true,
  },
  {
    label: '子网掩码',
    getValue: ({ mask }) => mask,
    isCode: true,
  },
  {
    label: '子网掩码（二进制）',
    getValue: ({ bitmask }) =>
      ('1'.repeat(bitmask) + '0'.repeat(32 - bitmask)).match(/.{8}/g)?.join('.') ?? '',
    isCode: true,
  },
  {
    label: 'CIDR 记法',
    getValue: ({ bitmask }) => `/${bitmask}`,
    isCode: true,
  },
  {
    label: '通配符掩码',
    getValue: ({ hostmask }) => hostmask,
    isCode: true,
  },
  {
    label: '网络大小',
    getValue: ({ size }) => String(size),
  },
  {
    label: '可用主机数',
    getValue: ({ size }) => String(Math.max(0, size - 2)),
  },
  {
    label: '起始地址',
    getValue: ({ first }) => first,
    isCode: true,
  },
  {
    label: '结束地址',
    getValue: ({ last }) => last,
    isCode: true,
  },
  {
    label: '广播地址',
    getValue: ({ broadcast }) => broadcast,
    undefinedFallback: '该掩码无广播地址',
    isCode: true,
  },
  {
    label: 'IP 类别',
    getValue: ({ base: ipAddr }) => getIPClass({ ip: ipAddr }),
    undefinedFallback: '未知类别',
  },
];

// ── 翻页 ──────────────────────────────────────────────────────
function switchToBlock(count: number) {
  const next = networkInfo.value?.next(count);
  if (next) ip.value = next.toString();
}

// ── 行复制 ────────────────────────────────────────────────────
const copiedKey = ref('');
const { copy } = useCopy({ createToast: true, text: '已复制到剪贴板' });

async function copyRow(label: string, value: string) {
  await copy(value);
  copiedKey.value = label;
  setTimeout(() => { copiedKey.value = ''; }, 1800);
}
</script>

<template>
  <div class="sn-root">
    <!-- ── 输入区 ──────────────────────────────────────────── -->
    <div class="input-section">
      <label class="input-label">输入 IPv4 地址（可带或不带掩码）</label>
      <div class="input-wrap" :class="{ 'input-wrap--error': hasError }">
        <input
          v-model="ip"
          class="ip-input"
          placeholder="例如：192.168.1.0/24"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
      <transition name="slide-down">
        <div v-if="hasError" class="error-msg">
          <icon-mdi-alert-circle-outline />
          {{ parseError }}
        </div>
      </transition>
    </div>

    <!-- ── 结果表格 ────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="networkInfo && !hasError" class="result-card">
        <table class="sn-table">
          <tbody>
            <tr
              v-for="sec in sections"
              :key="sec.label"
              class="sn-row"
              @click="sec.getValue(networkInfo) && copyRow(sec.label, sec.getValue(networkInfo)!)"
            >
              <td class="td-label">
                {{ sec.label }}
              </td>
              <td class="td-value">
                <code v-if="sec.getValue(networkInfo) && sec.isCode">
                  {{ sec.getValue(networkInfo) }}
                </code>
                <span v-else-if="sec.getValue(networkInfo)">
                  {{ sec.getValue(networkInfo) }}
                </span>
                <span v-else class="fallback-text">
                  {{ sec.undefinedFallback }}
                </span>
              </td>
              <td class="td-copy">
                <span v-if="sec.getValue(networkInfo)" class="copy-icon">
                  <icon-mdi-check v-if="copiedKey === sec.label" class="copy-icon--ok" />
                  <icon-mdi-content-copy v-else />
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ── 翻页按钮 ──────────────────────────────────── -->
        <div class="nav-row">
          <button class="nav-btn" @click="switchToBlock(-1)">
            <icon-mdi-arrow-left />
            上一子网
          </button>
          <button class="nav-btn nav-btn--next" @click="switchToBlock(1)">
            下一子网
            <icon-mdi-arrow-right />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根 ─────────────────────────────────────────────────────── */
.sn-root {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── 输入区 ─────────────────────────────────────────────────── */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

    &:focus-within {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
    }

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
  font-size: 14px;
  color: #1e293b;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.3); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #ef4444;
  padding: 6px 10px;
  background: rgba(239,68,68,0.06);
  border-radius: 7px;
  border: 1px solid rgba(239,68,68,0.15);
  .dark & { background: rgba(239,68,68,0.08); color: #f87171; }
}

/* ─── 结果卡片 ───────────────────────────────────────────────── */
.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  overflow: hidden;
  background: #fff;

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.09);
  }
}

/* ─── 表格 ───────────────────────────────────────────────────── */
.sn-table {
  width: 100%;
  border-collapse: collapse;
}

.sn-row {
  cursor: pointer;
  transition: background 0.12s;

  &:nth-child(even) {
    background: rgba(0,0,0,0.018);
    .dark & { background: rgba(255,255,255,0.02); }
  }

  &:hover {
    background: rgba(99,102,241,0.07) !important;
    .dark & { background: rgba(129,140,248,0.1) !important; }

    .copy-icon { opacity: 1; }
  }
}

td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  font-size: 13.5px;
  vertical-align: middle;
  .dark & { border-color: rgba(255,255,255,0.05); }
}

.sn-row:last-child td { border-bottom: none; }

.td-label {
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  width: 200px;
  .dark & { color: #94a3b8; }
}

.td-value {
  color: #1e293b;
  word-break: break-all;

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    background: rgba(99,102,241,0.07);
    color: #4338ca;
    padding: 2px 7px;
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

.fallback-text {
  color: #94a3b8;
  font-style: italic;
  font-size: 12.5px;
  .dark & { color: #4b5563; }
}

.td-copy {
  width: 36px;
  padding: 0 10px;
  text-align: right;
}

.copy-icon {
  font-size: 13px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.15s;
  display: inline-flex;
  align-items: center;

  &--ok { color: #22c55e !important; }
  .dark & { color: #6b7280; }
}

/* ─── 翻页按钮 ───────────────────────────────────────────────── */
.nav-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid rgba(0,0,0,0.06);
  .dark & { border-color: rgba(255,255,255,0.06); }
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 7px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99,102,241,0.05);
  }

  &--next { flex-direction: row; }

  .dark & {
    border-color: rgba(255,255,255,0.1);
    color: #94a3b8;
    &:hover { border-color: #818cf8; color: #a5b4fc; background: rgba(129,140,248,0.07); }
  }
}

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
