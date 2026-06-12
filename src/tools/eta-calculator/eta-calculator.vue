<script setup lang="ts">
import {
  addMilliseconds,
  format,
  formatDistance,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns';
import { formatMsDuration } from './eta-calculator.service';

const { t } = useI18n();

// ── 状态 ──────────────────────────────────────────────────────
const unitCount = ref(186); // 待处理总任务量
const unitPerTimeSpan = ref(3); // 每时间段完成数
const timeSpan = ref(5); // 时间段长度
const timeSpanMult = ref(60000); // 时间单位（ms）
const startedAt = ref(Date.now()); // 开始时间

// 时间单位选项
const TIME_UNITS = computed(() => [
  { label: t('tools.eta-calculator.unitMs'), value: 1 },
  { label: t('tools.eta-calculator.unitSec'), value: 1000 },
  { label: t('tools.eta-calculator.unitMin'), value: 60_000 },
  { label: t('tools.eta-calculator.unitHour'), value: 3_600_000 },
  { label: t('tools.eta-calculator.unitDay'), value: 86_400_000 },
]);
const selectedUnit = ref({ label: '', value: 60_000 }); // 默认分钟

// 同步标签
watch(() => TIME_UNITS.value, (units) => {
  const found = units.find(u => u.value === selectedUnit.value.value);
  if (found) {
    selectedUnit.value = found;
  }
}, { immediate: true });

// 同步 mult
watch(selectedUnit, (u) => {
  timeSpanMult.value = u.value;
}, { immediate: true });

// ── 校验 ──────────────────────────────────────────────────────
const hasError = computed(() =>
  unitCount.value <= 0 || unitPerTimeSpan.value <= 0 || timeSpan.value <= 0,
);

// ── 计算 ──────────────────────────────────────────────────────
const durationMs = computed((): number => {
  if (hasError.value) {
    return 0;
  }
  const timeSpanMs = timeSpan.value * timeSpanMult.value;
  return unitCount.value / (unitPerTimeSpan.value / timeSpanMs);
});

const endDate = computed(() => addMilliseconds(startedAt.value, durationMs.value));

// 友好的结束时间描述
const endAtLabel = computed((): string => {
  const d = endDate.value;
  const timeStr = format(d, 'HH:mm:ss');
  const dateStr = format(d, 'yyyy-MM-dd');

  if (isToday(d)) {
    return `${t('tools.eta-calculator.today')} ${timeStr}`;
  }
  if (isTomorrow(d)) {
    return `${t('tools.eta-calculator.tomorrow')} ${timeStr}`;
  }
  if (isYesterday(d)) {
    return `${t('tools.eta-calculator.yesterday')} ${timeStr}`;
  }

  // 超过 7 天用绝对日期
  const diffDays = Math.abs((d.getTime() - Date.now()) / 86400000);
  if (diffDays > 7) {
    return `${dateStr} ${timeStr}`;
  }

  return `${formatDistance(d, Date.now(), { addSuffix: true })} (${dateStr} ${timeStr})`;
});

// 总耗时文本化
const durationLabel = computed((): string => {
  if (hasError.value) {
    return t('tools.eta-calculator.cannotCalc');
  }
  return formatMsDuration(durationMs.value);
});

// ── 使用当前时间 ──────────────────────────────────────────────
function setNow() {
  startedAt.value = Date.now();
}

// ── 日期选择器 value 辅助 ─────────────────────────────────────
function onDateInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    startedAt.value = d.getTime();
  }
}

const startedAtStr = computed(() => {
  const d = new Date(startedAt.value);
  // format for datetime-local input: yyyy-MM-ddTHH:mm
  return format(d, 'yyyy-MM-dd\'T\'HH:mm');
});
</script>

<template>
  <div class="eta-root">
    <!-- ── 举例说明（中文） ──────────────────────────────── -->
    <div class="example-banner">
      <icon-mdi-lightbulb-outline class="example-icon" />
      <span>{{ t('tools.eta-calculator.example') }}</span>
    </div>

    <!-- ── 输入卡片 ───────────────────────────────────────── -->
    <div class="config-card">
      <!-- 行 1：任务量 + 开始时间 -->
      <div class="form-row form-row--2col">
        <div class="field">
          <label class="field-label">{{ t('tools.eta-calculator.totalTasks') }}</label>
          <div class="num-wrap" :class="{ 'num-wrap--error': unitCount <= 0 }">
            <button class="num-btn" :disabled="unitCount <= 1" @click="unitCount = Math.max(1, unitCount - 1)">
              <icon-mdi-minus />
            </button>
            <input
              v-model.number="unitCount"
              class="num-input"
              type="number"
              min="1"
              @blur="unitCount = Math.max(1, unitCount || 1)"
            >
            <button class="num-btn" @click="unitCount++">
              <icon-mdi-plus />
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">
            {{ t('tools.eta-calculator.startTime') }}
            <button class="now-btn" :title="t('tools.eta-calculator.useNow')" @click="setNow">
              <icon-mdi-clock-outline />
              {{ t('tools.eta-calculator.now') }}
            </button>
          </label>
          <input
            class="datetime-input"
            type="datetime-local"
            :value="startedAtStr"
            @input="onDateInput"
          >
        </div>
      </div>

      <!-- 行 2：处理速度 -->
      <div class="form-row">
        <label class="field-label field-label--full">{{ t('tools.eta-calculator.speed') }}</label>
        <div class="speed-row">
          <span class="speed-text">{{ t('tools.eta-calculator.per') }}</span>

          <div class="num-wrap num-wrap--sm" :class="{ 'num-wrap--error': timeSpan <= 0 }">
            <button class="num-btn" :disabled="timeSpan <= 1" @click="timeSpan = Math.max(1, timeSpan - 1)">
              <icon-mdi-minus />
            </button>
            <input
              v-model.number="timeSpan"
              class="num-input"
              type="number"
              min="1"
              @blur="timeSpan = Math.max(1, timeSpan || 1)"
            >
            <button class="num-btn" @click="timeSpan++">
              <icon-mdi-plus />
            </button>
          </div>

          <div class="unit-select-wrap">
            <button
              v-for="u in TIME_UNITS"
              :key="u.value"
              class="unit-btn"
              :class="{ 'unit-btn--on': selectedUnit.value === u.value }"
              @click="selectedUnit = u"
            >
              {{ u.label }}
            </button>
          </div>

          <span class="speed-text">{{ t('tools.eta-calculator.complete') }}</span>

          <div class="num-wrap num-wrap--sm" :class="{ 'num-wrap--error': unitPerTimeSpan <= 0 }">
            <button class="num-btn" :disabled="unitPerTimeSpan <= 1" @click="unitPerTimeSpan = Math.max(1, unitPerTimeSpan - 1)">
              <icon-mdi-minus />
            </button>
            <input
              v-model.number="unitPerTimeSpan"
              class="num-input"
              type="number"
              min="1"
              @blur="unitPerTimeSpan = Math.max(1, unitPerTimeSpan || 1)"
            >
            <button class="num-btn" @click="unitPerTimeSpan++">
              <icon-mdi-plus />
            </button>
          </div>

          <span class="speed-text">{{ t('tools.eta-calculator.unit') }}</span>
        </div>
        <transition name="slide-down">
          <p v-if="hasError" class="field-error">
            <icon-mdi-alert-circle-outline />
            {{ t('tools.eta-calculator.allPositive') }}
          </p>
        </transition>
      </div>
    </div>

    <!-- ── 结果区 ───────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="!hasError" class="result-grid">
        <!-- 总耗时 -->
        <div class="result-card">
          <span class="result-label">{{ t('tools.eta-calculator.totalDuration') }}</span>
          <span class="result-value">{{ durationLabel }}</span>
        </div>

        <!-- 预计完成时间 -->
        <div class="result-card result-card--accent">
          <span class="result-label">{{ t('tools.eta-calculator.estimatedEnd') }}</span>
          <span class="result-value">{{ endAtLabel }}</span>
          <span class="result-date">{{ format(endDate, 'yyyy-MM-dd HH:mm:ss') }}</span>
        </div>
      </div>
    </transition>

    <!-- 除零错误提示 -->
    <transition name="fade">
      <div v-if="hasError" class="zero-error">
        <icon-mdi-calculator-variant-outline class="zero-icon" />
        <span>{{ t('tools.eta-calculator.zeroErrorMsg') }}</span>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.eta-root {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ─── 举例横幅 ───────────────────────────────────────────────── */
.example-banner {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 15px;
  border-radius: 8px;
  background: rgba(99,102,241,0.05);
  border: 1px solid rgba(99,102,241,0.14);
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  .dark & { background: rgba(129,140,248,0.06); border-color: rgba(129,140,248,0.16); color: #94a3b8; }
}
.example-icon { font-size: 16px; color: #6366f1; flex-shrink: 0; margin-top: 1px; .dark & { color: #818cf8; } }

/* ─── 输入卡片 ───────────────────────────────────────────────── */
.config-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: #fff;
  padding: 4px 0;
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }
}

.form-row {
  padding: 12px 18px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &--2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    @media (max-width: 540px) { grid-template-columns: 1fr; }
  }

  &:last-child { border-bottom: none; }
  .dark & { border-color: rgba(255,255,255,0.05); }
}

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  .dark & { color: #94a3b8; }

  &--full { width: 100%; }
}

/* ─── 数值步进器 ─────────────────────────────────────────────── */
.num-wrap {
  display: inline-flex;
  align-items: center;
  border-radius: 7px;
  border: 1.5px solid rgba(0,0,0,0.1);
  overflow: hidden;
  background: transparent;
  transition: border-color 0.2s;

  &:focus-within { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
  &--error { border-color: #ef4444 !important; }
  &--sm { flex: 0 0 120px; }

  .dark & { border-color: rgba(255,255,255,0.1); }
  .dark &:focus-within { border-color: #818cf8; }
}

.num-btn {
  width: 30px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0,0,0,0.03);
  color: #475569;
  cursor: pointer;
  font-size: 13px;
  flex-shrink: 0;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: rgba(99,102,241,0.08); color: #6366f1; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  .dark & { background: rgba(255,255,255,0.04); color: #94a3b8; }
  .dark &:hover:not(:disabled) { background: rgba(129,140,248,0.1); color: #a5b4fc; }
}

.num-input {
  flex: 1;
  text-align: center;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  padding: 0 2px;
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  .dark & { color: #e2e8f0; }
}

/* ─── 日期时间输入 ────────────────────────────────────────────── */
.datetime-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 7px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: transparent;
  font-size: 13.5px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'SF Mono', 'Fira Code', monospace;

  &:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
  .dark & { border-color: rgba(255,255,255,0.1); color: #e2e8f0; background: transparent; }
  .dark &:focus { border-color: #818cf8; }
}

.now-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.05);
  color: #6366f1;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.13s;
  text-transform: none;
  letter-spacing: 0;

  &:hover { background: rgba(99,102,241,0.1); }
  .dark & { color: #a5b4fc; border-color: rgba(129,140,248,0.25); }
}

/* ─── 处理速度行 ─────────────────────────────────────────────── */
.speed-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.speed-text { font-size: 14px; color: #64748b; white-space: nowrap; .dark & { color: #94a3b8; } }

.unit-select-wrap {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}
.unit-btn {
  padding: 4px 10px;
  border-radius: 5px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.13s;
  white-space: nowrap;

  &:hover:not(.unit-btn--on) { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.04); }
  &--on { background: #6366f1; border-color: #6366f1; color: #fff; font-weight: 600; }

  .dark & { border-color: rgba(255,255,255,0.09); color: #94a3b8; }
  .dark &.unit-btn--on { background: #818cf8; border-color: #818cf8; color: #1e1b4b; }
}

.field-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  .dark & { color: #f87171; }
}

/* ─── 结果区 ─────────────────────────────────────────────────── */
.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: #fff;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }

  &--accent {
    border-color: rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.03);
    .dark & { background: rgba(129,140,248,0.05); border-color: rgba(129,140,248,0.22); }
  }
}

.result-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
  .dark & { color: #6b7280; }
}

.result-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  .dark & { color: #f1f5f9; }

  .result-card--accent & { color: #4338ca; .dark & { color: #a5b4fc; } }
}

.result-date {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #94a3b8;
  .dark & { color: #6b7280; }
}

/* ─── 除零错误 ───────────────────────────────────────────────── */
.zero-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 10px;
  border: 1.5px dashed rgba(0,0,0,0.1);
  color: #94a3b8;
  font-size: 13px;
  .dark & { border-color: rgba(255,255,255,0.08); color: #4b5563; }
}
.zero-icon { font-size: 22px; opacity: 0.5; }

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-4px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
