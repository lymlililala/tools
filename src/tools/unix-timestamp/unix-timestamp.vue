<script setup lang="ts">
import { format, fromUnixTime } from 'date-fns';

const { t } = useI18n();

// ── 实时当前时间 ───────────────────────────────────────────────────────────
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval>;
onMounted(() => { timer = setInterval(() => { now.value = Date.now(); }, 1000); });
onUnmounted(() => clearInterval(timer));

const currentTimestamp = computed(() => Math.floor(now.value / 1000));
const currentMs = computed(() => now.value);

// ── 时间戳 → 日期：智能输入区 ────────────────────────────────────────────
// 接受：纯数字时间戳（自动侦测秒/毫秒）或任意 Date 字符串
const tsInput = ref<string>(String(Math.floor(Date.now() / 1000)));
const tsInputFocused = ref(false);

type ParseMode = 'unix-s' | 'unix-ms' | 'date-str';

interface ParseResult {
  date: Date
  mode: ParseMode
}

function smartParse(raw: string): ParseResult | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  // 纯数字：按长度自动决定秒/毫秒
  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (Number.isNaN(n)) return null;
    // 13 位及以上视为毫秒
    const isMs = Math.abs(n).toString().length >= 13;
    try {
      const d = isMs ? new Date(n) : fromUnixTime(n);
      if (Number.isNaN(d.getTime())) return null;
      return { date: d, mode: isMs ? 'unix-ms' : 'unix-s' };
    }
    catch { return null; }
  }

  // 日期字符串
  try {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    return { date: d, mode: 'date-str' };
  }
  catch { return null; }
}

const parseResult = computed(() => smartParse(tsInput.value));
const parsedDate = computed(() => parseResult.value?.date ?? null);
const parseMode = computed(() => parseResult.value?.mode ?? null);
const tsError = computed(() => {
  if (tsInput.value.trim() === '') return null;
  if (!parseResult.value) return 'Invalid input — enter a Unix timestamp or a date string';
  return null;
});

// 模式标签
const modeBadgeText = computed(() => {
  switch (parseMode.value) {
    case 'unix-s': return 'Unix (s)';
    case 'unix-ms': return 'Unix (ms)';
    case 'date-str': return 'Date string';
    default: return null;
  }
});

function getRelative(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  const abs = Math.abs(diff);
  const dir = diff >= 0 ? 'ago' : 'from now';
  if (abs < 60) return `${abs} second${abs !== 1 ? 's' : ''} ${dir}`;
  if (abs < 3600) return `${Math.floor(abs / 60)} minute${Math.floor(abs / 60) !== 1 ? 's' : ''} ${dir}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)} hour${Math.floor(abs / 3600) !== 1 ? 's' : ''} ${dir}`;
  return `${Math.floor(abs / 86400)} day${Math.floor(abs / 86400) !== 1 ? 's' : ''} ${dir}`;
}

const tsResults = computed(() => {
  const d = parsedDate.value;
  if (!d) return null;
  return {
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm:ss'),
    unix: String(Math.floor(d.getTime() / 1000)),
    ms: String(d.getTime()),
    weekday: format(d, 'EEEE'),
    relative: getRelative(d),
  };
});

// 使用当前时间（填入秒级时间戳）
function useNow() {
  tsInput.value = String(currentTimestamp.value);
}

// ── 日期 → 时间戳 ─────────────────────────────────────────────────────────
const dateInput = ref(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
const dateError = computed(() => {
  if (dateInput.value.trim() === '') return null;
  try {
    const d = new Date(dateInput.value);
    if (Number.isNaN(d.getTime())) return 'Invalid date string';
    return null;
  }
  catch { return 'Invalid date string'; }
});

const dateResults = computed(() => {
  if (dateError.value !== null) return null;
  try {
    const d = new Date(dateInput.value);
    if (Number.isNaN(d.getTime())) return null;
    return {
      unix: String(Math.floor(d.getTime() / 1000)),
      ms: String(d.getTime()),
    };
  }
  catch { return null; }
});
</script>

<template>
  <div style="max-width: 720px; margin: 0 auto">
    <!-- ① 当前时间 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.unix-timestamp.current') }}
      </template>
      <div class="current-grid">
        <div class="current-item">
          <div class="current-label">Unix Timestamp (s)</div>
          <c-text-copyable :value="String(currentTimestamp)" class="current-value mono" />
        </div>
        <div class="current-item">
          <div class="current-label">Milliseconds</div>
          <c-text-copyable :value="String(currentMs)" class="current-value mono" />
        </div>
        <div class="current-item">
          <div class="current-label">ISO 8601</div>
          <c-text-copyable :value="new Date(now).toISOString()" class="current-value mono" />
        </div>
        <div class="current-item">
          <div class="current-label">Local Time</div>
          <c-text-copyable :value="new Date(now).toLocaleString()" class="current-value mono" />
        </div>
      </div>
    </c-card>

    <!-- ② 时间戳 / 日期字符串 → 详情 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.unix-timestamp.tsToDate') }}
      </template>

      <!-- 输入行 -->
      <div class="input-row" mb-3>
        <div class="input-wrap" :class="{ 'has-error': tsError, 'is-focused': tsInputFocused }">
          <n-input
            v-model:value="tsInput"
            class="ts-input"
            :placeholder="`${currentTimestamp}  or  2024-01-01T00:00:00`"
            :status="tsError ? 'error' : undefined"
            @focus="tsInputFocused = true"
            @blur="tsInputFocused = false"
          />
          <!-- 自动侦测模式标签 -->
          <span v-if="modeBadgeText && !tsError" class="mode-badge">
            {{ modeBadgeText }}
          </span>
        </div>

        <c-button @click="useNow">
          {{ t('tools.unix-timestamp.useNow') }}
        </c-button>
      </div>

      <!-- 错误提示 -->
      <transition name="err-slide">
        <div v-if="tsError" class="error-inline" mb-3>
          <icon-mdi-alert-circle-outline class="ei-icon" />
          <span>{{ tsError }}</span>
        </div>
      </transition>

      <!-- 结果表格 -->
      <div v-if="tsResults" class="result-table">
        <div v-for="(val, key) in tsResults" :key="key" class="result-row">
          <span class="result-key">{{ key }}</span>
          <c-text-copyable :value="val" class="result-val mono" />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!tsError && tsInput.trim() === ''" class="empty-hint">
        Enter a Unix timestamp or date string above
      </div>
    </c-card>

    <!-- ③ 日期 → 时间戳 -->
    <c-card>
      <template #title>
        {{ t('tools.unix-timestamp.dateToTs') }}
      </template>

      <div mb-3>
        <n-form-item :label="t('tools.unix-timestamp.dateString')">
          <n-input
            v-model:value="dateInput"
            placeholder="2024-01-01T00:00:00"
            :status="dateError ? 'error' : undefined"
            style="width:100%; font-family:monospace"
          />
        </n-form-item>

        <transition name="err-slide">
          <div v-if="dateError" class="error-inline" mt-1>
            <icon-mdi-alert-circle-outline class="ei-icon" />
            <span>{{ dateError }}</span>
          </div>
        </transition>
      </div>

      <div v-if="dateResults" class="result-table">
        <div class="result-row">
          <span class="result-key">Unix (seconds)</span>
          <c-text-copyable :value="dateResults.unix" class="result-val mono" />
        </div>
        <div class="result-row">
          <span class="result-key">Milliseconds</span>
          <c-text-copyable :value="dateResults.ms" class="result-val mono" />
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
// ── 当前时间卡 ────────────────────────────────────────────────────────────
.current-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.current-item {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
}

.current-label {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.55;   // 加深对比度（原 0.5）
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.current-value {
  font-size: 14px;
}

.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

// ── 输入行 ────────────────────────────────────────────────────────────────
.input-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.input-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.ts-input {
  width: 100%;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

// 自动侦测模式标签
.mode-badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
  padding: 2px 7px;
  pointer-events: none;
}

// ── 错误提示 ──────────────────────────────────────────────────────────────
.error-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 12px;
  color: #dc2626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.ei-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: #ef4444;
}

.err-slide-enter-active,
.err-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.err-slide-enter-from,
.err-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// ── 空状态 ────────────────────────────────────────────────────────────────
.empty-hint {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  opacity: 0.35;
}

// ── 结果表格 ──────────────────────────────────────────────────────────────
.result-table {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.result-row {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--n-border-color);
  gap: 12px;
  transition: background 0.12s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(99, 102, 241, 0.03);
  }
}

// 加深 key 标签对比度（原 0.6 → 0.72）
.result-key {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.72;
  min-width: 130px;
  flex-shrink: 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.result-val {
  font-size: 13px;
  word-break: break-all;
}
</style>
