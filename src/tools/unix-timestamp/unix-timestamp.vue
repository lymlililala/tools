<script setup lang="ts">
import { format, fromUnixTime, getUnixTime, parseISO } from 'date-fns';

const { t } = useI18n();

// 实时当前时间
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval>;
onMounted(() => { timer = setInterval(() => { now.value = Date.now(); }, 1000); });
onUnmounted(() => clearInterval(timer));

const currentTimestamp = computed(() => Math.floor(now.value / 1000));
const currentMs = computed(() => now.value);

// 时间戳 → 日期
const tsInput = ref<string>(String(Math.floor(Date.now() / 1000)));
const isMs = ref(false);

function parseTs(ts: string, ms: boolean): Date | null {
  const trimmed = ts.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (Number.isNaN(n)) return null;
  try {
    return ms ? new Date(n) : fromUnixTime(n);
  }
  catch { return null; }
}

const parsedDate = computed(() => parseTs(tsInput.value, isMs.value));

const tsResults = computed(() => {
  const d = parsedDate.value;
  if (!d || Number.isNaN(d.getTime())) return null;
  return {
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm:ss'),
    unix: Math.floor(d.getTime() / 1000),
    ms: d.getTime(),
    weekday: format(d, 'EEEE'),
    relative: getRelative(d),
  };
});

function getRelative(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (Math.abs(diff) < 60) return `${diff >= 0 ? diff : -diff} seconds ${diff >= 0 ? 'ago' : 'from now'}`;
  if (Math.abs(diff) < 3600) return `${Math.floor(Math.abs(diff) / 60)} minutes ${diff >= 0 ? 'ago' : 'from now'}`;
  if (Math.abs(diff) < 86400) return `${Math.floor(Math.abs(diff) / 3600)} hours ${diff >= 0 ? 'ago' : 'from now'}`;
  return `${Math.floor(Math.abs(diff) / 86400)} days ${diff >= 0 ? 'ago' : 'from now'}`;
}

// 日期 → 时间戳
const dateInput = ref(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));

const dateResults = computed(() => {
  try {
    const d = new Date(dateInput.value);
    if (Number.isNaN(d.getTime())) return null;
    return {
      unix: Math.floor(d.getTime() / 1000),
      ms: d.getTime(),
    };
  }
  catch { return null; }
});

function useNow() {
  tsInput.value = String(currentTimestamp.value);
  isMs.value = false;
}
</script>

<template>
  <div style="max-width: 720px; margin: 0 auto">
    <!-- 当前时间 -->
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

    <!-- 时间戳 → 日期 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.unix-timestamp.tsToDate') }}
      </template>
      <div flex gap-3 items-end flex-wrap mb-3>
        <n-form-item :label="t('tools.unix-timestamp.timestamp')" style="flex:1; min-width:200px">
          <n-input v-model:value="tsInput" :placeholder="String(currentTimestamp)" />
        </n-form-item>
        <n-form-item label=" " style="min-width:140px">
          <n-checkbox v-model:checked="isMs">
            {{ t('tools.unix-timestamp.inMs') }}
          </n-checkbox>
        </n-form-item>
        <c-button @click="useNow">
          {{ t('tools.unix-timestamp.useNow') }}
        </c-button>
      </div>

      <div v-if="tsResults" class="result-table">
        <div v-for="(val, key) in tsResults" :key="key" class="result-row">
          <span class="result-key">{{ key }}</span>
          <c-text-copyable :value="String(val)" class="result-val mono" />
        </div>
      </div>
      <n-alert v-else type="error" mt-2>
        Invalid timestamp
      </n-alert>
    </c-card>

    <!-- 日期 → 时间戳 -->
    <c-card>
      <template #title>
        {{ t('tools.unix-timestamp.dateToTs') }}
      </template>
      <n-form-item :label="t('tools.unix-timestamp.dateString')" mb-3>
        <n-input v-model:value="dateInput" placeholder="2024-01-01T00:00:00" style="width:100%; font-family:monospace" />
      </n-form-item>

      <div v-if="dateResults" class="result-table">
        <div class="result-row">
          <span class="result-key">Unix (seconds)</span>
          <c-text-copyable :value="String(dateResults.unix)" class="result-val mono" />
        </div>
        <div class="result-row">
          <span class="result-key">Milliseconds</span>
          <c-text-copyable :value="String(dateResults.ms)" class="result-val mono" />
        </div>
      </div>
      <n-alert v-else type="error" mt-2>
        Invalid date string
      </n-alert>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.current-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.current-item {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
}

.current-label {
  font-size: 11px;
  opacity: 0.5;
  margin-bottom: 6px;
}

.current-value {
  font-size: 14px;
}

.mono {
  font-family: monospace;
}

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

  &:last-child {
    border-bottom: none;
  }
}

.result-key {
  font-size: 13px;
  opacity: 0.6;
  min-width: 130px;
  flex-shrink: 0;
}

.result-val {
  font-size: 13px;
  word-break: break-all;
}
</style>
