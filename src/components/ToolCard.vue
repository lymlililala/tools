<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import FavoriteButton from './FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';
import { useStyleStore } from '@/stores/style.store';
import { toolDescOf, toolTitleOf } from '@/lib/tool-i18n-keys';

const props = defineProps<{ tool: Tool & { category: string } }>();
const { tool } = toRefs(props);
const theme = useThemeVars();
const styleStore = useStyleStore();

// 工具名/描述按当前语言响应式取（工具定义里的 name/description 锁死英文）。
const { t, te } = useI18n();
const title = computed(() => toolTitleOf(tool.value, t, te));
const description = computed(() => toolDescOf(tool.value, t, te));
</script>

<template>
  <router-link :to="tool.path" class="tool-card-link">
    <div class="tool-card" :class="{ 'tool-card--dark': styleStore.isDarkTheme }">
      <!-- 顶部：图标 + 标签区 -->
      <div class="card-top">
        <div class="card-icon-wrap">
          <div class="card-icon">
            <n-icon size="20" :component="tool.icon" />
          </div>
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
        {{ title }}
      </div>

      <!-- 描述 -->
      <div class="card-desc">
        {{ description }}
      </div>

      <!-- Glow 光晕层（hover 时显示） -->
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
  min-height: 112px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: #fafafa;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    background: #fff;
    box-shadow:
      0 6px 20px rgba(99, 102, 241, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.05);
    border-color: rgba(99, 102, 241, 0.28);

    .card-glow { opacity: 1; }
    .card-icon-wrap { background: rgba(99, 102, 241, 0.12); }
    .card-icon { color: v-bind('theme.primaryColor'); }
  }

  // 深色模式
  &.tool-card--dark {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.07);

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      box-shadow:
        0 6px 24px rgba(129, 140, 248, 0.14),
        0 0 0 1px rgba(129, 140, 248, 0.2);
      border-color: rgba(129, 140, 248, 0.3);

      .card-icon-wrap { background: rgba(129, 140, 248, 0.14); }
      .card-glow {
        background: radial-gradient(
          ellipse at 50% -10%,
          rgba(129, 140, 248, 0.12) 0%,
          transparent 65%
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
  transition: opacity 0.25s ease;
  background: radial-gradient(
    ellipse at 50% -10%,
    rgba(99, 102, 241, 0.06) 0%,
    transparent 65%
  );
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 9px;
}

// Icon 背景包装器
.card-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.18s ease;

  .tool-card--dark & {
    background: rgba(255, 255, 255, 0.06);
  }
}

.card-icon {
  color: v-bind('theme.textColor2');
  transition: color 0.18s ease;
  display: flex;
  align-items: center;
}

.card-badges {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

// 胶囊 "New" 标签
.badge-new {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: rgba(99, 102, 241, 0.1);
  color: v-bind('theme.primaryColor');
  border: 1px solid rgba(99, 102, 241, 0.18);
  white-space: nowrap;
}

.card-title {
  font-size: 13.5px;
  font-weight: 600;
  color: v-bind('theme.textColor1');
  margin-bottom: 4px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 12px;
  color: v-bind('theme.textColor3');
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
</style>
