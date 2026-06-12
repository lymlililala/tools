<script setup lang="ts">
import { Copy, Refresh } from '@vicons/tabler';
import { generateLoremIpsum } from './lorem-ipsum-generator.service';
import { useCopy } from '@/composable/copy';
import { randIntFromInterval } from '@/utils/random';
import { computedRefreshable } from '@/composable/computedRefreshable';

const { t } = useI18n();

const paragraphs = ref(1);
const sentences = ref([3, 8]);
const words = ref([8, 15]);
const startWithLoremIpsum = ref(true);
const asHTML = ref(false);

const [loremIpsumText, refreshLoremIpsum] = computedRefreshable(() =>
  generateLoremIpsum({
    paragraphCount: paragraphs.value,
    asHTML: asHTML.value,
    sentencePerParagraph: randIntFromInterval(sentences.value[0], sentences.value[1]),
    wordCount: randIntFromInterval(words.value[0], words.value[1]),
    startWithLoremIpsum: startWithLoremIpsum.value,
  }),
);

// 复制时显示成功反馈
const copied = ref(false);
const { copy } = useCopy({ source: loremIpsumText, text: computed(() => t('tools.lorem-ipsum-generator.textCopied')) });

async function handleCopy() {
  await copy();
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}
</script>

<template>
  <div class="lorem-wrapper">
    <c-card class="lorem-card">
      <!-- 参数区 -->
      <div class="params-grid">
        <!-- 段落数 -->
        <label class="param-label">{{ t('tools.lorem-ipsum-generator.paragraphs') }}</label>
        <div class="param-control">
          <n-slider v-model:value="paragraphs" :step="1" :min="1" :max="20" class="param-slider" />
          <span class="param-value">{{ paragraphs }}</span>
        </div>

        <!-- 每段句子数 -->
        <label class="param-label">{{ t('tools.lorem-ipsum-generator.sentencesPerParagraph') }}</label>
        <div class="param-control">
          <n-slider v-model:value="sentences" range :step="1" :min="1" :max="50" class="param-slider" />
          <span class="param-value">{{ sentences[0] }} – {{ sentences[1] }}</span>
        </div>

        <!-- 每句单词数 -->
        <label class="param-label">{{ t('tools.lorem-ipsum-generator.wordsPerSentence') }}</label>
        <div class="param-control">
          <n-slider v-model:value="words" range :step="1" :min="1" :max="50" class="param-slider" />
          <span class="param-value">{{ words[0] }} – {{ words[1] }}</span>
        </div>

        <!-- 以 Lorem ipsum 开头 -->
        <label class="param-label">{{ t('tools.lorem-ipsum-generator.startWithLorem') }}</label>
        <div class="param-control param-control--switch">
          <n-switch v-model:value="startWithLoremIpsum" />
        </div>

        <!-- 输出为 HTML -->
        <label class="param-label">{{ t('tools.lorem-ipsum-generator.outputHtml') }}</label>
        <div class="param-control param-control--switch">
          <n-switch v-model:value="asHTML" />
        </div>
      </div>

      <!-- 生成文本区 -->
      <div class="output-area">
        <textarea
          class="lorem-textarea"
          :value="loremIpsumText"
          readonly
          :rows="asHTML ? 8 : 6"
          :placeholder="t('tools.lorem-ipsum-generator.placeholder')"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-row">
        <!-- Copy：主按钮 -->
        <button class="btn-primary" @click="handleCopy">
          <n-icon v-if="!copied" :component="Copy" size="15" />
          <span v-else class="check-icon">✓</span>
          {{ copied ? t('tools.lorem-ipsum-generator.justCopied') : t('tools.lorem-ipsum-generator.copy') }}
        </button>

        <!-- Refresh：次级按钮 -->
        <button class="btn-secondary" @click="refreshLoremIpsum">
          <n-icon :component="Refresh" size="15" />
          {{ t('tools.lorem-ipsum-generator.regenerate') }}
        </button>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
/* ── 容器 ── */
.lorem-wrapper {
  max-width: 640px;
  margin: 0 auto;
}

.lorem-card {
  padding: 24px;
}

/* ── 参数网格：标签列固定宽，控件列自适应 ── */
.params-grid {
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 18px;
  column-gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.param-label {
  font-size: 13px;
  color: var(--n-text-color-2, #555);
  text-align: right;
  white-space: nowrap;
  cursor: default;
  line-height: 1;
  padding-right: 4px;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-control--switch {
  /* 开关行高度对齐 */
  height: 22px;
}

.param-slider {
  flex: 1;
}

/* 数值徽章 */
.param-value {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.1);
  border-radius: 12px;
  padding: 2px 8px;
  min-width: 36px;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s;
}

/* ── 生成文本区 ── */
.output-area {
  margin: 4px 0 20px;
}

.lorem-textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--n-text-color, #333);
  background: var(--n-input-color, #fafafa);
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.lorem-textarea:focus {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.1);
}

/* ── 操作按钮行 ── */
.action-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 主按钮 */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 22px;
  background: var(--primary-color, #18a058);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.25);
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--primary-color, #18a058) 85%, #000);
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.35);
}

.btn-primary:active {
  transform: scale(0.96);
}

/* 次级按钮 */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: transparent;
  color: var(--n-text-color-2, #555);
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 7px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.btn-secondary:hover {
  border-color: var(--n-border-color-hover, #aaa);
  color: var(--n-text-color, #333);
  background: rgba(0, 0, 0, 0.03);
}

.btn-secondary:active {
  transform: scale(0.96);
}

/* 复制成功 ✓ */
.check-icon {
  font-size: 14px;
  font-weight: 700;
}

/* ── 移动端适配 ── */
@media (max-width: 480px) {
  .params-grid {
    grid-template-columns: 120px 1fr;
    row-gap: 14px;
  }

  /* 窄屏标签允许换行，避免文字溢出到滑块上 */
  .param-label {
    white-space: normal;
    line-height: 1.25;
  }

  .lorem-card {
    padding: 16px;
  }
}
</style>
