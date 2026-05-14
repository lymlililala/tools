<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import FavoriteButton from './FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';
import { useStyleStore } from '@/stores/style.store';

const props = defineProps<{ tool: Tool & { category: string } }>();
const { tool } = toRefs(props);
const theme = useThemeVars();
const styleStore = useStyleStore();
</script>

<template>
  <router-link :to="tool.path" class="tool-card-link">
    <div class="tool-card" :class="{ 'tool-card--dark': styleStore.isDarkTheme }">
      <!-- 顶部：图标 + 标签区 -->
      <div class="card-top">
        <div class="card-icon">
          <n-icon size="26" :component="tool.icon" />
        </div>

        <div class="card-badges">
          <!-- "New" 胶囊标签 -->
          <div v-if="tool.isNew" class="badge-new">
            {{ $t('toolCard.new') }}
          </div>

          <!-- 收藏按钮 -->
          <FavoriteButton :tool="tool" />
        </div>
      </div>

      <!-- 工具名 -->
      <div class="card-title">
        {{ tool.name }}
      </div>

      <!-- 描述 -->
      <div class="card-desc">
        {{ tool.description }}
      </div>

      <!-- Glow 光晕层（hover 时显示）-->
      <div class="card-glow" />
    </div>
  </router-link>
</template>

<style lang="less" scoped>
.tool-card-link {
  text-decoration: none;
  display: block;
  height: 100%;
}

.tool-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 120px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: #ffffff;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 8px 24px rgba(99, 102, 241, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    border-color: rgba(99, 102, 241, 0.3);

    .card-glow {
      opacity: 1;
    }

    .card-icon {
      color: v-bind('theme.primaryColor');
    }
  }

  // 深色模式
  &.tool-card--dark {
    background: #1a1d27;
    border-color: rgba(255, 255, 255, 0.07);

    &:hover {
      box-shadow:
        0 8px 32px rgba(129, 140, 248, 0.18),
        0 0 0 1px rgba(129, 140, 248, 0.25);
      border-color: rgba(129, 140, 248, 0.35);

      .card-glow {
        background: radial-gradient(
          ellipse at 50% -20%,
          rgba(129, 140, 248, 0.14) 0%,
          transparent 70%
        );
      }
    }
  }
}

// Glow 光晕层
.card-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    ellipse at 50% -20%,
    rgba(99, 102, 241, 0.08) 0%,
    transparent 70%
  );
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-icon {
  color: v-bind('theme.textColor3');
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.card-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

// 胶囊 "New" 标签
.badge-new {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  background: rgba(99, 102, 241, 0.1);
  color: v-bind('theme.primaryColor');
  border: 1px solid rgba(99, 102, 241, 0.2);
  white-space: nowrap;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: v-bind('theme.textColor1');
  margin-bottom: 5px;
  line-height: 1.4;
  // 单行截断
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 12.5px;
  color: v-bind('theme.textColor3');
  line-height: 1.5;
  // 最多两行
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
</style>
