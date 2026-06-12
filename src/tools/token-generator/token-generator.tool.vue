<script setup lang="ts">
import { createToken } from './token-generator.service';
import { useCopy } from '@/composable/copy';
import { useQueryParam } from '@/composable/queryParams';
import { computedRefreshable } from '@/composable/computedRefreshable';

const length = useQueryParam({ name: 'length', defaultValue: 64 });
const withUppercase = useQueryParam({ name: 'uppercase', defaultValue: true });
const withLowercase = useQueryParam({ name: 'lowercase', defaultValue: true });
const withNumbers = useQueryParam({ name: 'numbers', defaultValue: true });
const withSymbols = useQueryParam({ name: 'symbols', defaultValue: false });
const { t } = useI18n();

// ── 防错：至少保留一项选中 ─────────────────────────────────────────────────────
// 记录上一次各选项的值，当全部为 false 时自动恢复最后关掉的那个
const lastEnabled = ref<'uppercase' | 'lowercase' | 'numbers' | 'symbols'>('uppercase');

function guard(key: 'uppercase' | 'lowercase' | 'numbers' | 'symbols') {
  const states = { uppercase: withUppercase, lowercase: withLowercase, numbers: withNumbers, symbols: withSymbols };
  // 如果关掉这个后全部都是 false，就把它强制打回 true
  if (!states[key].value) {
    const anyEnabled = Object.entries(states).some(([k, v]) => k !== key && v.value);
    if (!anyEnabled) {
      // 恢复
      states[key].value = true;
    }
  }
  else {
    lastEnabled.value = key;
  }
}

// 包装每个开关的 change 回调
watch(withUppercase, () => guard('uppercase'));
watch(withLowercase, () => guard('lowercase'));
watch(withNumbers, () => guard('numbers'));
watch(withSymbols, () => guard('symbols'));

// ── 长度输入框：限制 1-512 ────────────────────────────────────────────────────
const lengthInput = computed({
  get: () => length.value,
  set: (v: number) => {
    const n = Math.round(Number(v));
    if (!Number.isNaN(n)) {
      length.value = Math.min(512, Math.max(1, n));
    }
  },
});

// ── Token 生成 ────────────────────────────────────────────────────────────────
const [token, refreshToken] = computedRefreshable(() =>
  createToken({
    length: length.value,
    withUppercase: withUppercase.value,
    withLowercase: withLowercase.value,
    withNumbers: withNumbers.value,
    withSymbols: withSymbols.value,
  }),
);

// ── 复制 ──────────────────────────────────────────────────────────────────────
const { copy, isJustCopied } = useCopy({ source: token, text: t('tools.token-generator.copied') });
</script>

<template>
  <div>
    <c-card>
      <!-- ① 四个开关：左对齐、紧凑列表 -->
      <div class="options-grid">
        <label class="option-row">
          <span class="option-label">{{ t('tools.token-generator.uppercase') }}</span>
          <n-switch v-model:value="withUppercase" />
        </label>
        <label class="option-row">
          <span class="option-label">{{ t('tools.token-generator.lowercase') }}</span>
          <n-switch v-model:value="withLowercase" />
        </label>
        <label class="option-row">
          <span class="option-label">{{ t('tools.token-generator.numbers') }}</span>
          <n-switch v-model:value="withNumbers" />
        </label>
        <label class="option-row">
          <span class="option-label">{{ t('tools.token-generator.symbols') }}</span>
          <n-switch v-model:value="withSymbols" />
        </label>
      </div>

      <!-- ② 长度：滑块 + 精确数字输入框 -->
      <div class="length-row">
        <span class="length-label">{{ t('tools.token-generator.length') }}</span>
        <n-slider v-model:value="length" class="length-slider" :step="1" :min="1" :max="512" />
        <n-input-number
          v-model:value="lengthInput"
          class="length-input"
          :min="1"
          :max="512"
          :show-button="false"
        />
      </div>

      <!-- ③ Token 输出框 -->
      <c-input-text
        v-model:value="token"
        multiline
        :placeholder="t('tools.token-generator.tokenPlaceholder')"
        readonly
        rows="3"
        autosize
        class="token-display"
      />

      <!-- ④ 按钮区：Primary 复制 + 图标刷新 -->
      <div mt-5 flex items-center justify-center gap-3>
        <!-- 复制按钮：Primary 蓝色，带图标切换反馈 -->
        <c-button type="primary" class="btn-copy" @click="copy()">
          <transition name="icon-switch" mode="out-in">
            <icon-mdi-check v-if="isJustCopied" key="check" class="btn-icon" />
            <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
          </transition>
          <span class="btn-text">{{ isJustCopied ? t('tools.token-generator.copiedFeedback') : t('tools.token-generator.button.copy') }}</span>
        </c-button>

        <!-- 刷新按钮：图标 + 文字，次级样式 -->
        <c-button class="btn-refresh" @click="refreshToken">
          <icon-mdi-refresh class="btn-icon" />
          <span class="btn-text">{{ t('tools.token-generator.button.refresh') }}</span>
        </c-button>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* Token 文本居中 */
::v-deep(.token-display) {
  textarea {
    text-align: center;
    font-family: monospace;
    word-break: break-all;
  }
}

/* ── 选项网格（2列，紧凑对齐）────────────────────────────────── */
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
  max-width: 360px;
  margin: 0 auto 20px;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}

.option-label {
  font-size: 14px;
  flex: 1;
  white-space: nowrap;
  user-select: none;
}

/* ── 长度行 ──────────────────────────────────────────────────── */
.length-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.length-label {
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.length-slider {
  flex: 1;
}

.length-input {
  width: 76px;
  flex-shrink: 0;
}

/* ── 按钮图标 ────────────────────────────────────────────────── */
.btn-icon {
  font-size: 16px;
  margin-right: 5px;
  vertical-align: middle;
}

.btn-text {
  vertical-align: middle;
}

/* ── 图标切换动画 ─────────────────────────────────────────────── */
.icon-switch-enter-active,
.icon-switch-leave-active {
  transition: all 0.18s ease;
}

.icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-switch-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}

/* ── 移动端响应式：2x2 → 1x4 ─────────────────────────────────── */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
    max-width: 100%;
    gap: 8px;
  }

  .option-row {
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  }

  .option-row:last-child {
    border-bottom: none;
  }

  .length-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .length-slider {
    min-width: 0;
  }

  .length-input {
    width: 72px;
  }
}
</style>
