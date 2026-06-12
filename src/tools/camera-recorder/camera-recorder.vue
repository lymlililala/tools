<script setup lang="ts">
import _ from 'lodash';
import { useMediaRecorder } from './useMediaRecorder';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();

interface Media { type: 'image' | 'video'; value: string; createdAt: Date }

const styleStore = useStyleStore();

const {
  videoInputs: cameras,
  audioInputs: microphones,
  permissionGranted,
  isSupported,
  ensurePermissions,
} = useDevicesList({
  requestPermissions: true,
  constraints: { video: true, audio: true },
  onUpdated() {
    refreshCurrentDevices();
  },
});

const video = ref<HTMLVideoElement>();
const medias = ref<Media[]>([]);
const currentCamera = ref(cameras.value[0]?.deviceId);
const currentMicrophone = ref(microphones.value[0]?.deviceId);
const permissionCannotBePrompted = ref(false);

const {
  stream,
  start,
  stop,
  enabled: isMediaStreamAvailable,
} = useUserMedia({
  constraints: computed(() => ({
    video: { deviceId: currentCamera.value },
    ...(currentMicrophone.value ? { audio: { deviceId: currentMicrophone.value } } : {}),
  })),
  autoSwitch: true,
});

const {
  isRecordingSupported,
  onRecordAvailable,
  startRecording,
  stopRecording,
  pauseRecording,
  recordingState,
  resumeRecording,
} = useMediaRecorder({ stream });

onRecordAvailable((value) => {
  medias.value.unshift({ type: 'video', value, createdAt: new Date() });
});

function refreshCurrentDevices() {
  if (_.isNil(currentCamera) || !cameras.value.find(i => i.deviceId === currentCamera.value)) {
    currentCamera.value = cameras.value[0]?.deviceId;
  }
  if (_.isNil(microphones) || !microphones.value.find(i => i.deviceId === currentMicrophone.value)) {
    currentMicrophone.value = microphones.value[0]?.deviceId;
  }
}

function takeScreenshot() {
  if (!video.value) {
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;
  canvas.getContext('2d')?.drawImage(video.value, 0, 0);
  medias.value.unshift({ type: 'image', value: canvas.toDataURL('image/png'), createdAt: new Date() });
}

watchEffect(() => {
  if (video.value && stream.value) {
    video.value.srcObject = stream.value;
  }
});

onBeforeUnmount(() => stop());

async function requestPermissions() {
  try {
    await ensurePermissions();
  }
  catch {
    permissionCannotBePrompted.value = true;
  }
}

function downloadMedia({ type, value, createdAt }: Media) {
  const link = document.createElement('a');
  link.href = value;
  link.download = `${type}-${createdAt.getTime()}.${type === 'image' ? 'png' : 'webm'}`;
  link.click();
}

// 录制时长计时器
const recordingSeconds = ref(0);
let recordTimer: ReturnType<typeof setInterval> | null = null;

watch(recordingState, (state) => {
  if (state === 'recording') {
    recordingSeconds.value = 0;
    recordTimer = setInterval(() => recordingSeconds.value++, 1000);
  }
  else if (state === 'stopped') {
    if (recordTimer) {
      clearInterval(recordTimer);
      recordTimer = null;
    }
    recordingSeconds.value = 0;
  }
  else if (state === 'paused') {
    if (recordTimer) {
      clearInterval(recordTimer);
      recordTimer = null;
    }
  }
});

onBeforeUnmount(() => {
  if (recordTimer) {
    clearInterval(recordTimer);
  }
});

function formatTime(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}
</script>

<template>
  <div class="cam-root" :class="{ dark: styleStore.isDarkTheme }">
    <!-- 浏览器不支持 -->
    <div v-if="!isSupported" class="state-card state-error">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <div>
        <div class="state-title">
          {{ t('tools.camera-recorder.notSupported') }}
        </div>
        <div class="state-desc">
          {{ t('tools.camera-recorder.notSupportedDesc') }}
        </div>
      </div>
    </div>

    <!-- 需要授权 -->
    <div v-else-if="!permissionGranted" class="state-card">
      <!-- 视频占位区 -->
      <div class="video-placeholder">
        <div class="placeholder-inner">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" opacity="0.3">
            <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <span class="placeholder-hint">{{ t('tools.camera-recorder.videoPlaceholder') }}</span>
        </div>
      </div>

      <div class="perm-area">
        <div v-if="permissionCannotBePrompted" class="perm-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <div>
            <div style="font-weight:600;margin-bottom:2px">
              {{ t('tools.camera-recorder.permBlocked') }}
            </div>
            {{ t('tools.camera-recorder.permBlockedDesc') }}
          </div>
        </div>
        <div v-else class="perm-prompt">
          <div class="perm-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="1.8" />
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            {{ t('tools.camera-recorder.permRequired') }}
          </div>
          <p class="perm-desc">
            {{ t('tools.camera-recorder.permRequiredDesc') }}
          </p>
          <button class="btn-primary btn-lg" @click="requestPermissions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2" />
            </svg>
            {{ t('tools.camera-recorder.enablePerm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 主界面 -->
    <div v-else class="main-card">
      <!-- 设备选择区 -->
      <div class="device-selects">
        <div class="device-field">
          <label class="device-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2" />
            </svg>
            {{ t('tools.camera-recorder.camera') }}
          </label>
          <c-select
            v-model:value="currentCamera"
            :options="cameras.map(({ deviceId, label }) => ({ value: deviceId, label }))"
            :placeholder="t('tools.camera-recorder.selectCamera')"
          />
        </div>
        <div v-if="currentMicrophone && microphones.length > 0" class="device-field">
          <label class="device-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="1.8" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            {{ t('tools.camera-recorder.microphone') }}
          </label>
          <c-select
            v-model:value="currentMicrophone"
            :options="microphones.map(({ deviceId, label }) => ({ value: deviceId, label }))"
            :placeholder="t('tools.camera-recorder.selectMicrophone')"
          />
        </div>
      </div>

      <!-- 视频区 / 占位区 -->
      <div class="video-area">
        <template v-if="isMediaStreamAvailable">
          <video ref="video" autoplay playsinline class="video-el" />
          <!-- 录制状态指示器 -->
          <div v-if="recordingState !== 'stopped'" class="rec-badge" :class="{ paused: recordingState === 'paused' }">
            <span class="rec-dot" />
            {{ recordingState === 'paused' ? t('tools.camera-recorder.paused') : t('tools.camera-recorder.recording') }}
            {{ formatTime(recordingSeconds) }}
          </div>
        </template>
        <div v-else class="video-placeholder">
          <div class="placeholder-inner">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" opacity="0.25">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
            </svg>
            <span class="placeholder-hint">{{ t('tools.camera-recorder.clickToStart') }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮区 -->
      <div class="controls">
        <!-- 未开启时：只显示「开启摄像头」 -->
        <div v-if="!isMediaStreamAvailable" class="controls-start">
          <button class="btn-primary btn-lg" @click="start">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2.2" />
            </svg>
            {{ t('tools.camera-recorder.startCamera') }}
          </button>
        </div>

        <!-- 已开启时：截图 + 录制控制 -->
        <div v-else class="controls-active">
          <!-- 左侧：截图 -->
          <button class="btn-secondary" @click="takeScreenshot">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" stroke-width="2" />
              <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
            {{ t('tools.camera-recorder.screenshot') }}
          </button>

          <!-- 右侧：录制 -->
          <div class="rec-controls">
            <template v-if="isRecordingSupported">
              <button
                v-if="recordingState === 'stopped'"
                class="btn-danger"
                @click="startRecording"
              >
                <span class="dot-icon" />
                {{ t('tools.camera-recorder.startRecording') }}
              </button>
              <button
                v-if="recordingState === 'recording'"
                class="btn-secondary"
                @click="pauseRecording"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
                {{ t('tools.camera-recorder.pauseRecording') }}
              </button>
              <button
                v-if="recordingState === 'paused'"
                class="btn-secondary"
                @click="resumeRecording"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor" />
                </svg>
                {{ t('tools.camera-recorder.resumeRecording') }}
              </button>
              <button
                v-if="recordingState !== 'stopped'"
                class="btn-stop"
                @click="stopRecording"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
                </svg>
                {{ t('tools.camera-recorder.stopAndSave') }}
              </button>
            </template>
            <span v-else class="no-support-hint">{{ t('tools.camera-recorder.noRecordingSupport') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 媒体库 -->
    <div v-if="medias.length > 0" class="media-grid">
      <div v-for="({ type, value, createdAt }, index) in medias" :key="index" class="media-card">
        <div class="media-preview">
          <img v-if="type === 'image'" :src="value" :alt="t('tools.camera-recorder.screenshotAlt')">
          <video v-else :src="value" controls />
        </div>
        <div class="media-footer">
          <div class="media-info">
            <span class="media-type-badge" :class="type">{{ type === 'image' ? `📷 ${t('tools.camera-recorder.screenshotBadge')}` : `🎬 ${t('tools.camera-recorder.videoBadge')}` }}</span>
            <span class="media-time">{{ createdAt.toLocaleTimeString() }}</span>
          </div>
          <div class="media-actions">
            <button class="icon-btn" :title="t('tools.camera-recorder.download')" @click="downloadMedia({ type, value, createdAt })">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v13M6 11l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
            <button class="icon-btn icon-btn-del" :title="t('tools.camera-recorder.delete')" @click="medias = medias.filter((_ignored, i) => i !== index)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.cam-root {
  max-width: 800px;
  margin: 0 auto;
}

/* ── 状态卡片 ─────────────────────────────────────────────────── */
.state-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  .dark & { background: #1a1a1a; border-color: #333; }
}

.state-error {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 24px;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.state-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.state-desc {
  font-size: 13px;
  color: #666;
  .dark & { color: #aaa; }
}

/* ── 视频占位区 ───────────────────────────────────────────────── */
.video-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: #0f0f0f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.placeholder-hint {
  font-size: 13px;
  opacity: 0.4;
}

/* ── 授权区域 ─────────────────────────────────────────────────── */
.perm-area {
  padding: 24px;
}

.perm-error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: #dc2626;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  line-height: 1.6;
}

.perm-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 8px 0;
}

.perm-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #222;
  .dark & { color: #eee; }
}

.perm-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.65;
  max-width: 420px;
  margin: 0;
  .dark & { color: #aaa; }
}

/* ── 主界面 ───────────────────────────────────────────────────── */
.main-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  .dark & { background: #1a1a1a; border-color: #333; }
}

/* ── 设备选择 ─────────────────────────────────────────────────── */
.device-selects {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
  .dark & { border-bottom-color: #2a2a2a; }
}

.device-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  min-width: 64px;
  .dark & { color: #bbb; }
}

/* ── 视频区 ───────────────────────────────────────────────────── */
.video-area {
  position: relative;
  background: #0f0f0f;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── 录制指示器 ───────────────────────────────────────────────── */
.rec-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  background: rgba(0,0,0,0.7);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(4px);

  &.paused { background: rgba(80,80,80,0.75); }
}

.rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 1s ease-in-out infinite;

  .paused & { animation: none; background: #aaa; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ── 控制按钮 ─────────────────────────────────────────────────── */
.controls {
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  .dark & { border-top-color: #2a2a2a; }
}

.controls-start {
  display: flex;
  justify-content: center;
}

.controls-active {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.rec-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── 按钮样式 ─────────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 22px;
  border-radius: 8px;
  border: none;
  background: #10b981;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover { background: #059669; transform: translateY(-1px); }
  &:active { transform: none; }
}

.btn-lg { padding: 11px 28px; font-size: 15px; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 7px;
  border: 1.5px solid #d1d5db;
  background: transparent;
  color: #444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #9ca3af; background: #f9fafb; color: #111; }

  .dark & {
    border-color: #444; color: #ccc;
    &:hover { border-color: #666; background: #2a2a2a; color: #eee; }
  }
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 7px;
  border: none;
  background: #ef4444;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #dc2626; }
}

.btn-stop {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 7px;
  border: 1.5px solid #d1d5db;
  background: #fff;
  color: #333;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #9ca3af; background: #f3f4f6; }

  .dark & {
    background: #222; border-color: #444; color: #eee;
    &:hover { background: #2e2e2e; border-color: #666; }
  }
}

.dot-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  flex-shrink: 0;
}

.no-support-hint {
  font-size: 12.5px;
  color: #aaa;
  font-style: italic;
}

/* ── 媒体库 ───────────────────────────────────────────────────── */
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 20px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.media-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  .dark & { background: #1a1a1a; border-color: #333; }

  img, video {
    width: 100%;
    height: auto;
    display: block;
    max-height: 220px;
    object-fit: cover;
  }
}

.media-preview {
  background: #000;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-type-badge {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;

  &.image { background: rgba(99,102,241,0.1); color: #6366f1; }
  &.video { background: rgba(239,68,68,0.1); color: #ef4444; }
}

.media-time {
  font-size: 11.5px;
  color: #999;
}

.media-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #9ca3af; background: #f3f4f6; color: #222; }

  .dark & {
    border-color: #444; color: #aaa;
    &:hover { border-color: #666; background: #2a2a2a; color: #eee; }
  }
}

.icon-btn-del:hover {
  border-color: #fca5a5 !important;
  background: rgba(239,68,68,0.06) !important;
  color: #ef4444 !important;
}
</style>
