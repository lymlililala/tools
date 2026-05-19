<script setup lang="ts">
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parseISO,
  parseJSON,
} from 'date-fns';
import type { DateFormat, ToDateMapper } from './date-time-converter.types';
import {
  dateToExcelFormat,
  excelFormatToDate,
  isExcelFormat,
  isISO8601DateTimeString,
  isISO9075DateString,
  isMongoObjectId,
  isRFC3339DateString,
  isRFC7231DateString,
  isTimestamp,
  isUTCDateString,
  isUnixTimestamp,
} from './date-time-converter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';

const inputDate = ref('');

const toDate: ToDateMapper = date => new Date(date);

// ── Excel 格式：固定 5 位小数，避免长串小数抖动 ───────────────────────────
function dateToExcelFormatFixed(date: Date) {
  return Number(dateToExcelFormat(date)).toFixed(5);
}

const formats: DateFormat[] = [
  {
    name: 'JS locale date string',
    fromDate: date => date.toString(),
    toDate,
    formatMatcher: () => false,
  },
  {
    name: 'ISO 8601',
    fromDate: formatISO,
    toDate: parseISO,
    formatMatcher: date => isISO8601DateTimeString(date),
  },
  {
    name: 'ISO 9075',
    fromDate: formatISO9075,
    toDate: parseISO,
    formatMatcher: date => isISO9075DateString(date),
  },
  {
    name: 'RFC 3339',
    fromDate: formatRFC3339,
    toDate,
    formatMatcher: date => isRFC3339DateString(date),
  },
  {
    name: 'RFC 7231',
    fromDate: formatRFC7231,
    toDate,
    formatMatcher: date => isRFC7231DateString(date),
  },
  {
    name: 'Unix timestamp',
    fromDate: date => String(getUnixTime(date)),
    toDate: sec => fromUnixTime(+sec),
    formatMatcher: date => isUnixTimestamp(date),
  },
  {
    name: 'Timestamp',
    fromDate: date => String(getTime(date)),
    toDate: ms => parseJSON(+ms),
    formatMatcher: date => isTimestamp(date),
  },
  {
    name: 'UTC format',
    fromDate: date => date.toUTCString(),
    toDate,
    formatMatcher: date => isUTCDateString(date),
  },
  {
    name: 'Mongo ObjectID',
    fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
    toDate: objectId => new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000),
    formatMatcher: date => isMongoObjectId(date),
  },
  {
    name: 'Excel date/time',
    fromDate: dateToExcelFormatFixed, // 固定 5 位小数
    toDate: excelFormatToDate,
    formatMatcher: isExcelFormat,
  },
];

const formatIndex = ref(6);

// ── 实时时钟（每秒刷新一次，且截断毫秒） ──────────────────────────────────
// useNow 默认 1000ms，但返回的是完整毫秒。
// 我们将其截断到秒（floor 到 1000ms），这样 Timestamp 行每整秒才跳一次，
// 不会因为毫秒尾数每帧都变而疯狂抖动。
const rawNow = useNow({ interval: 1000 });
const now = computed(() => {
  // 截断到秒，消除毫秒级抖动
  return new Date(Math.floor(rawNow.value.getTime() / 1000) * 1000);
});

// ── 冻结状态：鼠标 Hover 结果列表区域时暂停 ─────────────────────────────
const isFrozen = ref(false);
const frozenSnapshot = ref<Date | null>(null);

function freezeClock() {
  if (!inputDate.value) {
    // 仅在空输入（实时时钟）模式下才需要冻结
    isFrozen.value = true;
    frozenSnapshot.value = new Date(now.value); // 保存当前快照
  }
}

function unfreezeClock() {
  isFrozen.value = false;
  frozenSnapshot.value = null;
}

// ── 计算基准时间 ──────────────────────────────────────────────────────────
const normalizedDate = computed(() => {
  if (!inputDate.value) {
    // 空输入：使用实时时钟（冻结时使用快照）
    return isFrozen.value && frozenSnapshot.value ? frozenSnapshot.value : now.value;
  }

  const { toDate } = formats[formatIndex.value];
  try {
    return toDate(inputDate.value);
  }
  catch (_ignored) {
    return undefined;
  }
});

function onDateInputChanged(value: string) {
  const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(value));
  if (matchingIndex !== -1) {
    formatIndex.value = matchingIndex;
  }
  // 有输入时，解除冻结（输入后变为静态，无需冻结）
  if (value) {
    unfreezeClock();
  }
}

const validation = useValidation({
  source: inputDate,
  watch: [formatIndex],
  rules: [
    {
      message: 'This date is invalid for this format',
      validator: value =>
        withDefaultOnError(() => {
          if (value === '') {
            return true;
          }

          const maybeDate = formats[formatIndex.value].toDate(value);
          return isDate(maybeDate) && isValid(maybeDate);
        }, false),
    },
  ],
});

function formatDateUsingFormatter(formatter: (date: Date) => string, date?: Date) {
  if (!date || !validation.isValid) {
    return '';
  }

  return withDefaultOnError(() => formatter(date), '');
}

// ── 是否为实时时钟模式 ────────────────────────────────────────────────────
const isLiveMode = computed(() => !inputDate.value);
</script>

<template>
  <div>
    <!-- 输入区：加 Input format 标签 + 实时时钟标识 -->
    <div flex gap-2 items-center>
      <div style="flex: 1; position: relative">
        <c-input-text
          v-model:value="inputDate"
          autofocus
          placeholder="Put your date string here..."
          clearable
          test-id="date-time-converter-input"
          :validation="validation"
          @update:value="onDateInputChanged"
        />
        <!-- 实时时钟模式标识 -->
        <transition name="fade">
          <div v-if="isLiveMode" class="live-badge">
            <span class="live-dot" />
            Live
          </div>
        </transition>
      </div>

      <!-- 下拉框 + 明确标签 -->
      <div class="format-select-wrap">
        <span class="format-label">Input format:</span>
        <c-select
          v-model:value="formatIndex"
          style="flex: 0 0 170px"
          :options="formats.map(({ name }, i) => ({ label: name, value: i }))"
          data-test-id="date-time-converter-format-select"
        />
      </div>
    </div>

    <n-divider />

    <!-- 结果列表：Hover 冻结 + tabular-nums -->
    <div
      class="results-list"
      :class="{ frozen: isFrozen && isLiveMode }"
      @mouseenter="freezeClock"
      @mouseleave="unfreezeClock"
    >
      <!-- 冻结提示 -->
      <transition name="fade">
        <div v-if="isFrozen && isLiveMode" class="freeze-hint">
          <icon-mdi-pause-circle class="freeze-icon" />
          Clock paused — values are stable for copying
        </div>
      </transition>

      <input-copyable
        v-for="{ name, fromDate } in formats"
        :key="name"
        :label="name"
        label-width="150px"
        label-position="left"
        label-align="right"
        :value="formatDateUsingFormatter(fromDate, normalizedDate)"
        placeholder="Invalid date..."
        :test-id="name"
        readonly
        mt-2
        class="result-row"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
/* ── 实时标识 ──────────────────────────────────────────────────────────── */
.live-badge {
  position: absolute;
  right: 36px; /* 留出 clearable 按钮的位置 */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #22c55e;
  pointer-events: none;
  opacity: 0.8;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

/* ── Input format 标签 ─────────────────────────────────────────────────── */
.format-select-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.format-label {
  font-size: 13px;
  opacity: 0.55;
  white-space: nowrap;
}

/* ── 结果列表 ──────────────────────────────────────────────────────────── */
.results-list {
  transition: opacity 0.2s;

  &.frozen {
    /* 冻结时轻微视觉提示，但不影响可读性 */
  }
}

/* 让所有结果行的数字使用等宽方式排列（防抖动核心） */
.result-row {
  /* 通过深度选择器让 input-copyable 内的 input 使用等宽数字 */
  :deep(input) {
    font-variant-numeric: tabular-nums;
    font-family: 'Fira Code', 'Consolas', 'Menlo', monospace;
    font-size: 13px;
  }
}

/* ── 冻结提示条 ────────────────────────────────────────────────────────── */
.freeze-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #3b82f6;
  padding: 5px 8px;
  background: rgba(59, 130, 246, 0.07);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 5px;
  margin-bottom: 6px;
}

.freeze-icon {
  font-size: 15px;
  flex-shrink: 0;
}

/* ── 过渡动画 ──────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
