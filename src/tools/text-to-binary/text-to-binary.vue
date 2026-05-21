<script setup lang="ts">
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from './text-to-binary.models';
import { useCopy } from '@/composable/copy';
import { withDefaultOnError } from '@/utils/defaults';

// ── 字节分隔符开关 ──────────────────────────────────────────────────────
const separateBytes = ref(true);
const separator = computed(() => separateBytes.value ? ' ' : '');

// ── 双向绑定核心状态 ────────────────────────────────────────────────────
// 最后一次是从哪边触发的
const activeSource = ref<'text' | 'binary'>('text');

const textInput = ref('');
const binaryInput = ref('');

// 防抖处理
const debouncedText = refDebounced(textInput, 60);
const debouncedBinary = refDebounced(binaryInput, 60);

// 当文本侧是激活源时，二进制侧跟随计算
const binaryFromText = computed(() =>
  activeSource.value === 'text'
    ? convertTextToAsciiBinary(debouncedText.value, { separator: separator.value })
    : binaryInput.value,
);

// 当二进制侧是激活源时，文本侧跟随计算
const textFromBinary = computed(() =>
  activeSource.value === 'binary'
    ? withDefaultOnError(() => convertAsciiBinaryToText(debouncedBinary.value), '')
    : textInput.value,
);

// ── 双向同步 ─────────────────────────────────────────────────────────────
function onTextInput(val: string) {
  activeSource.value = 'text';
  textInput.value = val;
}

function onBinaryInput(val: string) {
  activeSource.value = 'binary';
  binaryInput.value = val;
}

// 切换分隔符时，重新格式化二进制侧
watch(separateBytes, () => {
  if (activeSource.value === 'text' && textInput.value) {
    binaryInput.value = convertTextToAsciiBinary(textInput.value, { separator: separator.value });
  }
});

// ── 只读展示值（始终显示对应计算结果） ────────────────────────────────
const displayBinary = computed(() =>
  activeSource.value === 'text' ? binaryFromText.value : binaryInput.value,
);
const displayText = computed(() =>
  activeSource.value === 'binary' ? textFromBinary.value : textInput.value,
);

// ── 二进制输入验证 ────────────────────────────────────────────────────
const binaryValidationRules = [
  {
    validator: (value: string) => {
      if (!value.trim()) return true;
      // 只允许 0/1 和空格/换行
      if (/[^01\s]/.test(value)) return false;
      const clean = value.replace(/[^01]/g, '');
      return clean.length === 0 || clean.length % 8 === 0;
    },
    message: 'Only 0 and 1 are allowed, and total bits must be a multiple of 8',
  },
];

// ── 复制 ─────────────────────────────────────────────────────────────
const binaryToCopy = computed(() => displayBinary.value);
const textToCopy = computed(() => displayText.value);

const { copy: copyBinary, isJustCopied: binaryCopied } = useCopy({ source: binaryToCopy, createToast: false });
const { copy: copyText, isJustCopied: textCopied } = useCopy({ source: textToCopy, createToast: false });
</script>

<template>
  <div class="ttb-wrap tool-wide">
    <!-- 顶部工具栏：字节分隔符开关 -->
    <div class="toolbar">
      <label class="switch-label">
        <n-switch v-model:value="separateBytes" size="small" />
        <span>Separate bytes with spaces</span>
      </label>
    </div>

    <!-- 双框主体 -->
    <div class="converter-grid">
      <!-- 左：文本输入/显示 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">Text</span>
          <c-button
            v-if="displayText"
            size="small"
            variant="text"
            class="copy-btn"
            :class="{ copied: textCopied }"
            @click="copyText()"
          >
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="textCopied" key="check" class="icon-check" />
              <icon-mdi-content-copy v-else key="copy" />
            </transition>
            {{ textCopied ? 'Copied!' : 'Copy' }}
          </c-button>
        </div>

        <!-- 激活时可编辑，否则只读展示 -->
        <c-input-text
          v-if="activeSource === 'text'"
          :value="textInput"
          multiline
          autosize
          :rows="6"
          raw-text
          autofocus
          placeholder="e.g. Hello world"
          class="pane-textarea"
          test-id="text-to-binary-input"
          @update:value="onTextInput"
        />
        <div
          v-else
          class="readonly-pane"
          :class="{ empty: !displayText }"
          @click="activeSource = 'binary'; binaryInput = binaryInput"
        >
          <span v-if="displayText">{{ displayText }}</span>
          <span v-else class="placeholder-text">Decoded text will appear here</span>
        </div>

        <div class="pane-footer">
          <span class="pane-hint" @click="activeSource = 'text'">
            <icon-mdi-pencil-outline class="hint-icon" />
            Click to edit text
          </span>
        </div>
      </div>

      <!-- 分隔箭头 -->
      <div class="pane-divider">
        <div class="arrow-wrap">
          <icon-mdi-arrow-left-right class="arrow-icon" />
        </div>
      </div>

      <!-- 右：二进制输入/显示 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">Binary</span>
          <c-button
            v-if="displayBinary"
            size="small"
            variant="text"
            class="copy-btn"
            :class="{ copied: binaryCopied }"
            @click="copyBinary()"
          >
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="binaryCopied" key="check" class="icon-check" />
              <icon-mdi-content-copy v-else key="copy" />
            </transition>
            {{ binaryCopied ? 'Copied!' : 'Copy' }}
          </c-button>
        </div>

        <c-input-text
          v-if="activeSource === 'binary'"
          :value="binaryInput"
          multiline
          autosize
          :rows="6"
          raw-text
          monospace
          placeholder="e.g. 01001000 01100101 01101100 01101100 01101111"
          class="pane-textarea mono"
          :validation-rules="binaryValidationRules"
          test-id="binary-to-text-input"
          @update:value="onBinaryInput"
        />
        <div
          v-else
          class="readonly-pane mono"
          :class="{ empty: !displayBinary }"
          @click="activeSource = 'text'"
        >
          <span v-if="displayBinary">{{ displayBinary }}</span>
          <span v-else class="placeholder-text">Binary output will appear here</span>
        </div>

        <div class="pane-footer">
          <span class="pane-hint" @click="activeSource = 'binary'">
            <icon-mdi-pencil-outline class="hint-icon" />
            Click to edit binary
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ttb-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── 工具栏 ────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: rgba(128, 128, 128, 0.055);
  border-radius: 8px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  opacity: 0.75;

  &:hover {
    opacity: 1;
  }
}

// ── 双框网格 ──────────────────────────────────────────────────────────────
.converter-grid {
  display: grid;
  grid-template-columns: 1fr 28px 1fr;
  gap: 0;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

// ── 分隔箭头 ──────────────────────────────────────────────────────────────
.pane-divider {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 40px;

  @media (max-width: 640px) {
    padding: 4px 0;
    transform: rotate(90deg);
  }
}

.arrow-wrap {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.1);
}

.arrow-icon {
  font-size: 14px;
  opacity: 0.4;
}

// ── 单个面板 ──────────────────────────────────────────────────────────────
.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.pane-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.55;
  transition: opacity 0.15s, color 0.2s;

  &:hover { opacity: 1; }
  &.copied { color: #22c55e; opacity: 1; }
}

.icon-check { color: #22c55e; }

// ── 只读展示区 ────────────────────────────────────────────────────────────
.readonly-pane {
  min-height: 130px;
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid rgba(128, 128, 128, 0.12);
  font-size: 13px;
  line-height: 1.65;
  cursor: pointer;
  transition: background 0.15s;
  word-break: break-all;
  white-space: pre-wrap;

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }

  &.mono {
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
    font-size: 12px;
    line-height: 1.8;
    letter-spacing: 0.02em;
  }

  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.placeholder-text {
  font-size: 12px;
  opacity: 0.25;
  font-style: italic;
}

// 激活文本域也应用等宽字体
.pane-textarea.mono {
  :deep(.input) {
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace !important;
    font-size: 12px;
    line-height: 1.8;
    letter-spacing: 0.02em;
  }
}

// ── 底部提示 ──────────────────────────────────────────────────────────────
.pane-footer {
  padding: 0 2px;
}

.pane-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  opacity: 0.3;
  cursor: pointer;
  transition: opacity 0.15s;
  user-select: none;

  &:hover { opacity: 0.7; }
}

.hint-icon {
  font-size: 11px;
}

// ── 图标动画 ──────────────────────────────────────────────────────────────
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.15s ease;
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
