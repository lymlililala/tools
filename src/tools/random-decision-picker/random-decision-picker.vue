<script setup lang="ts">
const { t } = useI18n();

// 选项列表
const inputText = ref('');
const options = ref<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);

function addOption() {
  const text = inputText.value.trim();
  if (text && !options.value.includes(text)) {
    options.value.push(text);
  }
  inputText.value = '';
}

function removeOption(index: number) {
  options.value.splice(index, 1);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') addOption();
}

// 转盘状态
const isSpinning = ref(false);
const rotation = ref(0);
const selectedIndex = ref<number | null>(null);
const showResult = ref(false);

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
const canvasSize = 320;
const centerX = canvasSize / 2;
const centerY = canvasSize / 2;
const radius = canvasSize / 2 - 8;

function drawWheel(extraRotation = 0) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const count = options.value.length;
  if (count === 0) {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    return;
  }

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  const sliceAngle = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const startAngle = extraRotation + i * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;

    // 扇形
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = getColor(i);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 文字
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'white';
    ctx.font = `bold ${count > 8 ? 11 : 13}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    const maxLen = 14;
    const label = options.value[i].length > maxLen ? `${options.value[i].slice(0, maxLen)}…` : options.value[i];
    ctx.fillText(label, radius - 12, 5);
    ctx.restore();
  }

  // 中心圆
  ctx.beginPath();
  ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 动画
let animationId: ReturnType<typeof requestAnimationFrame> | null = null;
const currentRotation = ref(0);

function spinWheel() {
  if (isSpinning.value || options.value.length < 2) return;
  isSpinning.value = true;
  showResult.value = false;
  selectedIndex.value = null;

  // 随机旋转圈数（5~8圈）+ 随机停止角度
  const targetIndex = Math.floor(Math.random() * options.value.length);
  const sliceAngle = (2 * Math.PI) / options.value.length;
  // 让目标扇形停在顶部（指针在正上方）
  const targetAngle = 2 * Math.PI * (5 + Math.random() * 3) + (2 * Math.PI - targetIndex * sliceAngle - sliceAngle / 2);

  const startRotation = currentRotation.value;
  const endRotation = startRotation + targetAngle;
  const duration = 4000 + Math.random() * 1000;
  const startTime = performance.now();

  function easeOut(t: number) {
    return 1 - Math.pow(1 - t, 4);
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
    }
  }

  animationId = requestAnimationFrame(animate);
}

// 快速选择（不旋转）
function quickPick() {
  if (options.value.length === 0) return;
  selectedIndex.value = Math.floor(Math.random() * options.value.length);
  showResult.value = true;
}

// 监听选项变化重绘
watch(
  [options, canvasRef],
  () => {
    nextTick(() => drawWheel(currentRotation.value));
  },
  { deep: true, immediate: true },
);

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
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
</script>

<template>
  <div style="max-width: 760px; margin: 0 auto">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- 左边：转盘 -->
      <div flex flex-col items-center gap-4>
        <div class="wheel-container">
          <!-- 指针 -->
          <div class="wheel-pointer">
            ▼
          </div>
          <canvas
            ref="canvasRef"
            :width="canvasSize"
            :height="canvasSize"
            style="display: block; border-radius: 50%; box-shadow: 0 4px 24px rgba(0,0,0,0.15)"
          />
        </div>

        <div flex gap-3>
          <n-button
            type="primary"
            size="large"
            :disabled="isSpinning || options.length < 2"
            style="min-width: 120px"
            @click="spinWheel"
          >
            {{ isSpinning ? t('tools.random-decision-picker.spinning') : t('tools.random-decision-picker.spin') }}
          </n-button>
          <n-button
            :disabled="isSpinning || options.length === 0"
            @click="quickPick"
          >
            {{ t('tools.random-decision-picker.quickPick') }}
          </n-button>
        </div>

        <!-- 结果 -->
        <transition name="fade-up">
          <c-card v-if="showResult && selectedIndex !== null" style="text-align: center; width: 100%">
            <div style="font-size: 12px; opacity: 0.6; margin-bottom: 4px">
              {{ t('tools.random-decision-picker.result') }}
            </div>
            <div
              style="font-size: 24px; font-weight: 700"
              :style="{ color: getColor(selectedIndex) }"
            >
              🎉 {{ options[selectedIndex] }}
            </div>
          </c-card>
        </transition>
      </div>

      <!-- 右边：选项编辑 -->
      <div flex flex-col gap-3>
        <c-card>
          <template #title>
            {{ t('tools.random-decision-picker.options') }} ({{ options.length }})
          </template>

          <div flex gap-2 mb-3>
            <n-input
              v-model:value="inputText"
              :placeholder="t('tools.random-decision-picker.addOption')"
              style="flex: 1"
              @keydown="handleKeydown"
            />
            <n-button type="primary" :disabled="!inputText.trim()" @click="addOption">
              +
            </n-button>
          </div>

          <div class="options-list">
            <div
              v-for="(opt, i) in options"
              :key="i"
              class="option-item"
            >
              <div class="option-dot" :style="{ background: getColor(i) }" />
              <span class="option-text">{{ opt }}</span>
              <n-button
                text
                type="error"
                size="small"
                @click="removeOption(i)"
              >
                ✕
              </n-button>
            </div>
            <div v-if="options.length === 0" style="text-align: center; opacity: 0.45; padding: 16px; font-size: 13px">
              {{ t('tools.random-decision-picker.noOptions') }}
            </div>
          </div>
        </c-card>

        <!-- 预设 -->
        <c-card>
          <template #title>
            {{ t('tools.random-decision-picker.presets') }}
          </template>
          <div flex flex-wrap gap-2>
            <n-button
              v-for="preset in presets"
              :key="preset.label"
              size="small"
              @click="applyPreset(preset.items)"
            >
              {{ preset.label }}
            </n-button>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.wheel-container {
  position: relative;
  display: inline-block;
}

.wheel-pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  color: #f97316;
  z-index: 10;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2);
  line-height: 1;
}

.options-list {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  transition: background 0.15s;

  &:hover {
    background: rgba(99, 102, 241, 0.06);
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
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.35s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-up-leave-to {
  opacity: 0;
}
</style>
