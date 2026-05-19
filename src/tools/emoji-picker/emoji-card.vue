<script setup lang="ts">
import type { EmojiInfo } from './emoji.types';
import { useCopy } from '@/composable/copy';

const props = defineProps<{ emojiInfo: EmojiInfo }>();
const { emojiInfo } = toRefs(props);

const { copy } = useCopy();

// 复制主 Emoji 时的视觉反馈
const justCopied = ref(false);

async function copyEmoji() {
  await copy(emojiInfo.value.emoji, { notificationMessage: `Emoji ${emojiInfo.value.emoji} 已复制` });
  justCopied.value = true;
  setTimeout(() => (justCopied.value = false), 1200);
}
</script>

<template>
  <div
    class="emoji-card"
    :class="{ 'just-copied': justCopied }"
    :title="`点击复制 ${emojiInfo.emoji}`"
    @click="copyEmoji"
  >
    <!-- Emoji 图标 -->
    <div class="emoji-glyph">
      {{ emojiInfo.emoji }}
    </div>

    <!-- 信息区 -->
    <div class="emoji-info">
      <!-- 名称：单行截断 + Tooltip -->
      <c-tooltip :tooltip="emojiInfo.title" placement="top">
        <div class="emoji-name">
          {{ emojiInfo.title }}
        </div>
      </c-tooltip>

      <!-- code points + unicode：单独可点击复制 -->
      <div class="emoji-codes">
        <c-tooltip tooltip="复制 Code Point" placement="bottom">
          <span
            class="code-chip"
            @click.stop="copy(emojiInfo.codePoints, { notificationMessage: `Code point '${emojiInfo.codePoints}' 已复制` })"
          >
            {{ emojiInfo.codePoints }}
          </span>
        </c-tooltip>

        <c-tooltip :tooltip="`复制 Unicode: ${emojiInfo.unicode}`" placement="bottom">
          <span
            class="code-chip code-chip--unicode"
            @click.stop="copy(emojiInfo.unicode, { notificationMessage: `Unicode 已复制` })"
          >
            {{ emojiInfo.unicode }}
          </span>
        </c-tooltip>
      </div>
    </div>

    <!-- 复制成功覆盖层 -->
    <div v-if="justCopied" class="copy-flash">
      ✓
    </div>
  </div>
</template>

<style scoped>
/* ── 卡片容器 ── */
.emoji-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 10px;
  border: 1px solid var(--n-border-color, #e8e8e8);
  border-radius: 10px;
  background: var(--n-card-color, #fff);
  cursor: pointer;
  overflow: hidden;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  user-select: none;
}

.emoji-card:hover {
  background: var(--n-color-hover, #f6f6f6);
  border-color: var(--n-border-color-hover, #ccc);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.emoji-card:active {
  transform: scale(0.97);
}

/* 复制成功时绿色边框闪烁 */
.emoji-card.just-copied {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.18);
}

/* ── Emoji 大图标 ── */
.emoji-glyph {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.15s;
}

.emoji-card:hover .emoji-glyph {
  transform: scale(1.12);
}

/* ── 信息区 ── */
.emoji-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 名称：单行截断 */
.emoji-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color, #222);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

/* Code chips */
.emoji-codes {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  min-width: 0;
}

.code-chip {
  font-size: 10px;
  font-family: var(--n-font-family-mono, 'Fira Code', monospace);
  color: #666; /* 加深，满足 WCAG 对比度 */
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 1px 5px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.code-chip--unicode {
  flex: 1;
  min-width: 0;
  max-width: none;
}

.code-chip:hover {
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.1);
}

/* ── 复制成功覆盖层 ── */
.copy-flash {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.12);
  border-radius: inherit;
  animation: flash-in 0.15s ease;
  pointer-events: none;
}

@keyframes flash-in {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
