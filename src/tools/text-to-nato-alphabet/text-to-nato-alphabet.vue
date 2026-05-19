<script setup lang="ts">
import { textToNatoWords } from './text-to-nato-alphabet.service';
import { useCopy } from '@/composable/copy';

const input = ref('');

// 分词结构用于排版
const natoGroups = computed(() => textToNatoWords(input.value));

// 拼接纯文字用于复制（组间换行，组内空格）
const natoText = computed(() =>
  natoGroups.value
    .map(g => g.words.join(' - '))
    .join('\n'),
);

const { copy, isJustCopied } = useCopy({ source: natoText, createToast: false });

const hasOutput = computed(() => natoGroups.value.length > 0);
</script>

<template>
  <div class="nato-wrap">
    <!-- 输入区 -->
    <c-card mb-3>
      <div class="section-label">
        Input
      </div>
      <div class="input-row">
        <c-input-text
          v-model:value="input"
          placeholder="Put your text here… e.g. SOS"
          raw-text
          multiline
          autosize
          :rows="2"
          style="flex:1"
        />
        <c-button
          v-if="input"
          variant="text"
          circle
          size="small"
          class="clear-btn"
          title="Clear"
          @click="input = ''"
        >
          <icon-mdi-close />
        </c-button>
      </div>
    </c-card>

    <!-- 输出区（始终显示，空时有占位提示） -->
    <c-card class="output-card">
      <div class="output-header">
        <div class="section-label">
          NATO Phonetic Alphabet
        </div>
        <c-button
          v-if="hasOutput"
          size="small"
          variant="text"
          class="copy-btn"
          :class="{ copied: isJustCopied }"
          @click="copy()"
        >
          <transition name="icon-fade" mode="out-in">
            <icon-mdi-check v-if="isJustCopied" key="check" class="icon-check" />
            <icon-mdi-content-copy v-else key="copy" />
          </transition>
          {{ isJustCopied ? 'Copied!' : 'Copy' }}
        </c-button>
      </div>

      <!-- 空状态占位 -->
      <div v-if="!hasOutput" class="empty-state">
        <span class="empty-preview">Alfa · Bravo · Charlie · Delta · Echo…</span>
        <span class="empty-hint">Results will appear here as you type</span>
      </div>

      <!-- 分组结果 -->
      <div v-else class="nato-output">
        <div
          v-for="(group, gi) in natoGroups"
          :key="gi"
          class="nato-group"
        >
          <!-- 原始词标签 -->
          <span class="group-original">{{ group.original }}</span>
          <!-- 音标词列表 -->
          <div class="group-words">
            <span
              v-for="(word, wi) in group.words"
              :key="wi"
              class="nato-word"
            >
              <!-- 首字母加粗高亮 -->
              <span class="word-first">{{ word[0] }}</span><span class="word-rest">{{ word.slice(1) }}</span>
              <span v-if="wi < group.words.length - 1" class="separator"> · </span>
            </span>
          </div>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.nato-wrap {
  max-width: 680px;
  margin: 0 auto;
}

.section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.35;
  margin-bottom: 8px;
}

// ── 输入区 ────────────────────────────────────────────────────────────────
.input-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.clear-btn {
  margin-top: 4px;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }
}

// ── 输出区 ────────────────────────────────────────────────────────────────
.output-card {
  min-height: 80px;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.55;
  transition: opacity 0.15s, color 0.2s;

  &:hover {
    opacity: 1;
  }

  &.copied {
    color: #22c55e;
    opacity: 1;
  }
}

.icon-check {
  color: #22c55e;
}

// ── 空状态 ────────────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 0 8px;
}

.empty-preview {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  opacity: 0.2;
  letter-spacing: 0.03em;
}

.empty-hint {
  font-size: 11px;
  opacity: 0.3;
}

// ── NATO 分组输出 ─────────────────────────────────────────────────────────
.nato-output {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nato-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-original {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.35;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'SF Mono', monospace;
}

.group-words {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0;
  line-height: 1.7;
}

.nato-word {
  display: inline-flex;
  align-items: baseline;
}

.word-first {
  font-weight: 800;
  font-size: 15px;
}

.word-rest {
  font-size: 14px;
  font-weight: 400;
}

.separator {
  color: rgba(128, 128, 128, 0.45);
  font-size: 13px;
  margin: 0 1px;
  user-select: none;
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
