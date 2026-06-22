<script setup lang="ts">
import { getPasswordCrackTimeEstimation } from './password-strength-analyser.service';

const { t } = useI18n();

const password = ref('');
const showPassword = ref(false);

// ── 核心计算 ───────────────────────────────────────────────────────────────────
const estimation = computed(() => getPasswordCrackTimeEstimation({ password: password.value }));
const score = computed(() => Math.round(estimation.value.score * 100)); // 0~100
const isEmpty = computed(() => password.value === '');

// ── 强度等级 ───────────────────────────────────────────────────────────────────
// 0-19: very-weak  20-39: weak  40-59: fair  60-79: good  80+: strong
type StrengthLevel = 'empty' | 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';

const strengthLevel = computed<StrengthLevel>(() => {
  if (isEmpty.value) {
    return 'empty';
  }
  const s = score.value;
  if (s < 20) {
    return 'very-weak';
  }
  if (s < 40) {
    return 'weak';
  }
  if (s < 60) {
    return 'fair';
  }
  if (s < 80) {
    return 'good';
  }
  return 'strong';
});

const strengthMeta = computed(() => {
  const map: Record<StrengthLevel, { label: string; color: string; bars: number }> = {
    'empty': { label: '', color: 'transparent', bars: 0 },
    'very-weak': { label: t('tools.password-strength-analyser.veryWeak'), color: '#ef4444', bars: 1 },
    'weak': { label: t('tools.password-strength-analyser.weak'), color: '#f97316', bars: 2 },
    'fair': { label: t('tools.password-strength-analyser.fair'), color: '#eab308', bars: 3 },
    'good': { label: t('tools.password-strength-analyser.good'), color: '#22c55e', bars: 4 },
    'strong': { label: t('tools.password-strength-analyser.strong'), color: '#16a34a', bars: 5 },
  };
  return map[strengthLevel.value];
});

// ── 启发式改进建议 ─────────────────────────────────────────────────────────────
const tips = computed<string[]>(() => {
  if (isEmpty.value) {
    return [];
  }
  const hints: string[] = [];
  const pw = password.value;
  const len = pw.length;
  const s = score.value;

  if (s >= 80) {
    return [];
  }

  if (len < 8) {
    hints.push(t('tools.password-strength-analyser.tipMinLength'));
  }
  if (len < 12 && len >= 8) {
    hints.push(t('tools.password-strength-analyser.tipLonger'));
  }
  if (!/[A-Z]/.test(pw)) {
    hints.push(t('tools.password-strength-analyser.tipUppercase'));
  }
  if (!/[a-z]/.test(pw)) {
    hints.push(t('tools.password-strength-analyser.tipLowercase'));
  }
  if (!/\d/.test(pw)) {
    hints.push(t('tools.password-strength-analyser.tipDigit'));
  }
  if (!/[\W_]/.test(pw)) {
    hints.push(t('tools.password-strength-analyser.tipSpecial'));
  }
  if (/(.)\1{2,}/.test(pw)) {
    hints.push(t('tools.password-strength-analyser.tipRepeat'));
  }
  if (/^(123|abc|qwerty|password|111|000)/i.test(pw)) {
    hints.push(t('tools.password-strength-analyser.tipCommon'));
  }

  return hints.slice(0, 3); // 最多 3 条，不啰嗦
});

// ── 信息熵 Tooltip 公式 ────────────────────────────────────────────────────────
const entropyTooltip = computed(() => {
  const L = estimation.value.passwordLength;
  const R = estimation.value.charsetLength;
  const E = Math.round(estimation.value.entropy * 100) / 100;
  return `E = L × log₂(R) = ${L} × log₂(${R}) ≈ ${E} bits`;
});

const details = computed(() => [
  { label: t('tools.password-strength-analyser.passwordLength'), value: estimation.value.passwordLength, tooltip: null },
  { label: t('tools.password-strength-analyser.entropy'), value: `${Math.round(estimation.value.entropy * 100) / 100} bits`, tooltip: entropyTooltip.value },
  { label: t('tools.password-strength-analyser.charsetSize'), value: estimation.value.charsetLength, tooltip: t('tools.password-strength-analyser.charsetTooltip') },
  { label: t('tools.password-strength-analyser.scoreLabel'), value: `${score.value} / 100`, tooltip: t('tools.password-strength-analyser.scoreTooltip') },
]);
</script>

<template>
  <div class="psa-wrap">
    <!-- ① 密码输入框（动态边框颜色） -->
    <div
      class="input-wrap"
      :style="isEmpty ? {} : { '--border-color': strengthMeta.color }"
      :class="{ 'has-strength': !isEmpty }"
    >
      <input
        v-model="password"
        class="pw-input"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('tools.password-strength-analyser.inputPlaceholder')"
        autocomplete="new-password"
        spellcheck="false"
        data-test-id="password-input"
      >
      <button
        class="eye-btn"
        :title="showPassword ? t('tools.password-strength-analyser.hidePassword') : t('tools.password-strength-analyser.showPassword')"
        @click="showPassword = !showPassword"
      >
        <icon-mdi-eye v-if="!showPassword" />
        <icon-mdi-eye-off v-else />
      </button>
    </div>

    <!-- ② 强度进度条（5 段分色） -->
    <div class="meter-row">
      <div class="meter-bars">
        <div
          v-for="i in 5"
          :key="i"
          class="meter-bar"
          :style="i <= strengthMeta.bars && !isEmpty ? { background: strengthMeta.color } : {}"
          :class="{ active: i <= strengthMeta.bars && !isEmpty }"
        />
      </div>
      <transition name="fade">
        <span
          v-if="!isEmpty"
          class="meter-label"
          :style="{ color: strengthMeta.color }"
        >
          {{ strengthMeta.label }}
        </span>
      </transition>
    </div>

    <!-- ③ 破解时间卡（动态颜色 + 空状态占位） -->
    <transition name="slide-down" mode="out-in">
      <c-card v-if="!isEmpty" key="crack" class="crack-card" :style="{ '--accent': strengthMeta.color }">
        <div class="crack-sub">
          {{ t('tools.password-strength-analyser.crackSubtitle') }}
        </div>
        <div class="crack-duration" :style="{ color: strengthMeta.color }" data-test-id="crack-duration">
          {{ estimation.crackDurationFormatted }}
        </div>
      </c-card>
      <div v-else key="empty" class="empty-hint">
        <icon-mdi-lock-outline class="empty-icon" />
        <span>{{ t('tools.password-strength-analyser.emptyHint') }}</span>
      </div>
    </transition>

    <!-- ④ 详细指标卡（空时隐藏） -->
    <transition name="fade">
      <c-card v-if="!isEmpty" class="details-card">
        <div v-for="({ label, value, tooltip }) of details" :key="label" class="detail-row">
          <div class="detail-label">
            <span>{{ label }}</span>
            <c-tooltip v-if="tooltip" :tooltip="tooltip" position="right">
              <icon-mdi-information-outline class="info-icon" />
            </c-tooltip>
          </div>
          <div class="detail-value">
            {{ value }}
          </div>
        </div>
      </c-card>
    </transition>

    <!-- ⑤ 启发式改进建议 -->
    <transition name="fade">
      <div v-if="tips.length > 0" class="tips-card">
        <div class="tips-title">
          <icon-mdi-lightbulb-outline class="tips-icon" />
          {{ t('tools.password-strength-analyser.suggestionsTitle') }}
        </div>
        <ul class="tips-list">
          <li v-for="tip in tips" :key="tip">
            {{ tip }}
          </li>
        </ul>
      </div>
    </transition>

    <!-- ⑥ 免责声明 -->
    <div class="note">
      <span class="note-bold">{{ t('tools.password-strength-analyser.noteLabel') }} </span>
      {{ t('tools.password-strength-analyser.noteBody') }}
    </div>
  </div>
</template>

<style scoped lang="less">
/* ── 整体容器 ──────────────────────────────────────────────────────────────── */
.psa-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* ── 输入框 ───────────────────────────────────────────────────────────────── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  transition: border-color 0.3s ease;
  overflow: hidden;

  &.has-strength {
    border-color: var(--border-color, rgba(128, 128, 128, 0.3));
  }

  &:focus-within {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--border-color, #6366f1) 20%, transparent);
  }
}

.pw-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 15px;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-family: 'Fira Code', 'Consolas', monospace;
  letter-spacing: 0.05em;
}

.eye-btn {
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  transition: opacity 0.15s;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
}

/* ── 强度进度条 ───────────────────────────────────────────────────────────── */
.meter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 18px;
}

.meter-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.meter-bar {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: rgba(128, 128, 128, 0.18);
  transition: background 0.3s ease;

  &.active {
    transition: background 0.3s ease;
  }
}

.meter-label {
  font-size: 12px;
  font-weight: 600;
  min-width: 64px;
  text-align: right;
  transition: color 0.3s ease;
}

/* ── 破解时间卡 ───────────────────────────────────────────────────────────── */
.crack-card {
  text-align: center;
}

.crack-sub {
  opacity: 0.55;
  font-size: 13px;
  margin-bottom: 6px;
}

.crack-duration {
  font-size: 1.75rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

/* ── 空状态 ───────────────────────────────────────────────────────────────── */
.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px;
  border: 1px dashed rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  opacity: 0.45;
  font-size: 14px;
}

.empty-icon {
  font-size: 18px;
}

/* ── 详细指标卡 ───────────────────────────────────────────────────────────── */
.details-card {}

.detail-row {
  display: flex;
  gap: 12px;
  padding: 3px 0;
}

.detail-label {
  flex: 1;
  text-align: right;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.detail-value {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.info-icon {
  font-size: 13px;
  opacity: 0.6;
  cursor: help;
}

/* ── 改进建议卡 ───────────────────────────────────────────────────────────── */
.tips-card {
  border: 1px solid rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.06);
  border-radius: 6px;
  padding: 12px 16px;
}

.tips-title {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  opacity: 0.85;
}

.tips-icon {
  font-size: 15px;
  color: #eab308;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tips-list li {
  font-size: 13px;
  opacity: 0.8;
  line-height: 1.5;
}

/* ── 免责声明 ──────────────────────────────────────────────────────────────── */
.note {
  font-size: 13px;
  opacity: 0.65;
  line-height: 1.6;
}

.note-bold {
  font-weight: 700;
  opacity: 1;
}

/* ── 过渡动画 ──────────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.22s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
