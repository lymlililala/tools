<script setup lang="ts">
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} from 'change-case';

const input = ref('lorem ipsum dolor sit amet');

// ── 防抖处理（大文本不卡顿）──────────────────────────────────────────────
const debouncedInput = refDebounced(input, 80);

const baseConfig = {
  stripRegexp: /[^A-Za-zÀ-ÖØ-öø-ÿ]+/gi,
};

const formats = computed(() => [
  { label: 'Lowercase', group: 'text', value: debouncedInput.value.toLocaleLowerCase() },
  { label: 'Uppercase', group: 'text', value: debouncedInput.value.toLocaleUpperCase() },
  { label: 'Sentence case', group: 'text', value: sentenceCase(debouncedInput.value, baseConfig) },
  { label: 'Capital case', group: 'text', value: capitalCase(debouncedInput.value, baseConfig) },
  { label: 'Camel case', group: 'code', value: camelCase(debouncedInput.value, baseConfig) },
  { label: 'Pascal case', group: 'code', value: pascalCase(debouncedInput.value, baseConfig) },
  { label: 'Snake case', group: 'code', value: snakeCase(debouncedInput.value, baseConfig) },
  { label: 'Constant case', group: 'code', value: constantCase(debouncedInput.value, baseConfig) },
  { label: 'Kebab case', group: 'code', value: paramCase(debouncedInput.value, baseConfig) },
  { label: 'Header case', group: 'code', value: headerCase(debouncedInput.value, baseConfig) },
  { label: 'Dot case', group: 'code', value: dotCase(debouncedInput.value, baseConfig) },
  { label: 'Path case', group: 'code', value: pathCase(debouncedInput.value, baseConfig) },
  { label: 'No case', group: 'text', value: noCase(debouncedInput.value, baseConfig) },
  {
    label: 'Mocking case',
    group: 'text',
    value: debouncedInput.value
      .split('')
      .map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
      .join(''),
  },
]);

// 分组：左列 code / 右列 text
const codeFormats = computed(() => formats.value.filter(f => f.group === 'code'));
const textFormats = computed(() => formats.value.filter(f => f.group === 'text'));

// ── 逐行复制反馈状态 ─────────────────────────────────────────────────────
const copiedLabel = ref<string | null>(null);

async function copyFormat(label: string, value: string) {
  await navigator.clipboard.writeText(value).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
  copiedLabel.value = label;
  setTimeout(() => {
    copiedLabel.value = null;
  }, 1500);
}
</script>

<template>
  <c-card>
    <!-- 主输入区 -->
    <div class="input-wrap">
      <c-input-text
        v-model:value="input"
        label="Your string:"
        placeholder="Paste or type your text here…"
        label-position="left"
        label-width="120px"
        label-align="right"
        raw-text
        multiline
        autosize
        :rows="3"
      />
      <c-button
        v-if="input"
        class="clear-btn"
        variant="text"
        circle
        size="small"
        title="Clear"
        @click="input = ''"
      >
        <icon-mdi-close />
      </c-button>
    </div>

    <div my-16px divider />

    <!-- 双列结果网格 -->
    <div class="results-grid">
      <!-- 左列：编程格式 -->
      <div class="results-col">
        <div class="col-label">
          Code Formats
        </div>
        <div
          v-for="fmt in codeFormats"
          :key="fmt.label"
          class="result-row"
          :class="{ copied: copiedLabel === fmt.label }"
          @click="copyFormat(fmt.label, fmt.value)"
        >
          <span class="result-label">{{ fmt.label }}</span>
          <span class="result-value">{{ fmt.value || '—' }}</span>
          <span class="result-copy-icon">
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="copiedLabel === fmt.label" key="check" class="icon-check" />
              <icon-mdi-content-copy v-else key="copy" class="icon-copy" />
            </transition>
          </span>
        </div>
      </div>

      <!-- 右列：文本格式 -->
      <div class="results-col">
        <div class="col-label">
          Text Formats
        </div>
        <div
          v-for="fmt in textFormats"
          :key="fmt.label"
          class="result-row"
          :class="{ copied: copiedLabel === fmt.label }"
          @click="copyFormat(fmt.label, fmt.value)"
        >
          <span class="result-label">{{ fmt.label }}</span>
          <span class="result-value">{{ fmt.value || '—' }}</span>
          <span class="result-copy-icon">
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="copiedLabel === fmt.label" key="check" class="icon-check" />
              <icon-mdi-content-copy v-else key="copy" class="icon-copy" />
            </transition>
          </span>
        </div>
      </div>
    </div>
  </c-card>
</template>

<style lang="less" scoped>
// ── 输入区 ────────────────────────────────────────────────────────────────
.input-wrap {
  position: relative;

  .clear-btn {
    position: absolute;
    right: 6px;
    top: 6px;
    opacity: 0.45;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.85;
    }
  }
}

// ── 双列结果网格 ──────────────────────────────────────────────────────────
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.results-col {
  display: flex;
  flex-direction: column;
  min-width: 0; // 允许列收缩到 1fr 份额，避免值溢出被裁切
}

.col-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.35;
  margin-bottom: 6px;
  padding-left: 2px;
}

// ── 结果行（只读卡片） ────────────────────────────────────────────────────
.result-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 7px;
  margin-bottom: 4px;
  background: rgba(128, 128, 128, 0.055);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  min-width: 0; // flex 防溢出

  &:hover {
    background: rgba(128, 128, 128, 0.11);

    .result-copy-icon {
      opacity: 0.7;
    }
  }

  &:active {
    transform: scale(0.985);
  }

  &.copied {
    background: rgba(34, 197, 94, 0.1);
  }
}

.result-label {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.45;
  flex-shrink: 0;
  width: 100px;
  white-space: nowrap;
}

.result-value {
  flex: 1;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  word-break: break-all;

  @media (max-width: 480px) {
    white-space: normal;
    word-break: break-all;
  }
}

.result-copy-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  opacity: 0.25;
  transition: opacity 0.2s;
}

.icon-check {
  color: #22c55e;
  opacity: 1 !important;
}

.icon-copy {
  // inherit opacity from parent
}

// ── 图标切换动画 ──────────────────────────────────────────────────────────
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.18s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}
</style>
