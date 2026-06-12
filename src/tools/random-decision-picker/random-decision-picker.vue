<script setup lang="ts">
const { t } = useI18n();

// 选项列表
const inputText = ref('');
const options = ref<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
const duplicateWarning = ref(false);
let duplicateTimer: ReturnType<typeof setTimeout> | null = null;

// 转盘状态
const isSpinning = ref(false);
const selectedIndex = ref<number | null>(null);
const showResult = ref(false);

function addOption() {
  const text = inputText.value.trim();
  if (!text) {
    return;
  }
  if (options.value.includes(text)) {
    // 提示重复
    duplicateWarning.value = true;
    if (duplicateTimer) {
      clearTimeout(duplicateTimer);
    }
    duplicateTimer = setTimeout(() => (duplicateWarning.value = false), 2200);
    return;
  }
  options.value.push(text);
  inputText.value = '';
  duplicateWarning.value = false;
}

function removeOption(index: number) {
  options.value.splice(index, 1);
  showResult.value = false;
  selectedIndex.value = null;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    addOption();
  }
}

// 颜色列表
const COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#10b981',
  '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444',
  '#14b8a6', '#f472b6', '#84cc16', '#06b6d4',
];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

// 转盘画布
const canvasRef = ref<HTMLCanvasElement | null>(null);
// 响应式 canvas 尺寸
const containerRef = ref<HTMLDivElement | null>(null);
const canvasSize = ref(280);

function updateCanvasSize() {
  if (containerRef.value) {
    const w = containerRef.value.offsetWidth;
    // 在移动端下约束转盘最大占宽 90%
    canvasSize.value = Math.min(Math.max(w - 16, 200), 320);
  }
}

function drawWheel(extraRotation = 0) {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const size = canvasSize.value;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const count = options.value.length;

  ctx.clearRect(0, 0, size, size);

  if (count === 0) {
    // 空状态：绘制灰色圆圈 + 提示
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('tools.random-decision-picker.noOptions'), cx, cy);
    return;
  }

  const sliceAngle = (2 * Math.PI) / count;
  for (let i = 0; i < count; i++) {
    const startAngle = extraRotation + i * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;

    // 高亮选中扇形
    const isSelected = showResult.value && selectedIndex.value === i;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, isSelected ? r + 4 : r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = getColor(i);
    ctx.globalAlpha = isSelected ? 1 : 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 文字
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'white';
    const fontSize = count > 12 ? 10 : count > 8 ? 11 : 13;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 3;
    const maxLen = count > 8 ? 10 : 14;
    const label = options.value[i].length > maxLen ? `${options.value[i].slice(0, maxLen)}…` : options.value[i];
    ctx.fillText(label, r - 10, 5);
    ctx.restore();
  }

  // 中心圆
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 动画
let animationId: ReturnType<typeof requestAnimationFrame> | null = null;
const currentRotation = ref(0);

// 空状态提示
const showEmptyWarning = ref(false);
let emptyWarnTimer: ReturnType<typeof setTimeout> | null = null;

function spinWheel() {
  if (isSpinning.value) {
    return;
  }
  if (options.value.length < 2) {
    showEmptyWarning.value = true;
    if (emptyWarnTimer) {
      clearTimeout(emptyWarnTimer);
    }
    emptyWarnTimer = setTimeout(() => (showEmptyWarning.value = false), 2500);
    return;
  }
  isSpinning.value = true;
  showResult.value = false;
  selectedIndex.value = null;

  const targetIndex = Math.floor(Math.random() * options.value.length);
  const sliceAngle = (2 * Math.PI) / options.value.length;
  const targetAngle = 2 * Math.PI * (5 + Math.random() * 3) + (2 * Math.PI - targetIndex * sliceAngle - sliceAngle / 2);

  const startRotation = currentRotation.value;
  const endRotation = startRotation + targetAngle;
  const duration = 4000 + Math.random() * 1000;
  const startTime = performance.now();

  function easeOut(t: number) {
    return 1 - (1 - t) ** 4;
  }

  function animate(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);
    const rot = startRotation + (endRotation - startRotation) * eased;
    currentRotation.value = rot;
    drawWheel(rot);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    }
    else {
      isSpinning.value = false;
      selectedIndex.value = targetIndex;
      showResult.value = true;
      drawWheel(rot); // 重绘高亮
    }
  }

  animationId = requestAnimationFrame(animate);
}

// 快速选择（不旋转）
function quickPick() {
  if (options.value.length === 0) {
    showEmptyWarning.value = true;
    if (emptyWarnTimer) {
      clearTimeout(emptyWarnTimer);
    }
    emptyWarnTimer = setTimeout(() => (showEmptyWarning.value = false), 2500);
    return;
  }
  selectedIndex.value = Math.floor(Math.random() * options.value.length);
  showResult.value = true;
}

// 监听选项/canvasSize变化重绘
watch(
  [options, canvasRef, canvasSize],
  () => {
    nextTick(() => drawWheel(currentRotation.value));
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  updateCanvasSize();
  window.addEventListener('resize', () => {
    updateCanvasSize();
    nextTick(() => drawWheel(currentRotation.value));
  });
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

const presets = computed(() => [
  { label: t('tools.random-decision-picker.presetYesNo'), items: [t('tools.random-decision-picker.yes'), t('tools.random-decision-picker.no')] },
  { label: t('tools.random-decision-picker.presetFood'), items: [t('tools.random-decision-picker.food1'), t('tools.random-decision-picker.food2'), t('tools.random-decision-picker.food3'), t('tools.random-decision-picker.food4')] },
  { label: t('tools.random-decision-picker.presetDays'), items: [t('tools.random-decision-picker.mon'), t('tools.random-decision-picker.tue'), t('tools.random-decision-picker.wed'), t('tools.random-decision-picker.thu'), t('tools.random-decision-picker.fri'), t('tools.random-decision-picker.sat'), t('tools.random-decision-picker.sun')] },
]);

function applyPreset(items: string[]) {
  options.value = [...items];
  showResult.value = false;
  selectedIndex.value = null;
}

// 单选项时的状态文字
const spinBtnDisabled = computed(() => isSpinning.value || options.value.length < 2);
const spinBtnTitle = computed(() => {
  if (options.value.length === 0) {
    return t('tools.random-decision-picker.needMoreOptions');
  }
  if (options.value.length === 1) {
    return t('tools.random-decision-picker.needMoreOptions');
  }
  return '';
});
</script>

<template>
  <div style="max-width: 780px; margin: 0 auto; padding: 0 4px">
    <!-- 空状态 / 重复提示横幅 -->
    <transition name="fade-banner">
      <div v-if="showEmptyWarning" class="warn-banner">
        ⚠️ {{ options.length === 0 ? t('tools.random-decision-picker.needAtLeastTwo') : t('tools.random-decision-picker.needMoreOptions') }}
      </div>
      <div v-else-if="duplicateWarning" class="warn-banner warn-banner--info">
        ℹ️ {{ t('tools.random-decision-picker.duplicateOption') }}
      </div>
    </transition>

    <div class="main-grid">
      <!-- 右边（移动端在上）：选项编辑 -->
      <div class="options-panel">
        <c-card>
          <template #title>
            {{ t('tools.random-decision-picker.options') }}
            <span class="options-count">{{ options.length }}</span>
          </template>

          <div class="input-row">
            <n-input
              v-model:value="inputText"
              :placeholder="t('tools.random-decision-picker.addOption')"
              :status="duplicateWarning ? 'warning' : undefined"
              class="option-input"
              @keydown="handleKeydown"
            />
            <n-button
              type="primary"
              :disabled="!inputText.trim()"
              class="add-btn"
              @click="addOption"
            >
              +
            </n-button>
          </div>

          <div class="options-list">
            <transition-group name="list">
              <div
                v-for="(opt, i) in options"
                :key="opt + i"
                class="option-item"
                :class="{ 'option-item--selected': showResult && selectedIndex === i }"
              >
                <div class="option-dot" :style="{ background: getColor(i) }" />
                <span class="option-text" :title="opt">{{ opt }}</span>
                <n-button
                  text
                  type="error"
                  size="small"
                  class="remove-btn"
                  :aria-label="t('tools.random-decision-picker.remove')"
                  @click="removeOption(i)"
                >
                  ✕
                </n-button>
              </div>
            </transition-group>
            <div v-if="options.length === 0" class="empty-list">
              {{ t('tools.random-decision-picker.noOptions') }}
            </div>
          </div>
        </c-card>

        <!-- 预设 -->
        <c-card>
          <template #title>
            {{ t('tools.random-decision-picker.presets') }}
          </template>
          <div class="preset-row">
            <button
              v-for="preset in presets"
              :key="preset.label"
              class="preset-btn"
              @click="applyPreset(preset.items)"
            >
              {{ preset.label }}
            </button>
          </div>
        </c-card>
      </div>

      <!-- 左边（移动端在下）：转盘 -->
      <div ref="containerRef" class="wheel-panel">
        <div class="wheel-wrap">
          <!-- 指针 -->
          <div class="wheel-pointer">
            ▼
          </div>
          <canvas
            ref="canvasRef"
            :width="canvasSize"
            :height="canvasSize"
            class="wheel-canvas"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="spin-actions">
          <n-button
            type="primary"
            size="large"
            :disabled="spinBtnDisabled"
            :title="spinBtnTitle"
            class="spin-btn"
            @click="spinWheel"
          >
            <template v-if="isSpinning">
              <span class="spinning-icon">⟳</span>
              {{ t('tools.random-decision-picker.spinning') }}
            </template>
            <template v-else>
              🎯 {{ t('tools.random-decision-picker.spin') }}
            </template>
          </n-button>
          <n-button
            size="large"
            :disabled="isSpinning || options.length === 0"
            class="quick-btn"
            @click="quickPick"
          >
            {{ t('tools.random-decision-picker.quickPick') }}
          </n-button>
        </div>

        <!-- 结果卡片 -->
        <transition name="fade-up">
          <div v-if="showResult && selectedIndex !== null" class="result-card">
            <div class="result-label">
              {{ t('tools.random-decision-picker.result') }}
            </div>
            <div class="result-value" :style="{ color: getColor(selectedIndex) }">
              🎉 {{ options[selectedIndex] }}
            </div>
          </div>
        </transition>

        <!-- 单选项提示 -->
        <div v-if="options.length === 1" class="single-hint">
          {{ t('tools.random-decision-picker.needMoreOptions') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
/* ---- 主布局：移动端上下堆叠，选项在上；桌面端左转盘右列表 ---- */
.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  /* 移动端：options-panel 先渲染（order: 1），wheel-panel 后（order: 2） */
  .options-panel { order: 1; }
  .wheel-panel    { order: 2; }

  @media (min-width: 680px) {
    grid-template-columns: 1fr 1fr;

    /* 桌面端：转盘在左（order: 1），选项在右（order: 2） */
    .wheel-panel    { order: 1; }
    .options-panel  { order: 2; }
  }
}

/* ---- 转盘区 ---- */
.wheel-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.wheel-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.wheel-pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 26px;
  color: #f97316;
  z-index: 10;
  text-shadow: 0 2px 8px rgba(0,0,0,0.22);
  line-height: 1;
}

.wheel-canvas {
  display: block;
  border-radius: 50%;
  box-shadow: 0 6px 32px rgba(0,0,0,0.16);
}

/* ---- 操作按钮区 ---- */
.spin-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.spin-btn {
  min-width: 130px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.quick-btn {
  /* 幽灵按钮：带边框，次级 */
  border: 1.5px solid var(--n-border-color, #d1d5db) !important;
  font-size: 14px;
}

.spinning-icon {
  display: inline-block;
  animation: spin 0.7s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- 结果卡片 ---- */
.result-card {
  width: 100%;
  text-align: center;
  background: var(--n-color, #fff);
  border: 2px solid;
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 2px 12px rgba(99,102,241,0.12);
  border-color: rgba(99,102,241,0.25);
}

.result-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--n-text-color-3, #9ca3af);
  margin-bottom: 6px;
}

.result-value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  word-break: break-word;
}

/* ---- 输入行 ---- */
.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.option-input {
  flex: 1;
}

.add-btn {
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 700;
  min-width: 38px;
}

/* ---- 选项列表 ---- */
.options-list {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.15) transparent;
}

.options-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  padding: 0 5px;
  margin-left: 6px;
  vertical-align: middle;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, #e5e7eb);
  transition: background 0.15s, border-color 0.2s, transform 0.15s;
  cursor: default;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.25);
  }

  &--selected {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(99, 102, 241, 0.07);
    transform: translateX(2px);
  }
}

.option-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--n-text-color, #1f2937);
}

.remove-btn {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.15s, transform 0.15s;

  &:hover {
    opacity: 1;
    transform: scale(1.2);
  }
}

.empty-list {
  text-align: center;
  color: #9ca3af;
  padding: 20px 16px;
  font-size: 13px;
  border: 1.5px dashed #e5e7eb;
  border-radius: 8px;
}

/* ---- 预设按钮 ---- */
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  appearance: none;
  cursor: pointer;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--n-color, #f9fafb);
  border: 1.5px solid var(--n-border-color, #d1d5db);
  color: var(--n-text-color, #374151);
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  line-height: 1.5;

  &:hover {
    background: rgba(99,102,241,0.08);
    border-color: rgba(99,102,241,0.45);
    color: #6366f1;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
}

/* ---- 警告横幅 ---- */
.warn-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: #c2410c;

  &--info {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
    color: #4338ca;
  }
}

/* 单选项提示 */
.single-hint {
  font-size: 12px;
  color: #f59e0b;
  text-align: center;
  font-weight: 500;
}

/* ---- 过渡动画 ---- */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-banner-enter-active,
.fade-banner-leave-active {
  transition: all 0.25s ease;
}

.fade-banner-enter-from,
.fade-banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* ---- 深色模式 ---- */
@media (prefers-color-scheme: dark) {
  .empty-list {
    border-color: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.35);
  }

  .preset-btn {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.75);

    &:hover {
      background: rgba(99,102,241,0.15);
      border-color: rgba(99,102,241,0.5);
      color: #a5b4fc;
    }
  }

  .warn-banner {
    background: rgba(249, 115, 22, 0.12);
    border-color: rgba(249, 115, 22, 0.25);
    color: #fb923c;

    &--info {
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
    }
  }

  .result-card {
    border-color: rgba(99,102,241,0.3);
    box-shadow: 0 2px 16px rgba(99,102,241,0.1);
  }

  .option-item--selected {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.4);
  }
}
</style>
