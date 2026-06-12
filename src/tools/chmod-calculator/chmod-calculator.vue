<script setup lang="ts">
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation } from './chmod-calculator.service';
import type { Group, Scope } from './chmod-calculator.types';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 权限矩阵定义 ──────────────────────────────────────────────
const scopes: { scope: Scope; label: string; value: number }[] = [
  { scope: 'read', label: 'Read', value: 4 },
  { scope: 'write', label: 'Write', value: 2 },
  { scope: 'execute', label: 'Execute', value: 1 },
];

const groups: { group: Group; label: string; short: string }[] = [
  { group: 'owner', label: 'Owner', short: 'u' },
  { group: 'group', label: 'Group', short: 'g' },
  { group: 'public', label: 'Public', short: 'o' },
];

// ── 权限状态 ──────────────────────────────────────────────────
const permissions = ref({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

// ── 快捷预设 ──────────────────────────────────────────────────
const presets = computed(() => [
  { label: '755', desc: t('tools.chmod-calculator.preset755'), octal: '755' },
  { label: '644', desc: t('tools.chmod-calculator.preset644'), octal: '644' },
  { label: '700', desc: t('tools.chmod-calculator.preset700'), octal: '700' },
  { label: '777', desc: t('tools.chmod-calculator.preset777'), octal: '777' },
]);

function applyPreset(octal: string) {
  const digits = octal.split('').map(Number);
  const groupKeys: Group[] = ['owner', 'group', 'public'];
  groupKeys.forEach((g, i) => {
    const d = digits[i] ?? 0;
    permissions.value[g].read = (d & 4) !== 0;
    permissions.value[g].write = (d & 2) !== 0;
    permissions.value[g].execute = (d & 1) !== 0;
  });
}

// ── 列/行 全选 ────────────────────────────────────────────────
function toggleGroup(group: Group) {
  const cur = scopes.every(s => permissions.value[group][s.scope]);
  scopes.forEach((s) => {
    permissions.value[group][s.scope] = !cur;
  });
}

function toggleScope(scope: Scope) {
  const cur = groups.every(g => permissions.value[g.group][scope]);
  groups.forEach((g) => {
    permissions.value[g.group][scope] = !cur;
  });
}

function isGroupAllChecked(group: Group) {
  return scopes.every(s => permissions.value[group][s.scope]);
}

function isScopeAllChecked(scope: Scope) {
  return groups.every(g => permissions.value[g.group][scope]);
}

// ── 计算结果 ──────────────────────────────────────────────────
const octal = computed(() => computeChmodOctalRepresentation({ permissions: permissions.value }));
const symbolic = computed(() => computeChmodSymbolicRepresentation({ permissions: permissions.value }));

// ── 可编辑文件名 ──────────────────────────────────────────────
const filename = ref('path');

// ── 完整命令 ──────────────────────────────────────────────────
const command = computed(() => `chmod ${octal.value} ${filename.value || 'path'}`);

// ── 复制命令 ──────────────────────────────────────────────────
const { copy: copyCmd, isJustCopied } = useCopy({
  source: command,
  createToast: false,
});
const message = useMessage();
async function handleCopyCmd() {
  await copyCmd();
  message.success(t('tools.chmod-calculator.copied'));
}

// ── 符号分组显示（每3个一段，加空格） ────────────────────────
const symbolicGroups = computed(() => {
  const s = symbolic.value;
  return [s.slice(0, 3), s.slice(3, 6), s.slice(6, 9)];
});
</script>

<template>
  <div class="chmod-root">
    <!-- ── 快捷预设 ─────────────────────────────────────────── -->
    <div class="presets">
      <button
        v-for="p in presets"
        :key="p.label"
        class="preset-btn"
        :class="{ active: octal === p.octal }"
        @click="applyPreset(p.octal)"
      >
        <span class="preset-num">{{ p.label }}</span>
        <span class="preset-desc">{{ p.desc }}</span>
      </button>
    </div>

    <!-- ── 权限矩阵 ─────────────────────────────────────────── -->
    <div class="perm-card">
      <table class="perm-table">
        <thead>
          <tr>
            <!-- 空角 -->
            <th class="th-empty" />
            <!-- 列头（点击全选整列） -->
            <th
              v-for="g in groups"
              :key="g.group"
              class="th-group"
              @click="toggleGroup(g.group)"
            >
              <div class="group-header" :class="{ 'all-checked': isGroupAllChecked(g.group) }">
                <svg
                  class="group-check-icon"
                  :class="{ visible: isGroupAllChecked(g.group) }"
                  width="10" height="10" viewBox="0 0 10 10"
                >
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>{{ g.label }}</span>
                <span class="group-short">({{ g.short }})</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ scope, label, value } in scopes"
            :key="scope"
            class="perm-row"
          >
            <!-- 行头（点击全选整行） -->
            <td class="td-scope" @click="toggleScope(scope)">
              <div class="scope-header" :class="{ 'all-checked': isScopeAllChecked(scope) }">
                <span class="scope-label">{{ label }}</span>
                <span class="scope-value">({{ value }})</span>
              </div>
            </td>
            <!-- 复选框格子 -->
            <td
              v-for="g in groups"
              :key="g.group"
              class="td-check"
              :class="{ checked: permissions[g.group][scope] }"
              @click="permissions[g.group][scope] = !permissions[g.group][scope]"
            >
              <div class="checkbox" :class="{ checked: permissions[g.group][scope] }">
                <svg v-if="permissions[g.group][scope]" class="check-icon" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── 结果展示区 ───────────────────────────────────────── -->
    <div class="result-section">
      <!-- 八进制数字 -->
      <div class="octal-display">
        <span
          v-for="(digit, i) in octal.split('')"
          :key="i"
          class="octal-digit"
          :class="digit === '0' ? 'digit-zero' : 'digit-active'"
        >{{ digit }}</span>
      </div>

      <!-- 符号表示（Linux 风格） -->
      <div class="symbolic-display">
        <span
          v-for="(group, gi) in symbolicGroups"
          :key="gi"
          class="sym-group"
        >
          <span
            v-for="(ch, ci) in group.split('')"
            :key="ci"
            class="sym-char"
            :class="ch === '-' ? 'sym-dash' : 'sym-active'"
          >{{ ch }}</span>
        </span>
      </div>

      <!-- 可编辑命令行 -->
      <div class="command-row">
        <div class="command-box">
          <span class="cmd-prefix">chmod {{ octal }}</span>
          <input
            v-model="filename"
            class="cmd-filename"
            placeholder="path"
            spellcheck="false"
            autocomplete="off"
          >
        </div>
        <button
          class="copy-btn"
          :class="{ copied: isJustCopied }"
          :title="isJustCopied ? t('tools.chmod-calculator.justCopied') : t('tools.chmod-calculator.copyCommand')"
          @click="handleCopyCmd()"
        >
          <svg v-if="!isJustCopied" width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ isJustCopied ? t('tools.chmod-calculator.copiedLabel') : t('tools.chmod-calculator.copyLabel') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.chmod-root {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── 快捷预设 ─────────────────────────────────────────────────── */
.presets {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #6366f1;
    background: rgba(99,102,241,0.05);
  }

  &.active {
    border-color: #6366f1;
    background: rgba(99,102,241,0.08);
    .preset-num { color: #4f46e5; }
  }

  .dark & {
    border-color: #333;
    &:hover { border-color: #6366f1; background: rgba(99,102,241,0.1); }
    &.active { border-color: #6366f1; background: rgba(99,102,241,0.12); }
  }
}

.preset-num {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  .dark & { color: #eee; }
}

.preset-desc {
  font-size: 11px;
  color: #999;
  .dark & { color: #666; }
}

/* ── 权限矩阵卡片 ─────────────────────────────────────────────── */
.perm-card {
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);

  .dark & {
    background: #1a1a1a;
    border-color: #2a2a2a;
    box-shadow: none;
  }
}

.perm-table {
  width: 100%;
  border-collapse: collapse;
}

/* ── 列头 ─────────────────────────────────────────────────────── */
.th-empty {
  width: 100px;
  background: rgba(0,0,0,0.02);
  border-bottom: 1px solid #f0f0f0;
  .dark & { background: rgba(255,255,255,0.02); border-bottom-color: #2a2a2a; }
}

.th-group {
  padding: 12px 0;
  text-align: center;
  background: rgba(0,0,0,0.02);
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;

  &:hover { background: rgba(99,102,241,0.07); }

  .dark & {
    background: rgba(255,255,255,0.02);
    border-bottom-color: #2a2a2a;
    &:hover { background: rgba(99,102,241,0.1); }
  }
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  transition: color 0.15s;

  &.all-checked { color: #4f46e5; }
  .dark & { color: #aaa; &.all-checked { color: #a5b4fc; } }
}

.group-short {
  font-size: 11px;
  color: #aaa;
  .dark & { color: #555; }
}

.group-check-icon {
  color: #4f46e5;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;

  &.visible { opacity: 1; }
  .dark & { color: #a5b4fc; }
}

/* ── 行 ───────────────────────────────────────────────────────── */
.perm-row {
  &:not(:last-child) td {
    border-bottom: 1px solid #f5f5f5;
    .dark & { border-bottom-color: #222; }
  }
}

/* ── 行头 ─────────────────────────────────────────────────────── */
.td-scope {
  padding: 14px 12px 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
  &:hover { background: rgba(99,102,241,0.05); }
  .dark &:hover { background: rgba(99,102,241,0.08); }
}

.scope-header {
  display: flex;
  align-items: baseline;
  gap: 5px;
  white-space: nowrap;

  &.all-checked .scope-label { color: #4f46e5; }
  .dark & .all-checked .scope-label { color: #a5b4fc; }
}

.scope-label {
  font-size: 13.5px;
  font-weight: 600;
  color: #333;
  transition: color 0.15s;
  .dark & { color: #ddd; }
}

.scope-value {
  font-size: 11px;
  color: #bbb;
  .dark & { color: #555; }
}

/* ── 复选格子 ─────────────────────────────────────────────────── */
.td-check {
  text-align: center;
  padding: 14px 0;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: rgba(99,102,241,0.06); }
  &.checked { background: rgba(99,102,241,0.04); }

  .dark & {
    &:hover { background: rgba(99,102,241,0.1); }
    &.checked { background: rgba(99,102,241,0.08); }
  }
}

.checkbox {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: 2px solid #94a3b8;  // 明显的深灰边框
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &.checked {
    background: #6366f1;
    border-color: #6366f1;
  }

  &:not(.checked):hover {
    border-color: #6366f1;
  }

  .dark & {
    border-color: #555;
    &.checked { background: #6366f1; border-color: #6366f1; }
    &:not(.checked):hover { border-color: #818cf8; }
  }
}

.check-icon {
  color: #fff;
  flex-shrink: 0;
}

/* ── 结果区 ───────────────────────────────────────────────────── */
.result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

/* 八进制大数字 */
.octal-display {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.octal-digit {
  font-size: 64px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s;

  &.digit-zero {
    color: #ccc;
    .dark & { color: #444; }
  }
  &.digit-active {
    color: #6366f1;
    .dark & { color: #a5b4fc; }
  }
}

/* Linux 符号表示 */
.symbolic-display {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 22px;
  letter-spacing: 0.06em;
  padding: 8px 16px;
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);

  .dark & {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.07);
  }
}

.sym-group {
  display: flex;
  gap: 2px;
}

.sym-char {
  display: inline-block;
  min-width: 1ch;
  text-align: center;
  transition: color 0.15s;

  &.sym-dash {
    color: #ccc;
    .dark & { color: #444; }
  }
  &.sym-active {
    color: #6366f1;
    font-weight: 700;
    .dark & { color: #a5b4fc; }
  }
}

/* 可编辑命令行 */
.command-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.command-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  min-width: 0;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .dark & {
    background: #111;
    border-color: #2a2a2a;
    &:focus-within { border-color: #6366f1; }
  }
}

.cmd-prefix {
  color: #6366f1;
  font-weight: 600;
  white-space: nowrap;
  .dark & { color: #a5b4fc; }
}

.cmd-filename {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  color: #333;
  min-width: 0;
  caret-color: #6366f1;

  .dark & { color: #ddd; }

  &::placeholder { color: #bbb; }
}

.copy-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.06); }
  &.copied { border-color: #22c55e; color: #16a34a; background: rgba(34,197,94,0.08); }

  .dark & {
    border-color: #333; color: #bbb;
    &:hover { border-color: #6366f1; color: #a5b4fc; }
    &.copied { border-color: #22c55e; color: #4ade80; }
  }
}
</style>
