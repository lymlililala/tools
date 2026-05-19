<script setup lang="ts">
import { convertBase } from './integer-base-converter.model';
import { useCopy } from '@/composable/copy';

// ── 合法字符集（与 convertBase 保持一致） ─────────────────────────────────
const RANGE = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/';

function validCharsForBase(base: number) {
  return RANGE.slice(0, base);
}

function isValidForBase(value: string, base: number) {
  if (!value || value === '-') return true; // 空/负号先放行
  const chars = validCharsForBase(base);
  return value.split('').every(c => chars.includes(c));
}

// ── 全局数据源 ─────────────────────────────────────────────────────────────
// activeBase: 当前被用户主动编辑的是哪个 base；activeValue: 当前编辑的原始字符串
const activeBase = ref(10);
const activeValue = ref('42');

// ── 核心转换（带 BigInt，安全） ────────────────────────────────────────────
function safeConvert(toBase: number): string {
  const val = activeValue.value;
  if (!val || val === '-' || val === '0') return val || '0';
  try {
    return convertBase({ value: val, fromBase: activeBase.value, toBase });
  }
  catch {
    return '';
  }
}

// ── 固定进制列表 ───────────────────────────────────────────────────────────
const FIXED_BASES = [
  { label: 'Binary', base: 2 },
  { label: 'Octal', base: 8 },
  { label: 'Decimal', base: 10 },
  { label: 'Hexadecimal', base: 16 },
];

// ── Custom 进制 ─────────────────────────────────────────────────────────────
const customBase = ref(42);

// ── 每行的本地展示值（由 activeValue + activeBase 驱动） ──────────────────
// 对于"当前激活的 base"行，直接显示原始输入；其余行显示转换结果
function displayValue(base: number) {
  if (base === activeBase.value) return activeValue.value;
  return safeConvert(base);
}

// ── 某行被用户编辑时 ──────────────────────────────────────────────────────
function onRowInput(newVal: string, base: number) {
  // 切换激活 base
  activeBase.value = base;
  activeValue.value = newVal.toLowerCase(); // 统一小写，与 RANGE 保持一致
}

// ── Input base（顶部） ─────────────────────────────────────────────────────
const topBase = ref(10);
const topValue = ref('42');

// 当顶部 base 改变时，将当前 activeValue 转换到新 base 下重新设置
watch(topBase, (newBase, oldBase) => {
  if (newBase < 2) { topBase.value = 2; return; }
  if (newBase > 64) { topBase.value = 64; return; }
  // 用旧的 base 转换到新的 base
  try {
    const converted = convertBase({ value: activeValue.value, fromBase: activeBase.value, toBase: newBase });
    activeBase.value = newBase;
    activeValue.value = converted;
    topValue.value = converted;
  }
  catch {
    activeBase.value = newBase;
  }
});

// 顶部输入框的值变化（直接用 topBase 作为 activeBase）
function onTopInput(val: string) {
  activeBase.value = topBase.value;
  activeValue.value = val.toLowerCase();
  topValue.value = val;
}

// 同步 topValue 和 topBase 到活跃状态
const topDisplayValue = computed({
  get: () => {
    if (activeBase.value === topBase.value) return activeValue.value;
    return safeConvert(topBase.value);
  },
  set: (val: string) => {
    onTopInput(val);
  },
});

// ── 错误信息 ───────────────────────────────────────────────────────────────
function getRowError(base: number): string {
  const val = base === activeBase.value ? activeValue.value : '';
  if (!val) return '';
  if (!isValidForBase(val, base)) {
    const allowed = validCharsForBase(base);
    return `Base ${base} only allows: ${allowed.slice(0, Math.min(allowed.length, 20))}${allowed.length > 20 ? '…' : ''}`;
  }
  return '';
}

const topError = computed(() => {
  const val = topDisplayValue.value;
  if (!val) return '';
  if (!isValidForBase(val, topBase.value)) {
    return `Invalid character for base ${topBase.value}`;
  }
  return '';
});

// ── 全局转换是否有效 ──────────────────────────────────────────────────────
const isValid = computed(() => {
  const val = activeValue.value;
  if (!val) return true;
  return isValidForBase(val, activeBase.value);
});

// ── BigInt 大数支持提示（> MAX_SAFE_INTEGER 时提示精度完全安全） ───────────
const isBigInt = computed(() => {
  try {
    const dec = activeValue.value
      ? convertBase({ value: activeValue.value, fromBase: activeBase.value, toBase: 10 })
      : '0';
    return BigInt(dec) > BigInt(Number.MAX_SAFE_INTEGER);
  }
  catch {
    return false;
  }
});

// ── 复制辅助 ──────────────────────────────────────────────────────────────
type CopyKey = `base-${number}`;
const copiedKey = ref<CopyKey | null>(null);

async function copyValue(base: number) {
  const val = displayValue(base);
  if (!val) return;
  await navigator.clipboard.writeText(val);
  const key: CopyKey = `base-${base}`;
  copiedKey.value = key;
  setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = null;
  }, 1500);
}
</script>

<template>
  <div class="ibc-wrap">
    <c-card>
      <!-- ① 顶部 Input number + base ──────────────────────── -->
      <div class="top-row">
        <n-form-item
          label="Input number"
          label-placement="left"
          label-width="120"
          :validation-status="topError ? 'error' : undefined"
          :feedback="topError"
          class="top-input-item"
        >
          <n-input
            v-model:value="topDisplayValue"
            placeholder="e.g. 42"
            clearable
            :status="topError ? 'error' : undefined"
            style="font-family: 'Fira Code', monospace; font-variant-numeric: tabular-nums"
          />
        </n-form-item>

        <n-form-item label="Base" label-placement="left" label-width="45" :show-feedback="false" class="base-item">
          <n-input-number
            v-model:value="topBase"
            :min="2"
            :max="64"
            placeholder="10"
            style="width: 120px"
          />
        </n-form-item>
      </div>

      <!-- BigInt 提示 -->
      <transition name="fade">
        <div v-if="isBigInt" class="bigint-hint">
          <icon-mdi-information-outline class="hint-icon" />
          Large number detected — precision is guaranteed via BigInt (no loss).
        </div>
      </transition>

      <n-divider style="margin: 12px 0" />

      <!-- ② 固定进制行（全向输入） ────────────────────────── -->
      <div class="rows-wrap">
        <div
          v-for="{ label, base } in FIXED_BASES"
          :key="base"
          class="conv-row"
          :class="{ active: activeBase === base }"
        >
          <label class="row-label">{{ label }} ({{ base }})</label>
          <div class="row-input-wrap">
            <n-input
              :value="displayValue(base)"
              :placeholder="`Base ${base}…`"
              :status="activeBase === base && !isValidForBase(activeValue, base) ? 'error' : undefined"
              style="font-family: 'Fira Code', monospace; font-variant-numeric: tabular-nums"
              clearable
              @update:value="(v: string) => onRowInput(v, base)"
              @focus="() => { if (activeBase !== base) { onRowInput(displayValue(base), base); } }"
            />
            <!-- 行级错误 -->
            <div v-if="activeBase === base && !isValidForBase(activeValue, base)" class="row-error">
              {{ getRowError(base) }}
            </div>
          </div>
          <!-- 复制按钮 -->
          <c-tooltip :tooltip="copiedKey === `base-${base}` ? 'Copied!' : 'Copy'" position="left">
            <button
              class="copy-btn"
              :class="{ copied: copiedKey === `base-${base}` }"
              :disabled="!displayValue(base) || !isValid"
              @click="copyValue(base)"
            >
              <transition name="icon-sw" mode="out-in">
                <icon-mdi-check v-if="copiedKey === `base-${base}`" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
            </button>
          </c-tooltip>
        </div>

        <!-- ③ Custom 行 ────────────────────────────────────── -->
        <div class="conv-row custom-row" :class="{ active: activeBase === customBase }">
          <label class="row-label">
            Custom:
            <n-input-number
              v-model:value="customBase"
              :min="2"
              :max="64"
              size="small"
              style="width: 80px; display: inline-flex; margin-left: 4px"
            />
          </label>
          <div class="row-input-wrap">
            <n-input
              :value="displayValue(customBase)"
              :placeholder="`Base ${customBase}…`"
              :status="activeBase === customBase && !isValidForBase(activeValue, customBase) ? 'error' : undefined"
              style="font-family: 'Fira Code', monospace; font-variant-numeric: tabular-nums"
              clearable
              @update:value="(v: string) => onRowInput(v, customBase)"
              @focus="() => { if (activeBase !== customBase) { onRowInput(displayValue(customBase), customBase); } }"
            />
            <div v-if="activeBase === customBase && !isValidForBase(activeValue, customBase)" class="row-error">
              {{ getRowError(customBase) }}
            </div>
          </div>
          <c-tooltip :tooltip="copiedKey === `base-${customBase}` ? 'Copied!' : 'Copy'" position="left">
            <button
              class="copy-btn"
              :class="{ copied: copiedKey === `base-${customBase}` }"
              :disabled="!displayValue(customBase) || !isValid"
              @click="copyValue(customBase)"
            >
              <transition name="icon-sw" mode="out-in">
                <icon-mdi-check v-if="copiedKey === `base-${customBase}`" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
            </button>
          </c-tooltip>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.ibc-wrap {
  width: 100%;
}

/* ── 顶部输入区 ────────────────────────────────────────────────────────── */
.top-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.top-input-item {
  flex: 1 1 200px;
}

.base-item {
  flex-shrink: 0;
}

/* ── BigInt 提示 ──────────────────────────────────────────────────────── */
.bigint-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #3b82f6;
  opacity: 0.8;
  padding: 4px 0 0 2px;
}

.hint-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* ── 结果行 ───────────────────────────────────────────────────────────── */
.rows-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conv-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s;

  &.active {
    background: rgba(99, 102, 241, 0.05);
  }
}

.row-label {
  flex: 0 0 160px;
  text-align: right;
  font-size: 13px;
  opacity: 0.6;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 2px;
}

.row-input-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-error {
  font-size: 11px;
  color: #ef4444;
  padding-left: 4px;
  line-height: 1.4;
}

/* ── 复制按钮 ──────────────────────────────────────────────────────────── */
.copy-btn {
  width: 30px;
  height: 30px;
  margin-top: 4px;
  flex-shrink: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.35;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(128, 128, 128, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.1;
  }

  &.copied {
    opacity: 1;
    color: #22c55e;
  }
}

.copy-icon {
  font-size: 15px;
}

.copy-icon.success {
  color: #22c55e;
}

/* ── Custom 行 ────────────────────────────────────────────────────────── */
.custom-row .row-label {
  font-weight: 600;
  opacity: 0.75;
}

/* ── 过渡 ─────────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.icon-sw-enter-active,
.icon-sw-leave-active { transition: all 0.15s ease; }
.icon-sw-enter-from { opacity: 0; transform: scale(0.5); }
.icon-sw-leave-to { opacity: 0; transform: scale(0.5); }

/* ── 移动端 ───────────────────────────────────────────────────────────── */
@media (max-width: 520px) {
  .row-label {
    flex: 0 0 90px;
    font-size: 12px;
  }
}
</style>
