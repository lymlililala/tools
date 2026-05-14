<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { useStyleStore } from '@/stores/style.store';

const event = ref<KeyboardEvent>();
const ripple = ref(false);
const styleStore = useStyleStore();

useEventListener(document, 'keydown', (e) => {
  // 避免劫持 Cmd+K 等功能快捷键
  if (e.metaKey || e.ctrlKey) return;
  event.value = e;
  // 触发波纹动画
  ripple.value = false;
  nextTick(() => { ripple.value = true; });
});

const fields = computed(() => {
  if (!event.value) return [];
  return [
    { label: 'Key', value: event.value.key, icon: '⌨' },
    { label: 'Code', value: event.value.code, icon: '🔤' },
    { label: 'KeyCode', value: String(event.value.keyCode), icon: '#' },
    { label: 'Location', value: locationLabel(event.value.location), icon: '📍' },
    {
      label: 'Modifiers',
      value: [
        event.value.metaKey && 'Meta',
        event.value.shiftKey && 'Shift',
        event.value.ctrlKey && 'Ctrl',
        event.value.altKey && 'Alt',
      ].filter(Boolean).join(' + ') || 'None',
      icon: '⚡',
    },
  ];
});

function locationLabel(loc: number) {
  const map: Record<number, string> = { 0: 'Standard (0)', 1: 'Left (1)', 2: 'Right (2)', 3: 'Numpad (3)' };
  return map[loc] ?? String(loc);
}

// 特殊键的 emoji
const keyEmoji = computed(() => {
  if (!event.value) return null;
  const map: Record<string, string> = {
    Enter: '↵', Backspace: '⌫', Tab: '⇥', Escape: 'ESC', ArrowUp: '↑',
    ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ' ': '␣',
    Delete: 'Del', Home: '↖', End: '↘', PageUp: '⇞', PageDown: '⇟',
  };
  return map[event.value.key] ?? null;
});

const displayKey = computed(() => {
  if (!event.value) return '';
  return keyEmoji.value ?? (event.value.key.length === 1 ? event.value.key.toUpperCase() : event.value.key);
});

// 波纹动画清除
watch(ripple, (v) => {
  if (v) {
    setTimeout(() => { ripple.value = false; }, 600);
  }
});
</script>

<template>
  <div class="keycode-root" :class="{ dark: styleStore.isDarkTheme }">
    <!-- 主展示区 -->
    <div class="key-stage" :class="{ 'has-key': !!event, rippling: ripple }">
      <div v-if="!event" class="key-placeholder">
        <div class="placeholder-icon">⌨️</div>
        <div class="placeholder-text">
          Press any key on your keyboard
        </div>
        <div class="placeholder-hint">
          Results appear instantly
        </div>
      </div>

      <template v-else>
        <!-- 波纹圆圈 -->
        <div v-if="ripple" class="ripple-ring" />
        <div v-if="ripple" class="ripple-ring ripple-ring--delay" />

        <!-- 大键位展示 -->
        <div class="key-display">
          {{ displayKey }}
        </div>
        <div class="key-code-display">
          keyCode: <strong>{{ event.keyCode }}</strong>
        </div>

        <!-- 修饰键胶囊 -->
        <div v-if="event.metaKey || event.shiftKey || event.ctrlKey || event.altKey" class="modifier-badges">
          <span v-if="event.metaKey" class="mod-badge">Meta</span>
          <span v-if="event.ctrlKey" class="mod-badge">Ctrl</span>
          <span v-if="event.shiftKey" class="mod-badge">Shift</span>
          <span v-if="event.altKey" class="mod-badge">Alt</span>
        </div>
      </template>
    </div>

    <!-- 详细信息卡片 -->
    <div v-if="event" class="key-details">
      <div v-for="field in fields" :key="field.label" class="detail-card">
        <div class="detail-icon">{{ field.icon }}</div>
        <div class="detail-content">
          <div class="detail-label">{{ field.label }}</div>
          <div class="detail-value">{{ field.value }}</div>
        </div>
        <button class="copy-btn" :title="`Copy ${field.label}`" @click.stop="() => { navigator.clipboard?.writeText(field.value) }">
          <icon-mdi-content-copy style="font-size: 13px" />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.keycode-root {
  max-width: 600px;
  margin: 0 auto;
}

// ─── Stage ────────────────────────────────────────────────────
.key-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  cursor: default;
  background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.06) 100%);
  border: 1.5px solid rgba(99,102,241,0.15);
  transition: all 0.2s ease;

  &.has-key {
    background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%);
    border-color: rgba(99,102,241,0.35);
  }

  &.rippling {
    border-color: rgba(99,102,241,0.5);
  }

  .dark & {
    background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%);
    border-color: rgba(99,102,241,0.2);

    &.has-key {
      background: linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(168,85,247,0.14) 100%);
      border-color: rgba(129,140,248,0.4);
    }
  }
}

// ─── Ripple ───────────────────────────────────────────────────
.ripple-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.6);
  animation: ripple-out 0.6s ease-out forwards;
  pointer-events: none;

  &--delay {
    animation-delay: 0.1s;
    border-color: rgba(168,85,247,0.4);
  }
}

@keyframes ripple-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
}

// ─── Key Display ──────────────────────────────────────────────
.key-display {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  animation: pop-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  min-width: 80px;
  text-align: center;
}

@keyframes pop-in {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.key-code-display {
  font-size: 14px;
  opacity: 0.55;
  margin-top: 6px;
  font-family: 'SF Mono', monospace;
}

.modifier-badges {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.mod-badge {
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(99,102,241,0.15);
  color: #6366f1;
  border: 1px solid rgba(99,102,241,0.3);
  font-size: 11px;
  font-weight: 700;
}

// ─── Placeholder ──────────────────────────────────────────────
.key-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.5;
}

.placeholder-icon {
  font-size: 40px;
  animation: float 2.5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.placeholder-text {
  font-size: 15px;
  font-weight: 500;
}

.placeholder-hint {
  font-size: 12px;
  opacity: 0.7;
}

// ─── Detail Cards ─────────────────────────────────────────────
.key-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(99,102,241,0.12);
  background: rgba(99,102,241,0.04);
  transition: border-color 0.15s, background 0.15s;
  animation: slide-up 0.2s ease both;

  &:hover {
    border-color: rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.07);
  }

  .dark & {
    background: rgba(99,102,241,0.07);
    border-color: rgba(129,140,248,0.15);

    &:hover {
      border-color: rgba(129,140,248,0.3);
    }
  }
}

@keyframes slide-up {
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}

.detail-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.5;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'SF Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6366f1;

  .dark & {
    color: #818cf8;
  }
}

.copy-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s;
  color: inherit;

  &:hover {
    opacity: 1;
    background: rgba(99,102,241,0.1);
  }
}
</style>
