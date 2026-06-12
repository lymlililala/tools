<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { t } = useI18n();
const { y: scrollY } = useWindowScroll();

// ── 所有 Git 命令数据（结构化，易于扩展）─────────────────────
interface Command { description: string; code: string; danger?: boolean }
interface Section { id: string; title: string; commands: Command[] }

const sections = computed((): Section[] => [
  {
    id: 'configuration',
    title: 'Configuration',
    commands: [
      { description: t('tools.git-memo.cmd.setGlobalName'), code: 'git config --global user.name "[name]"' },
      { description: t('tools.git-memo.cmd.setGlobalEmail'), code: 'git config --global user.email "[email]"' },
      { description: t('tools.git-memo.cmd.listConfig'), code: 'git config --list' },
      { description: t('tools.git-memo.cmd.setEditor'), code: 'git config --global core.editor "[editor]"' },
    ],
  },
  {
    id: 'get-started',
    title: 'Get Started',
    commands: [
      { description: t('tools.git-memo.cmd.initRepo'), code: 'git init' },
      { description: t('tools.git-memo.cmd.cloneRepo'), code: 'git clone [url]' },
      { description: t('tools.git-memo.cmd.cloneWithDir'), code: 'git clone [url] [directory]' },
    ],
  },
  {
    id: 'staging',
    title: 'Staging',
    commands: [
      { description: t('tools.git-memo.cmd.statusCheck'), code: 'git status' },
      { description: t('tools.git-memo.cmd.addFile'), code: 'git add [file]' },
      { description: t('tools.git-memo.cmd.addAll'), code: 'git add .' },
      { description: t('tools.git-memo.cmd.unstageFile'), code: 'git restore --staged [file]' },
      { description: t('tools.git-memo.cmd.discardFile'), code: 'git restore [file]' },
    ],
  },
  {
    id: 'commit',
    title: 'Commit',
    commands: [
      { description: t('tools.git-memo.cmd.commitAll'), code: 'git commit -am "[commit message]"' },
      { description: t('tools.git-memo.cmd.commitStaged'), code: 'git commit -m "[commit message]"' },
      { description: t('tools.git-memo.cmd.amendMsg'), code: 'git commit --amend' },
      { description: t('tools.git-memo.cmd.amendNoEdit'), code: 'git commit --amend --no-edit' },
    ],
  },
  {
    id: 'branching',
    title: 'Branching',
    commands: [
      { description: t('tools.git-memo.cmd.listBranches'), code: 'git branch' },
      { description: t('tools.git-memo.cmd.listRemoteBranches'), code: 'git branch -r' },
      { description: t('tools.git-memo.cmd.createBranch'), code: 'git branch [branch-name]' },
      { description: t('tools.git-memo.cmd.createAndSwitch'), code: 'git switch -c [branch-name]' },
      { description: t('tools.git-memo.cmd.switchBranch'), code: 'git switch [branch-name]' },
      { description: t('tools.git-memo.cmd.deleteMergedBranch'), code: 'git branch -d [branch-name]' },
      { description: t('tools.git-memo.cmd.deleteBranchForce'), code: 'git branch -D [branch-name]', danger: true },
      { description: t('tools.git-memo.cmd.renameMasterToMain'), code: 'git branch -m master main' },
    ],
  },
  {
    id: 'merging',
    title: 'Merging & Rebasing',
    commands: [
      { description: t('tools.git-memo.cmd.mergeBranch'), code: 'git merge [branch-name]' },
      { description: t('tools.git-memo.cmd.rebaseBranch'), code: 'git rebase [branch-name]' },
      { description: t('tools.git-memo.cmd.abortRebase'), code: 'git rebase --abort' },
      { description: t('tools.git-memo.cmd.continueRebase'), code: 'git rebase --continue' },
    ],
  },
  {
    id: 'remote',
    title: 'Remote',
    commands: [
      { description: t('tools.git-memo.cmd.listRemotes'), code: 'git remote -v' },
      { description: t('tools.git-memo.cmd.addRemote'), code: 'git remote add [name] [url]' },
      { description: t('tools.git-memo.cmd.pullAndMerge'), code: 'git pull' },
      { description: t('tools.git-memo.cmd.fetchOnly'), code: 'git fetch origin' },
      { description: t('tools.git-memo.cmd.pushBranch'), code: 'git push origin [branch-name]' },
      { description: t('tools.git-memo.cmd.pushAndSetUpstream'), code: 'git push -u origin [branch-name]' },
      { description: t('tools.git-memo.cmd.deleteRemoteBranch'), code: 'git push origin --delete [branch-name]', danger: true },
    ],
  },
  {
    id: 'stash',
    title: 'Stash',
    commands: [
      { description: t('tools.git-memo.cmd.stashChanges'), code: 'git stash' },
      { description: t('tools.git-memo.cmd.stashWithMsg'), code: 'git stash save "[message]"' },
      { description: t('tools.git-memo.cmd.listStashes'), code: 'git stash list' },
      { description: t('tools.git-memo.cmd.popStash'), code: 'git stash pop' },
      { description: t('tools.git-memo.cmd.clearStashes'), code: 'git stash clear', danger: true },
    ],
  },
  {
    id: 'history',
    title: 'History & Log',
    commands: [
      { description: t('tools.git-memo.cmd.viewLog'), code: 'git log' },
      { description: t('tools.git-memo.cmd.compactLog'), code: 'git log --oneline --graph' },
      { description: t('tools.git-memo.cmd.showCommit'), code: 'git show [commit]' },
      { description: t('tools.git-memo.cmd.diffWorking'), code: 'git diff' },
      { description: t('tools.git-memo.cmd.diffStaged'), code: 'git diff --staged' },
    ],
  },
  {
    id: 'mistakes',
    title: 'I\'ve Made a Mistake',
    commands: [
      { description: t('tools.git-memo.cmd.resetKeep'), code: 'git reset HEAD~1' },
      { description: t('tools.git-memo.cmd.resetNKeep'), code: 'git reset HEAD~N' },
      { description: t('tools.git-memo.cmd.resetHard'), code: 'git reset HEAD~1 --hard', danger: true },
      { description: t('tools.git-memo.cmd.resetToRemote'), code: 'git fetch origin\ngit reset --hard origin/[branch-name]', danger: true },
      { description: t('tools.git-memo.cmd.revertCommit'), code: 'git revert [commit-hash]' },
    ],
  },
  {
    id: 'tags',
    title: 'Tags',
    commands: [
      { description: t('tools.git-memo.cmd.listTags'), code: 'git tag' },
      { description: t('tools.git-memo.cmd.createLightTag'), code: 'git tag [tag-name]' },
      { description: t('tools.git-memo.cmd.createAnnotatedTag'), code: 'git tag -a [tag-name] -m "[message]"' },
      { description: t('tools.git-memo.cmd.pushTag'), code: 'git push origin [tag-name]' },
      { description: t('tools.git-memo.cmd.deleteLocalTag'), code: 'git tag -d [tag-name]' },
    ],
  },
]);

// ── TOC 激活项（滚动跟随）────────────────────────────────────
const activeSection = ref('configuration');

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );
  sections.value.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) {
      observer.observe(el);
    }
  });
  onBeforeUnmount(() => observer.disconnect());
});

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ── 复制命令 ──────────────────────────────────────────────────
const copiedCode = ref('');
async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
  }
  catch {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  copiedCode.value = code;
  setTimeout(() => (copiedCode.value = ''), 2000);
}

// ── 返回顶部 ──────────────────────────────────────────────────
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <div class="tool-wide git-root" :class="{ dark: styleStore.isDarkTheme }">
    <div class="git-layout">
      <!-- ── 左侧 TOC (sticky) ─────────────────────────────── -->
      <nav class="toc-nav">
        <div class="toc-title">
          {{ t('tools.git-memo.toc') }}
        </div>
        <ul class="toc-list">
          <li
            v-for="s in sections"
            :key="s.id"
            class="toc-item"
            :class="{ active: activeSection === s.id }"
            @click="scrollToSection(s.id)"
          >
            {{ s.title }}
          </li>
        </ul>
      </nav>

      <!-- ── 右侧内容 ───────────────────────────────────────── -->
      <div class="git-content">
        <section
          v-for="section in sections"
          :id="section.id"
          :key="section.id"
          class="section-block"
        >
          <!-- 节标题 -->
          <h2 class="section-title">
            {{ section.title }}
          </h2>

          <!-- 命令列表 -->
          <div class="commands-grid">
            <div
              v-for="cmd in section.commands"
              :key="cmd.code"
              class="cmd-card"
              :class="{ danger: cmd.danger }"
            >
              <div class="cmd-desc">
                <span v-if="cmd.danger" class="danger-badge" :title="t('tools.git-memo.dangerTooltip')">⚠</span>
                {{ cmd.description }}
              </div>
              <div class="code-wrap" :class="{ copied: copiedCode === cmd.code }">
                <pre class="cmd-code">{{ cmd.code }}</pre>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedCode === cmd.code }"
                  :title="copiedCode === cmd.code ? t('tools.git-memo.copiedTooltip') : t('tools.git-memo.copyTooltip')"
                  @click="copyCode(cmd.code)"
                >
                  <svg v-if="copiedCode !== cmd.code" width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ── 返回顶部 ──────────────────────────────────────────── -->
    <transition name="fade-up">
      <button v-if="scrollY > 400" class="back-to-top" :title="t('tools.git-memo.backToTop')" @click="scrollToTop">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </transition>
  </div>
</template>

<style lang="less" scoped>
.git-root {
  position: relative;
}

/* ── 主布局 ───────────────────────────────────────────────────── */
.git-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

/* ── TOC 导航 ─────────────────────────────────────────────────── */
.toc-nav {
  position: sticky;
  top: 20px;
  padding: 0;

  @media (max-width: 720px) {
    display: none;
  }
}

.toc-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #aaa;
  margin-bottom: 10px;
  padding-left: 10px;

  .dark & { color: #666; }
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.toc-item {
  font-size: 12.5px;
  color: #888;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-left: 2px solid transparent;

  &:hover { color: #333; background: rgba(0,0,0,0.04); }
  &.active {
    color: #6366f1;
    font-weight: 600;
    border-left-color: #6366f1;
    background: rgba(99,102,241,0.06);
  }

  .dark & {
    color: #666;
    &:hover { color: #ccc; background: rgba(255,255,255,0.04); }
    &.active { color: #a5b4fc; border-left-color: #6366f1; background: rgba(99,102,241,0.1); }
  }
}

/* ── 内容区 ───────────────────────────────────────────────────── */
.git-content {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* ── 节块 ─────────────────────────────────────────────────────── */
.section-block {
  scroll-margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #f0f0f0;

  .dark & { color: #eee; border-bottom-color: #2a2a2a; }
}

/* ── 命令卡片网格 ─────────────────────────────────────────────── */
.commands-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cmd-card {
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  &.danger { border-color: rgba(239,68,68,0.2); background: rgba(254,242,242,0.5); }
  &.danger:hover { border-color: rgba(239,68,68,0.4); }

  .dark & {
    background: #1a1a1a;
    border-color: #2a2a2a;
    &:hover { border-color: #444; }
    &.danger { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.25); }
  }
}

.cmd-desc {
  font-size: 13px;
  color: #555;
  padding: 8px 14px 6px;
  display: flex;
  align-items: center;
  gap: 5px;

  .dark & { color: #aaa; }
  .danger & { color: #b91c1c; }
  .dark .danger & { color: #fca5a5; }
}

.danger-badge {
  font-size: 12px;
  flex-shrink: 0;
}

/* ── 代码块 ───────────────────────────────────────────────────── */
.code-wrap {
  position: relative;
  background: #f7f8fa;
  border-top: 1px solid #eee;

  .dark & { background: #111; border-top-color: #2a2a2a; }

  &:hover .copy-btn,
  &.copied .copy-btn { opacity: 1; }

  .danger & { background: rgba(254,226,226,0.5); border-top-color: rgba(239,68,68,0.15); }
  .dark .danger & { background: rgba(239,68,68,0.08); }
}

.cmd-code {
  margin: 0;
  padding: 10px 42px 10px 14px;
  font-family: 'SF Mono', 'Menlo', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 13px;
  color: #1e1e2e;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;

  .dark & { color: #cdd6f4; }
  .danger & { color: #991b1b; }
  .dark .danger & { color: #fca5a5; }
}

/* ── 复制按钮 ─────────────────────────────────────────────────── */
.copy-btn {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 26px;
  height: 26px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background: #fff;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;

  &:hover { background: #f3f4f6; border-color: #9ca3af; color: #333; }
  &.copied { opacity: 1; border-color: #22c55e; background: rgba(34,197,94,0.08); color: #16a34a; }

  .dark & {
    background: #1e1e1e;
    border-color: #3a3a3a;
    color: #aaa;
    &:hover { background: #2a2a2a; border-color: #555; color: #eee; }
    &.copied { border-color: #22c55e; background: rgba(34,197,94,0.12); color: #4ade80; }
  }
}

/* ── 返回顶部 ─────────────────────────────────────────────────── */
.back-to-top {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #6366f1;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  transition: background 0.15s, transform 0.1s;
  z-index: 100;

  &:hover { background: #4f46e5; transform: translateY(-2px); }
  &:active { transform: none; }
}

.fade-up-enter-active,
.fade-up-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-up-enter-from,
.fade-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
