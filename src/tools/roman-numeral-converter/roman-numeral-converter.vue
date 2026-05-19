<script setup lang="ts">
import {
  MAX_ARABIC_TO_ROMAN,
  MIN_ARABIC_TO_ROMAN,
  arabicToRoman,
  isValidRomanNumber,
  romanToArabic,
} from './roman-numeral-converter.service';
import { useCopy } from '@/composable/copy';

// ── 阿拉伯 → 罗马 ───────────────────────────────────────────────────────────
const inputNumeral = ref<number | null>(42);

const arabicError = computed(() => {
  const v = inputNumeral.value;
  if (v === null || v === undefined || String(v) === '') return '';
  if (!Number.isInteger(v)) return 'Please enter a whole number.';
  if (v < MIN_ARABIC_TO_ROMAN) return `Minimum value is ${MIN_ARABIC_TO_ROMAN}.`;
  if (v > MAX_ARABIC_TO_ROMAN) return `Maximum value is ${MAX_ARABIC_TO_ROMAN.toLocaleString()} — standard Roman numerals go no higher.`;
  return '';
});

const outputRoman = computed(() => {
  if (inputNumeral.value === null || arabicError.value) return '';
  return arabicToRoman(inputNumeral.value);
});

// ── 罗马 → 阿拉伯 ───────────────────────────────────────────────────────────
const inputRoman = ref('XLII');

const romanError = computed(() => {
  const v = inputRoman.value.trim();
  if (!v) return '';
  if (!isValidRomanNumber(v)) {
    return 'Invalid Roman numeral. Check for illegal combinations (e.g. IIII, IL, VV).';
  }
  return '';
});

const outputNumeral = computed(() => {
  const v = inputRoman.value.trim();
  if (!v || romanError.value) return null;
  return romanToArabic(v);
});

// ── 复制 ────────────────────────────────────────────────────────────────────
const { copy: copyRoman, isJustCopied: romanCopied } = useCopy({ source: outputRoman, text: 'Roman numeral copied!' });
const arabicStr = computed(() => (outputNumeral.value !== null ? String(outputNumeral.value) : ''));
const { copy: copyArabic, isJustCopied: arabicCopied } = useCopy({ source: arabicStr, text: 'Number copied!' });
</script>

<template>
  <div class="rnc-wrap">
    <!-- ① 阿拉伯 → 罗马 ──────────────────────────────────────────────── -->
    <c-card class="conv-card">
      <div class="card-title">Arabic → Roman</div>

      <div class="conv-row">
        <!-- 输入 -->
        <div class="input-col">
          <n-form-item
            :validation-status="arabicError ? 'error' : undefined"
            :feedback="arabicError"
            :show-label="false"
            style="margin-bottom: 0"
          >
            <n-input-number
              v-model:value="inputNumeral"
              :min="1"
              :max="3999"
              :show-button="false"
              placeholder="e.g. 2024"
              style="width: 100%"
              :status="arabicError ? 'error' : undefined"
            />
          </n-form-item>
        </div>

        <!-- 箭头 -->
        <div class="arrow-col">
          <icon-mdi-arrow-right class="arrow-icon" />
        </div>

        <!-- 结果 -->
        <div class="result-col">
          <transition name="fade" mode="out-in">
            <span v-if="outputRoman" key="result" class="result-text roman-font">
              {{ outputRoman }}
            </span>
            <span v-else key="empty" class="result-placeholder roman-font">
              —
            </span>
          </transition>
        </div>

        <!-- 复制 -->
        <div class="action-col">
          <c-button
            type="primary"
            :disabled="!outputRoman"
            @click="copyRoman()"
          >
            <transition name="icon-sw" mode="out-in">
              <icon-mdi-check v-if="romanCopied" key="check" class="btn-icon success-icon" />
              <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
            </transition>
            {{ romanCopied ? 'Copied!' : 'Copy' }}
          </c-button>
        </div>
      </div>
    </c-card>

    <!-- ② 罗马 → 阿拉伯 ──────────────────────────────────────────────── -->
    <c-card class="conv-card" style="margin-top: 16px">
      <div class="card-title">Roman → Arabic</div>

      <div class="conv-row">
        <!-- 输入 -->
        <div class="input-col">
          <n-form-item
            :validation-status="romanError ? 'error' : undefined"
            :feedback="romanError"
            :show-label="false"
            style="margin-bottom: 0"
          >
            <n-input
              v-model:value="inputRoman"
              placeholder="e.g. MMXXIV"
              clearable
              :status="romanError ? 'error' : undefined"
              class="roman-input"
            />
          </n-form-item>
          <div class="roman-case-hint">
            <icon-mdi-information-outline class="hint-icon" />
            Case-insensitive: xlii = XLII
          </div>
        </div>

        <!-- 箭头 -->
        <div class="arrow-col">
          <icon-mdi-arrow-right class="arrow-icon" />
        </div>

        <!-- 结果 -->
        <div class="result-col">
          <transition name="fade" mode="out-in">
            <span v-if="outputNumeral !== null" key="result" class="result-text numeric-font">
              {{ outputNumeral }}
            </span>
            <span v-else key="empty" class="result-placeholder">
              —
            </span>
          </transition>
        </div>

        <!-- 复制 -->
        <div class="action-col">
          <c-button
            type="primary"
            :disabled="outputNumeral === null"
            @click="copyArabic()"
          >
            <transition name="icon-sw" mode="out-in">
              <icon-mdi-check v-if="arabicCopied" key="check" class="btn-icon success-icon" />
              <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
            </transition>
            {{ arabicCopied ? 'Copied!' : 'Copy' }}
          </c-button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.rnc-wrap {
  width: 100%;
}

/* ── 卡片标题 ──────────────────────────────────────────────────────────── */
.card-title {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

/* ── 转换行 ────────────────────────────────────────────────────────────── */
.conv-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.input-col {
  flex: 1 1 160px;
  min-width: 0;
}

.arrow-col {
  flex-shrink: 0;
  padding-top: 10px;
  opacity: 0.3;
}

.arrow-icon {
  font-size: 18px;
}

.result-col {
  flex: 1 1 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding-top: 4px;
}

.action-col {
  flex-shrink: 0;
  padding-top: 1px;
}

/* ── 结果文字：衬线字体 + 大号 ─────────────────────────────────────────── */
/* 罗马数字使用衬线字体，I/V/X/L 识别度大幅提升 */
.roman-font {
  font-family: Georgia, 'Times New Roman', Cambria, serif;
  letter-spacing: 0.06em;
}

/* 阿拉伯数字用等宽字体，防抖动 */
.numeric-font {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
}

.result-text {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.2s;
}

.result-placeholder {
  font-size: 24px;
  opacity: 0.2;
}

/* 罗马数字输入框也使用衬线字体，方便识别 */
.roman-input {
  :deep(input) {
    font-family: Georgia, 'Times New Roman', Cambria, serif;
    letter-spacing: 0.06em;
    font-size: 15px;
  }
}

/* ── 大小写提示 ────────────────────────────────────────────────────────── */
.roman-case-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.4;
  margin-top: 5px;
  padding-left: 2px;
}

.hint-icon {
  font-size: 12px;
  flex-shrink: 0;
}

/* ── 复制按钮图标 ──────────────────────────────────────────────────────── */
.btn-icon {
  font-size: 14px;
  margin-right: 4px;
  vertical-align: middle;
}

.success-icon {
  color: currentColor;
}

/* ── 过渡动画 ──────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.icon-sw-enter-active,
.icon-sw-leave-active {
  transition: all 0.15s ease;
}
.icon-sw-enter-from,
.icon-sw-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* ── 移动端 ────────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .conv-row {
    gap: 8px;
  }
  .result-text {
    font-size: 22px;
  }
}
</style>
