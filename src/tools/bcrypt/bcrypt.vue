<script setup lang="ts">
import { compareSync } from 'bcryptjs';
import { useThemeVars } from 'naive-ui';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();
const themeVars = useThemeVars();

// ── Hash 区域 ──────────────────────────────────────────────────────────────────
const input = ref('');
const saltCount = ref(10);
const hashed = ref('');
const isHashing = ref(false);

// 盐值轮数边界（与 bcrypt cost factor 一致）
const SALT_MIN = 4;
const SALT_MAX = 20;

// 始终把值约束在合法范围内，避免 naive-ui 对越界值显示删除线
function onSaltUpdate(value: number | null) {
  if (value === null) {
    return;
  }
  saltCount.value = Math.min(SALT_MAX, Math.max(SALT_MIN, Math.round(value)));
}

// Web Worker 实例（Vite 支持 ?worker 语法）
let worker: Worker | null = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./bcrypt.worker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

// 防抖计时器
let hashDebounce: ReturnType<typeof setTimeout> | null = null;

function scheduleHash() {
  if (hashDebounce) {
    clearTimeout(hashDebounce);
  }
  if (!input.value) {
    hashed.value = '';
    isHashing.value = false;
    return;
  }
  isHashing.value = true;
  // 高 salt 值给更长的防抖，避免用户还在调节时频繁触发
  const delay = saltCount.value >= 13 ? 600 : 300;
  hashDebounce = setTimeout(() => {
    const w = getWorker();
    // 每次重新绑定，只处理最新的结果
    w.onmessage = (e: MessageEvent<{ result: string | null; error: string | null }>) => {
      if (e.data.result !== null) {
        hashed.value = e.data.result;
      }
      isHashing.value = false;
    };
    w.postMessage({ text: input.value, salt: saltCount.value });
  }, delay);
}

watch([input, saltCount], scheduleHash, { immediate: false });

// 初始生成（空输入时不触发）
onMounted(() => {
  if (input.value) {
    scheduleHash();
  }
});

onUnmounted(() => {
  worker?.terminate();
  worker = null;
});

// ── 复制 ──────────────────────────────────────────────────────────────────────
const { copy: copyHash, isJustCopied } = useCopy({ source: hashed, text: 'Hash copied to clipboard' });

// ── Compare 区域 ───────────────────────────────────────────────────────────────
const compareString = ref('');
const compareHash = ref('');

// 空状态、格式校验、匹配结果
type CompareState = 'idle' | 'invalid' | 'match' | 'nomatch';

const compareState = computed<CompareState>(() => {
  if (!compareString.value || !compareHash.value) {
    return 'idle';
  }
  // bcrypt hash 格式基本检查：以 $2a$ / $2b$ / $2y$ 开头，长度 60
  const isBcryptFormat = /^\$2[aby]\$\d{2}\$.{53}$/.test(compareHash.value.trim());
  if (!isBcryptFormat) {
    return 'invalid';
  }
  try {
    return compareSync(compareString.value, compareHash.value.trim()) ? 'match' : 'nomatch';
  }
  catch {
    return 'invalid';
  }
});
</script>

<template>
  <div class="bcrypt-layout">
    <!-- ① Hash 卡片 -->
    <c-card :title="t('tools.bcrypt.hashTitle')" class="bcrypt-card">
      <c-input-text
        v-model:value="input"
        :placeholder="t('tools.bcrypt.inputPlaceholder')"
        raw-text
        :label="t('tools.bcrypt.inputLabel')"
        mb-2
      />

      <n-form-item label-placement="top" :show-feedback="false" mb-3>
        <template #label>
          <span class="salt-label">
            {{ t('tools.bcrypt.saltLabel') }}
            <c-tooltip :tooltip="t('tools.bcrypt.saltTooltip')" position="top">
              <icon-mdi-help-circle-outline class="salt-help-icon" />
            </c-tooltip>
          </span>
        </template>
        <n-input-number :value="saltCount" :placeholder="t('tools.bcrypt.saltPlaceholder')" :max="SALT_MAX" :min="SALT_MIN" :validator="(x: number) => x >= SALT_MIN && x <= SALT_MAX" w-full @update:value="onSaltUpdate" />
      </n-form-item>

      <!-- 输出框：右侧内嵌复制按钮 -->
      <div class="hash-output-wrap">
        <div class="hash-output" :class="{ loading: isHashing }">
          <span v-if="isHashing" class="hash-placeholder">{{ t('tools.bcrypt.computing') }}</span>
          <span v-else class="hash-text">{{ hashed }}</span>
        </div>
        <c-tooltip :tooltip="isJustCopied ? t('tools.bcrypt.copied') : t('tools.bcrypt.copyHash')" position="left">
          <button
            class="inline-copy-btn"
            :class="{ copied: isJustCopied }"
            :disabled="isHashing || !hashed"
            @click="copyHash()"
          >
            <transition name="icon-switch" mode="out-in">
              <icon-mdi-check v-if="isJustCopied" key="check" class="copy-icon success" />
              <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
            </transition>
          </button>
        </c-tooltip>
      </div>

      <!-- Loading 提示（高 salt 时） -->
      <div v-if="isHashing" class="loading-hint">
        <n-spin size="small" />
        <span>{{ t('tools.bcrypt.computingHint') }}{{ saltCount >= 13 ? ` (salt=${saltCount}, ${t('tools.bcrypt.computingMoment')})` : '…' }}</span>
      </div>
    </c-card>

    <!-- ② Compare 卡片 -->
    <c-card :title="t('tools.bcrypt.compareTitle')" class="bcrypt-card">
      <n-form>
        <n-form-item :label="t('tools.bcrypt.compareStringLabel')" label-placement="top" :show-feedback="false">
          <c-input-text v-model:value="compareString" :placeholder="t('tools.bcrypt.compareStringPlaceholder')" raw-text />
        </n-form-item>
        <n-form-item :label="t('tools.bcrypt.compareHashLabel')" label-placement="top" :show-feedback="false">
          <c-input-text v-model:value="compareHash" :placeholder="t('tools.bcrypt.compareHashPlaceholder')" raw-text />
        </n-form-item>

        <!-- 校验结果：空时不显示，有内容时才显示状态 -->
        <n-form-item v-if="compareState !== 'idle'" :label="t('tools.bcrypt.doTheyMatch')" label-placement="left" :show-feedback="false">
          <div class="compare-result" :class="compareState">
            <!-- 匹配 -->
            <template v-if="compareState === 'match'">
              <icon-mdi-check-circle class="result-icon" />
              <span>{{ t('tools.bcrypt.yes') }}</span>
            </template>
            <!-- 不匹配 -->
            <template v-else-if="compareState === 'nomatch'">
              <icon-mdi-close-circle class="result-icon" />
              <span>{{ t('tools.bcrypt.no') }}</span>
            </template>
            <!-- 格式无效 -->
            <template v-else-if="compareState === 'invalid'">
              <icon-mdi-alert-circle class="result-icon" />
              <span>{{ t('tools.bcrypt.invalidHashFormat') }}</span>
            </template>
          </div>
        </n-form-item>

        <!-- 空状态提示 -->
        <n-form-item v-else :label="t('tools.bcrypt.doTheyMatch')" label-placement="left" :show-feedback="false">
          <div class="compare-idle">
            {{ t('tools.bcrypt.waitingForInput') }}
          </div>
        </n-form-item>
      </n-form>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
/* ── 响应式双栏布局 ─────────────────────────────────────────────── */
.bcrypt-layout {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
}

.bcrypt-card {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 640px) {
  .bcrypt-layout {
    flex-direction: column;
  }

  .bcrypt-card {
    width: 100%;
  }
}

/* ── 盐值轮数标签 ───────────────────────────────────────────────── */
.salt-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.salt-help-icon {
  font-size: 15px;
  opacity: 0.5;
  cursor: help;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

/* ── 哈希输出框 ─────────────────────────────────────────────────── */
.hash-output-wrap {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  overflow: hidden;
  min-height: 40px;

  /* 复制按钮被 c-tooltip 包裹(根 div + targetRef 内层),逐层撑满高度让图标垂直居中、分隔线贯穿 */
  :deep([inline-block]) {
    display: flex;
    align-self: stretch;
  }

  :deep([inline-block] > div) {
    display: flex;
    flex: 1;
  }
}

.hash-output {
  flex: 1;
  padding: 8px 12px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  word-break: break-all;
  line-height: 1.6;
  min-width: 0;
  display: flex;
  align-items: center;

  &.loading {
    opacity: 0.5;
  }
}

.hash-text {
  word-break: break-all;
}

.hash-placeholder {
  opacity: 0.45;
  font-style: italic;
}

/* 内嵌复制按钮 */
.inline-copy-btn {
  flex: 0 0 36px;
  width: 36px;
  border: none;
  border-left: 1px solid rgba(128, 128, 128, 0.2);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
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

/* Loading 提示 */
.loading-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.6;
  margin-top: 8px;
}

/* ── 校验结果 ────────────────────────────────────────────────────── */
.compare-result {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 15px;

  &.match {
    color: v-bind('themeVars.successColor');
  }

  &.nomatch {
    color: v-bind('themeVars.errorColor');
  }

  &.invalid {
    color: v-bind('themeVars.warningColor');
    font-weight: 500;
    font-size: 13px;
  }
}

.result-icon {
  font-size: 18px;
}

.compare-idle {
  font-size: 13px;
  opacity: 0.4;
  font-style: italic;
}

/* ── 图标切换动画 ─────────────────────────────────────────────────── */
.icon-switch-enter-active,
.icon-switch-leave-active {
  transition: all 0.16s ease;
}

.icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-switch-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}
</style>
