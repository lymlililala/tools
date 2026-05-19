<script setup lang="ts">
import { useWindowSize, useClipboard } from '@vueuse/core';

const { width, height } = useWindowSize();
const { copy } = useClipboard();

const sections = [
  {
    name: 'Screen',
    information: [
      { label: 'Screen size', value: computed(() => `${window.screen.availWidth} x ${window.screen.availHeight}`) },
      { label: 'Orientation', value: computed(() => window.screen.orientation.type) },
      { label: 'Orientation angle', value: computed(() => `${window.screen.orientation.angle}°`) },
      { label: 'Color depth', value: computed(() => `${window.screen.colorDepth} bits`) },
      { label: 'Pixel ratio', value: computed(() => `${window.devicePixelRatio} dppx`) },
      { label: 'Window size', value: computed(() => `${width.value} x ${height.value}`) },
    ],
  },
  {
    name: 'Device',
    information: [
      { label: 'Browser vendor', value: computed(() => navigator.vendor) },
      { label: 'Languages', value: computed(() => navigator.languages.join(', ')) },
      { label: 'Platform', value: computed(() => navigator.platform) },
      { label: 'User agent', value: computed(() => navigator.userAgent) },
    ],
  },
];

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copiedLabel = ref('');

async function copyValue(label: string, value: string) {
  if (!value) return;
  await copy(value);
  copiedLabel.value = label;
  setTimeout(() => { copiedLabel.value = ''; }, 1800);
}
</script>

<template>
  <div class="device-wrap">
    <div class="sections-grid">
      <c-card v-for="{ name, information } in sections" :key="name" :title="name">
        <n-grid cols="1 400:2" x-gap="10" y-gap="10">
          <n-gi
            v-for="{ label, value: { value } } in information"
            :key="label"
          >
            <div
              class="info-tile"
              :class="{ copied: copiedLabel === label }"
              :title="`Click to copy ${label}`"
              @click="copyValue(label, value ?? '')"
            >
              <!-- 标签行 -->
              <div class="tile-label">{{ label }}</div>

              <!-- 值行 -->
              <div class="tile-value">
                <n-ellipsis v-if="value" :tooltip="{ placement: 'top' }">
                  {{ value }}
                </n-ellipsis>
                <span v-else class="tile-unknown">unknown</span>
              </div>

              <!-- 悬停/复制图标 -->
              <div class="tile-copy-icon">
                <icon-mdi-check v-if="copiedLabel === label" class="copy-check" />
                <icon-mdi-content-copy v-else class="copy-icon" />
              </div>

              <!-- 复制成功角标 -->
              <transition name="copied-badge-anim">
                <div v-if="copiedLabel === label" class="copied-badge">
                  Copied!
                </div>
              </transition>
            </div>
          </n-gi>
        </n-grid>
      </c-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
.device-wrap {
  max-width: 960px;
  margin: 0 auto;
}

// ── 并排卡片 ──────────────────────────────────────────────────────────────
.sections-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── 单个信息格子 ──────────────────────────────────────────────────────────
.info-tile {
  position: relative;
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.035);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;

  &:hover {
    background: rgba(99, 102, 241, 0.07);
    border-color: rgba(99, 102, 241, 0.2);

    .tile-copy-icon {
      opacity: 1;
    }
  }

  &.copied {
    background: rgba(34, 197, 94, 0.07);
    border-color: rgba(34, 197, 94, 0.3);

    .tile-copy-icon {
      opacity: 1;
    }
  }

  // 深色模式
  :global(.dark) & {
    background: rgba(255, 255, 255, 0.04);

    &:hover {
      background: rgba(99, 102, 241, 0.1);
    }
  }
}

// 标签
.tile-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;      // 加深（原 0.8 × font-weight:400 ≈ 实际视觉更淡）
  line-height: 1;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

// 值
.tile-value {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-all;
  padding-right: 28px; // 给复制图标留空间
}

.tile-unknown {
  font-size: 14px;
  opacity: 0.4;
  font-style: italic;
}

// 复制图标（右上角，hover 时显示）
.tile-copy-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-icon {
  opacity: 0.45;
  color: #6366f1;
}

.copy-check {
  color: #22c55e;
}

// 复制成功角标
.copied-badge {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #22c55e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.copied-badge-anim-enter-active,
.copied-badge-anim-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.copied-badge-anim-enter-from,
.copied-badge-anim-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
