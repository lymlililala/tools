<script setup lang="ts">
import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';
import { addDays, addHours, addMinutes, format } from 'date-fns';
import { useCopy } from '@/composable/copy';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { t } = useI18n();

// ── 输入 ──────────────────────────────────────────────────────
const cron = ref('40 * * * *');
const inputEl = ref<HTMLInputElement | null>(null);

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const isValid = computed(() => isCronValid(cron.value));
const hasInput = computed(() => cron.value.trim().length > 0);
const showError = computed(() => hasInput.value && !isValid.value);

// ── 配置 ──────────────────────────────────────────────────────
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

// ── 自然语言描述 ──────────────────────────────────────────────
const cronString = computed(() => {
  if (isValid.value) {
    try {
      return cronstrue.toString(cron.value, cronstrueConfig);
    }
    catch {
      return '';
    }
  }
  return '';
});

// ── 复制 ──────────────────────────────────────────────────────
const { copy, isJustCopied } = useCopy({ source: cron, text: computed(() => t('tools.crontab-generator.copiedTooltip')) });

// ── 接下来 N 次执行时间（纯 JS 实现，无需额外依赖） ────────────
// 解析 cron 字段（支持 *、数字、/步长、范围、逗号列表）
function parseCronField(field: string, min: number, max: number): number[] {
  const results = new Set<number>();

  // 处理逗号分隔
  for (const part of field.split(',')) {
    if (part === '*') {
      for (let i = min; i <= max; i++) {
        results.add(i);
      }
    }
    else if (part.includes('/')) {
      const [rangePart, stepStr] = part.split('/');
      const step = Number.parseInt(stepStr);
      let start = min;
      let end = max;
      if (rangePart !== '*' && rangePart.includes('-')) {
        const [s, e] = rangePart.split('-').map(Number);
        start = s;
        end = e;
      }
      else if (rangePart !== '*') {
        start = Number.parseInt(rangePart);
      }
      for (let i = start; i <= end; i += step) {
        results.add(i);
      }
    }
    else if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      for (let i = s; i <= e; i++) {
        results.add(i);
      }
    }
    else {
      const n = Number.parseInt(part);
      if (!Number.isNaN(n)) {
        results.add(n);
      }
    }
  }

  return Array.from(results).sort((a, b) => a - b);
}

// Macro aliases
function expandAlias(expr: string): string {
  const aliases: Record<string, string> = {
    '@yearly': '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
    '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0',
    '@daily': '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@hourly': '0 * * * *',
  };
  return aliases[expr.trim()] ?? expr;
}

function getNextExecutions(cronExpr: string, count = 5): Date[] {
  if (!isValid.value) {
    return [];
  }

  const expanded = expandAlias(cronExpr.trim());
  const parts = expanded.split(/\s+/);

  // 支持 5 段（分 时 日 月 周）和 6 段（秒 分 时 日 月 周）
  let secField = '0';
  let minField: string;
  let hourField: string;
  let domField: string;
  let monField: string;
  let dowField: string;
  if (parts.length === 6) {
    [secField, minField, hourField, domField, monField, dowField] = parts;
  }
  else if (parts.length === 5) {
    [minField, hourField, domField, monField, dowField] = parts;
  }
  else {
    return [];
  }

  try {
    const seconds = parseCronField(secField, 0, 59);
    const minutes = parseCronField(minField!, 0, 59);
    const hours = parseCronField(hourField!, 0, 23);
    const months = parseCronField(monField!, 1, 12);
    // 支持 "?" 作为通配
    const domAll = domField === '?' || domField === '*';
    const dowAll = dowField === '?' || dowField === '*';
    const doms = domAll ? [] : parseCronField(domField!, 1, 31);
    const dows = dowAll ? [] : parseCronField(dowField!, 0, 6);

    const results: Date[] = [];
    // 从下一分钟开始搜索（最多搜索 10 年的分钟数防止死循环）
    const start = new Date();
    start.setSeconds(seconds[0] ?? 0, 0);
    start.setTime(start.getTime() + 60 * 1000); // 从下一分钟开始

    let cursor = new Date(start);
    const maxIterations = 525960 * 2; // 2 years of minutes
    let iter = 0;

    while (results.length < count && iter < maxIterations) {
      iter++;
      const m = cursor.getMonth() + 1; // 1-12
      const d = cursor.getDate();
      const h = cursor.getHours();
      const min = cursor.getMinutes();
      const dow = cursor.getDay(); // 0=Sunday

      const monthOk = months.includes(m);
      const domOk = domAll ? true : doms.includes(d);
      const dowOk = dowAll ? true : dows.includes(dow);
      // 当 DOM 和 DOW 都指定时，取并集
      const dayOk = (domAll && dowAll)
        ? true
        : (!domAll && !dowAll)
            ? (domOk || dowOk)
            : (domOk && dowOk);
      const hourOk = hours.includes(h);
      const minOk = minutes.includes(min);

      if (monthOk && dayOk && hourOk && minOk) {
        results.push(new Date(cursor));
        cursor = addMinutes(cursor, 1);
      }
      else if (!monthOk) {
        // 跳到下一个月1日0时0分
        cursor.setMonth(cursor.getMonth() + 1, 1);
        cursor.setHours(0, 0, 0, 0);
      }
      else if (!dayOk) {
        // 跳到明天
        cursor = addDays(cursor, 1);
        cursor.setHours(0, 0, 0, 0);
      }
      else if (!hourOk) {
        // 跳到下一小时整点
        cursor = addHours(cursor, 1);
        cursor.setMinutes(0, 0, 0);
      }
      else {
        // 跳到下一分钟
        cursor = addMinutes(cursor, 1);
      }
    }

    return results;
  }
  catch {
    return [];
  }
}

const nextExecutions = computed(() => {
  if (!isValid.value) {
    return [];
  }
  return getNextExecutions(cron.value, 5);
});

function formatExecTime(d: Date): string {
  return format(d, 'yyyy-MM-dd HH:mm');
}

// ── 帮助表格数据 ──────────────────────────────────────────────
const helpers = [
  { symbol: '*', meaning: 'Any value', example: '* * * *', equivalent: 'Every minute' },
  { symbol: '-', meaning: 'Range of values', example: '1-10 * * *', equivalent: 'Minutes 1 through 10' },
  { symbol: ',', meaning: 'List of values', example: '1,10 * * *', equivalent: 'At minutes 1 and 10' },
  { symbol: '/', meaning: 'Step values', example: '*/10 * * *', equivalent: 'Every 10 minutes' },
  { symbol: '@yearly', meaning: 'Once every year at midnight of 1 January', example: '@yearly', equivalent: '0 0 1 1 *' },
  { symbol: '@annually', meaning: 'Same as @yearly', example: '@annually', equivalent: '0 0 1 1 *' },
  { symbol: '@monthly', meaning: 'Once a month at midnight on the first day', example: '@monthly', equivalent: '0 0 1 * *' },
  { symbol: '@weekly', meaning: 'Once a week at midnight on Sunday morning', example: '@weekly', equivalent: '0 0 * * 0' },
  { symbol: '@daily', meaning: 'Once a day at midnight', example: '@daily', equivalent: '0 0 * * *' },
  { symbol: '@midnight', meaning: 'Same as @daily', example: '@midnight', equivalent: '0 0 * * *' },
  { symbol: '@hourly', meaning: 'Once an hour at the beginning of the hour', example: '@hourly', equivalent: '0 * * * *' },
  { symbol: '@reboot', meaning: 'Run at startup', example: '', equivalent: '' },
];

// ── 页面加载自动聚焦 ──────────────────────────────────────────
onMounted(() => nextTick(() => inputEl.value?.focus()));
</script>

<template>
  <c-card>
    <!-- ── 表达式输入区 ─────────────────────────────────────── -->
    <div class="input-wrapper" :class="{ 'is-error': showError, 'is-valid': hasInput && isValid }">
      <input
        ref="inputEl"
        v-model="cron"
        class="cron-input"
        placeholder="* * * * *"
        spellcheck="false"
        autocomplete="off"
      >
      <!-- 复制按钮 -->
      <button
        class="copy-btn"
        :class="{ copied: isJustCopied }"
        :title="isJustCopied ? t('tools.crontab-generator.copiedTooltip') : t('tools.crontab-generator.copyTooltip')"
        :disabled="!isValid"
        @click="copy()"
      >
        <svg v-if="!isJustCopied" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ isJustCopied ? t('tools.crontab-generator.copied') : t('tools.crontab-generator.copy') }}</span>
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="showError" class="error-msg">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      {{ t('tools.crontab-generator.invalidCron') }}
    </div>

    <!-- 自然语言描述 -->
    <div v-else-if="cronString" class="cron-string">
      {{ cronString }}
    </div>
    <div v-else class="cron-string cron-string--placeholder">
      {{ t('tools.crontab-generator.inputPlaceholder') }}
    </div>

    <n-divider />

    <!-- ── 配置开关 ──────────────────────────────────────────── -->
    <div flex justify-center>
      <n-form :show-feedback="false" label-width="170" label-placement="left">
        <n-form-item label="Verbose">
          <n-switch v-model:value="cronstrueConfig.verbose" />
        </n-form-item>
        <n-form-item label="Use 24 hour time format">
          <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
        </n-form-item>
        <n-form-item label="Days start at 0">
          <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
        </n-form-item>
      </n-form>
    </div>

    <!-- ── 接下来5次执行时间 ──────────────────────────────────── -->
    <template v-if="isValid && nextExecutions.length > 0">
      <n-divider />
      <div class="next-exec-section">
        <div class="next-exec-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          {{ t('tools.crontab-generator.nextExecutions') }}
        </div>
        <div class="next-exec-list">
          <div v-for="(d, i) in nextExecutions" :key="i" class="exec-row">
            <span class="exec-index">{{ i + 1 }}</span>
            <span class="exec-time">{{ formatExecTime(d) }}</span>
          </div>
        </div>
      </div>
    </template>
  </c-card>

  <!-- ── 语法参考卡片 ─────────────────────────────────────────── -->
  <c-card>
    <pre class="cron-diagram">
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

    <div v-if="styleStore.isSmallScreen">
      <c-card v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol" mb-3 important:border-none>
        <div>Symbol: <strong>{{ symbol }}</strong></div>
        <div>Meaning: <strong>{{ meaning }}</strong></div>
        <div>Example: <strong><code>{{ example }}</code></strong></div>
        <div>Equivalent: <strong>{{ equivalent }}</strong></div>
      </c-card>
    </div>
    <c-table v-else :data="helpers" />
  </c-card>
</template>

<style lang="less" scoped>
/* ── 输入包装器 ──────────────────────────────────────────────── */
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto 8px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 6px 10px 6px 16px;
  background: #fafafa;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    background: #fff;
  }

  &.is-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    background: #fff5f5;
  }

  &.is-valid:not(:focus-within) {
    border-color: #d1d5db;
  }

  // Dark mode
  .dark & {
    background: #1e1e1e;
    border-color: #333;

    &:focus-within {
      border-color: #6366f1;
      background: #1a1a2e;
    }

    &.is-error {
      border-color: #ef4444;
      background: #2a1515;
    }
  }
}

/* ── Cron 输入框 ─────────────────────────────────────────────── */
.cron-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 28px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 500;
  text-align: center;
  color: #1a1a1a;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  caret-color: #6366f1;

  .dark & {
    color: #f0f0f0;
  }

  &::placeholder {
    color: #bbb;
    .dark & { color: #555; }
  }
}

/* ── 复制按钮 ────────────────────────────────────────────────── */
.copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  background: transparent;
  color: #666;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.06);
  }

  &.copied {
    border-color: #22c55e;
    color: #16a34a;
    background: rgba(34, 197, 94, 0.08);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .dark & {
    border-color: #3a3a3a;
    color: #aaa;

    &:hover:not(:disabled) {
      border-color: #6366f1;
      color: #a5b4fc;
    }

    &.copied {
      border-color: #22c55e;
      color: #4ade80;
      background: rgba(34, 197, 94, 0.1);
    }
  }
}

/* ── 错误提示 ────────────────────────────────────────────────── */
.error-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 13px;
  color: #ef4444;
  margin: 6px 0 12px;
}

/* ── 自然语言描述 ────────────────────────────────────────────── */
.cron-string {
  text-align: center;
  font-size: 16px;
  color: #444;
  margin: 8px 0 4px;
  min-height: 24px;
  line-height: 1.6;

  .dark & { color: #ccc; }

  &--placeholder {
    color: #bbb;
    font-style: italic;
    .dark & { color: #555; }
  }
}

/* ── 接下来执行时间 ───────────────────────────────────────────── */
.next-exec-section {
  max-width: 320px;
  margin: 0 auto;
}

.next-exec-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  margin-bottom: 10px;

  .dark & { color: #666; }
}

.next-exec-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exec-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-radius: 6px;
  background: #f8f9fb;
  transition: background 0.15s;

  &:hover { background: #f0f1ff; }

  .dark & {
    background: #1e1e1e;
    &:hover { background: #252535; }
  }
}

.exec-index {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .dark & {
    background: #2d2d5a;
    color: #a5b4fc;
  }
}

.exec-time {
  font-size: 13.5px;
  font-variant-numeric: tabular-nums;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: #333;

  .dark & { color: #ddd; }
}

/* ── 语法图示 ────────────────────────────────────────────────── */
.cron-diagram {
  overflow: auto;
  padding: 10px 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #555;

  .dark & { color: #aaa; }
}
</style>
