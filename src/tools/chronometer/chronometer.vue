<script setup lang="ts">
import { useRafFn } from '@vueuse/core';
import { formatMs } from './chronometer.service';

const { t } = useI18n();

// ─── 状态 ──────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'running' | 'paused';

const status = ref<Status>('idle');
const counter = ref(0);

// 分段记录
interface Lap {
  index: number
  elapsed: number // 本段耗时（距上一个 lap）
  total: number // 总累计时间
}
const laps = ref<Lap[]>([]);
let lastLapTotal = 0;

// 复制状态
const copiedIndex = ref<number | null>(null);

// ─── RAF 计时 ─────────────────────────────────────────────────────────────────
let previousRafDate = Date.now();
const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
  () => {
    const now = Date.now();
    counter.value += now - previousRafDate;
    previousRafDate = now;
  },
  { immediate: false },
);

// ─── 控制函数 ─────────────────────────────────────────────────────────────────
function start() {
  previousRafDate = Date.now();
  resumeRaf();
  status.value = 'running';
}

function pause() {
  pauseRaf();
  status.value = 'paused';
}

function resume() {
  previousRafDate = Date.now();
  resumeRaf();
  status.value = 'running';
}

function reset() {
  pauseRaf();
  counter.value = 0;
  laps.value = [];
  lastLapTotal = 0;
  status.value = 'idle';
}

function lap() {
  if (status.value !== 'running') {
    return;
  }
  const elapsed = counter.value - lastLapTotal;
  laps.value.unshift({ index: laps.value.length + 1, elapsed, total: counter.value });
  lastLapTotal = counter.value;
}

// ─── 复制分段时间 ─────────────────────────────────────────────────────────────
function copyLap(index: number, val: string) {
  navigator.clipboard.writeText(val).then(() => {
    copiedIndex.value = index;
    setTimeout(() => {
      if (copiedIndex.value === index) {
        copiedIndex.value = null;
      }
    }, 2000);
  });
}

// 当前分段经过时间（实时）
const currentLapElapsed = computed(() => counter.value - lastLapTotal);

// 是否有过分段
const hasLaps = computed(() => laps.value.length > 0);
</script>

<template>
  <div class="ch-root">
    <!-- ══════════════ 计时面板 ════════════════════════════════════════════════ -->
    <div class="timer-panel" :class="`timer-panel--${status}`">
      <!-- 运行状态指示点 -->
      <div class="status-dot-wrap">
        <span class="status-dot" :class="`status-dot--${status}`" />
        <span class="status-label">
          {{ status === 'idle' ? t('tools.chronometer.idle') : status === 'running' ? t('tools.chronometer.running') : t('tools.chronometer.paused') }}
        </span>
      </div>

      <!-- 主计时数字 -->
      <div class="timer-display">
        {{ formatMs(counter) }}
      </div>

      <!-- 当前分段实时耗时（运行时且有至少一个 lap） -->
      <transition name="fade-sub">
        <div v-if="status === 'running' && hasLaps" class="lap-current">
          {{ t('tools.chronometer.currentLap') }}: {{ formatMs(currentLapElapsed) }}
        </div>
      </transition>
    </div>

    <!-- ══════════════ 控制按钮 ════════════════════════════════════════════════ -->
    <div class="btn-row">
      <!-- 开始 -->
      <button v-if="status === 'idle'" class="ctrl-btn ctrl-btn--start" @click="start">
        <icon-mdi-play />
        {{ t('tools.chronometer.start') }}
      </button>

      <!-- 暂停（运行中） -->
      <button v-if="status === 'running'" class="ctrl-btn ctrl-btn--pause" @click="pause">
        <icon-mdi-pause />
        {{ t('tools.chronometer.pause') }}
      </button>

      <!-- 继续（已暂停） -->
      <button v-if="status === 'paused'" class="ctrl-btn ctrl-btn--resume" @click="resume">
        <icon-mdi-play />
        {{ t('tools.chronometer.resume') }}
      </button>

      <!-- 分段（运行时才显示） -->
      <button v-if="status === 'running'" class="ctrl-btn ctrl-btn--lap" @click="lap">
        <icon-mdi-flag-outline />
        {{ t('tools.chronometer.lap') }}
      </button>

      <!-- 重置（非 idle 时可用） -->
      <button class="ctrl-btn ctrl-btn--reset" :disabled="status === 'idle'" @click="reset">
        <icon-mdi-refresh />
        {{ t('tools.chronometer.reset') }}
      </button>
    </div>

    <!-- ══════════════ 分段记录 ════════════════════════════════════════════════ -->
    <transition name="slide-down">
      <div v-if="hasLaps" class="lap-section">
        <div class="lap-header">
          <span class="lap-title">{{ t('tools.chronometer.lapHistory') }}</span>
          <span class="lap-count">{{ t('tools.chronometer.lapCount', { n: laps.length }) }}</span>
        </div>

        <div class="lap-table">
          <!-- 表头 -->
          <div class="lap-row lap-row--head">
            <span class="lc lc--idx">{{ t('tools.chronometer.lapIndex') }}</span>
            <span class="lc lc--elapsed">{{ t('tools.chronometer.lapElapsed') }}</span>
            <span class="lc lc--total">{{ t('tools.chronometer.lapTotal') }}</span>
            <span class="lc lc--copy" />
          </div>

          <!-- 分段数据行 -->
          <div
            v-for="row in laps"
            :key="row.index"
            class="lap-row"
            :class="{ 'lap-row--best': row.elapsed === Math.min(...laps.map(l => l.elapsed)), 'lap-row--worst': laps.length > 1 && row.elapsed === Math.max(...laps.map(l => l.elapsed)) }"
          >
            <span class="lc lc--idx">
              <span class="lap-badge">{{ row.index }}</span>
            </span>
            <span class="lc lc--elapsed">{{ formatMs(row.elapsed) }}</span>
            <span class="lc lc--total">{{ formatMs(row.total) }}</span>
            <span class="lc lc--copy">
              <button
                class="lap-copy-btn"
                :title="t('tools.chronometer.copyLap')"
                @click="copyLap(row.index, formatMs(row.elapsed))"
              >
                <icon-mdi-check v-if="copiedIndex === row.index" />
                <icon-mdi-content-copy v-else />
              </button>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="less">
/* ── 根容器 ─────────────────────────────────────────────── */
.ch-root {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-bottom: 32px;
}

/* ── 计时面板 ───────────────────────────────────────────── */
.timer-panel {
  width: 100%;
  background: var(--n-color, #fff);
  border: 2px solid var(--n-border-color, rgba(0,0,0,.08));
  border-radius: 20px;
  padding: 28px 24px 22px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,.07);
  transition: border-color 0.3s, box-shadow 0.3s;

  &--running {
    border-color: rgba(22,163,74,.4);
    box-shadow: 0 4px 28px rgba(22,163,74,.12);
  }

  &--paused {
    border-color: rgba(245,158,11,.4);
    box-shadow: 0 4px 28px rgba(245,158,11,.1);
  }
}

/* ── 状态指示 ───────────────────────────────────────────── */
.status-dot-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0,0,0,.2);

  &--running {
    background: #16a34a;
    animation: pulse 1.2s ease-in-out infinite;
  }
  &--paused {
    background: #f59e0b;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.status-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--n-text-color-3, #aaa);

  .timer-panel--running & { color: #16a34a; }
  .timer-panel--paused & { color: #f59e0b; }
}

/* ── 计时数字 ───────────────────────────────────────────── */
.timer-display {
  font-size: 52px;
  font-weight: 700;
  font-family: 'Fira Code', 'Consolas', 'SF Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--n-text-color-1, #111);
  line-height: 1.15;
  transition: color 0.3s;

  .timer-panel--running & { color: #111; }
  .timer-panel--paused & { color: #f59e0b; }
}

/* ── 当前分段时间 ────────────────────────────────────────── */
.lap-current {
  margin-top: 10px;
  font-size: 13px;
  font-family: 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-3, #888);
}

/* ── 控制按钮行 ─────────────────────────────────────────── */
.btn-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s, opacity 0.15s;
  white-space: nowrap;

  &:active:not(:disabled) { transform: scale(0.96); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }

  /* 开始：绿色，高对比度 */
  &--start {
    background: #16a34a;
    color: #fff;
    box-shadow: 0 3px 12px rgba(22,163,74,.35);

    &:hover { background: #15803d; }
  }

  /* 暂停：橙色 */
  &--pause {
    background: #f59e0b;
    color: #fff;
    box-shadow: 0 3px 12px rgba(245,158,11,.3);

    &:hover { background: #d97706; }
  }

  /* 继续：蓝色 */
  &--resume {
    background: #6366f1;
    color: #fff;
    box-shadow: 0 3px 12px rgba(99,102,241,.3);

    &:hover { background: #4f46e5; }
  }

  /* 分段：浅色描边 */
  &--lap {
    background: transparent;
    color: #6366f1;
    border: 2px solid rgba(99,102,241,.4);

    &:hover {
      background: rgba(99,102,241,.08);
      border-color: #6366f1;
    }
  }

  /* 重置：浅灰 */
  &--reset {
    background: rgba(0,0,0,.06);
    color: var(--n-text-color-2, #555);

    &:hover:not(:disabled) { background: rgba(239,68,68,.1); color: #dc2626; }
  }
}

/* ── 分段记录 ───────────────────────────────────────────── */
.lap-section {
  width: 100%;
}

.lap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 2px;
}

.lap-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-2, #444);
}

.lap-count {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
}

.lap-table {
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, rgba(0,0,0,.08));
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
}

.lap-row {
  display: grid;
  grid-template-columns: 52px 1fr 1fr 36px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.05));
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(0,0,0,.025); }

  &--head {
    background: var(--n-color-modal, rgba(0,0,0,.03));
    border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.08));

    &:hover { background: var(--n-color-modal, rgba(0,0,0,.03)); }
  }

  /* 最快段 */
  &--best .lc--elapsed {
    color: #16a34a;
    font-weight: 700;
  }
  /* 最慢段 */
  &--worst .lc--elapsed {
    color: #dc2626;
    font-weight: 700;
  }
}

.lc {
  font-size: 13px;
  font-family: 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-1, #333);

  &--idx {
    font-family: inherit;
    display: flex;
    align-items: center;
  }

  &--elapsed {
    text-align: center;
    color: var(--n-text-color-1, #222);
  }

  &--total {
    text-align: center;
    color: var(--n-text-color-3, #888);
    font-size: 12px;
  }

  &--copy {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

/* 表头样式 */
.lap-row--head .lc {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--n-text-color-3, #999);
  font-family: inherit;
}

.lap-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(99,102,241,.12);
  color: #6366f1;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  flex-shrink: 0;
}

.lap-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 5px;
  cursor: pointer;
  color: var(--n-text-color-3, #ccc);
  font-size: 14px;
  transition: color 0.15s, background 0.15s;

  &:hover { color: #6366f1; background: rgba(99,102,241,.1); }
}

/* ── 过渡动画 ───────────────────────────────────────────── */
.fade-sub-enter-active,
.fade-sub-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-sub-enter-from,
.fade-sub-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.35s ease, opacity 0.28s ease;
  overflow: hidden;
  max-height: 800px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── 响应式 ─────────────────────────────────────────────── */
@media (max-width: 480px) {
  .timer-display {
    font-size: 38px;
  }

  .ctrl-btn {
    padding: 10px 18px;
    font-size: 14px;
  }

  .lap-row {
    grid-template-columns: 44px 1fr 1fr 30px;
    padding: 9px 10px;
  }
}
</style>
