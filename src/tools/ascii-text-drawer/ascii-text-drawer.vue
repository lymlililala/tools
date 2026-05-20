<script setup lang="ts">
import figlet from 'figlet';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const { t } = useI18n();

const input = ref('Ascii ART');
const font = useStorage('ascii-text-drawer:font', 'Standard');
const width = useStorage('ascii-text-drawer:width', 80);
const output = ref('');
const errored = ref(false);
const errorReason = ref('');
const processing = ref(false);

figlet.defaults({ fontPath: '//unpkg.com/figlet@1.6.0/fonts/' });

// 宽度边界值：10 ~ 500
const WIDTH_MIN = 10;
const WIDTH_MAX = 500;

function stepWidth(delta: number) {
  width.value = Math.min(Math.max((width.value ?? WIDTH_MIN) + delta, WIDTH_MIN), WIDTH_MAX);
}
function onWidthBlur() {
  if (!Number.isFinite(width.value) || width.value < WIDTH_MIN) width.value = WIDTH_MIN;
  if (width.value > WIDTH_MAX) width.value = WIDTH_MAX;
}

watchEffect(async () => {
  // 空输入：直接清空，不报错
  if (!input.value.trim()) {
    output.value = '';
    errored.value = false;
    errorReason.value = '';
    processing.value = false;
    return;
  }

  processing.value = true;
  try {
    const options: figlet.Options = {
      font: font.value as figlet.Fonts,
      width: width.value,
      whitespaceBreak: true,
    };
    output.value = await (new Promise<string>((resolve, reject) =>
      figlet.text(input.value, options,
        (err, text) => {
          if (err) { reject(err); return; }
          resolve(text ?? '');
        })));
    errored.value = false;
    errorReason.value = '';
  }
  catch (e: any) {
    errored.value = true;
    // 尝试给出具体原因
    const msg: string = e?.message ?? '';
    if (/font/i.test(msg)) {
      errorReason.value = t('tools.ascii-text-drawer.errorFont');
    }
    else if (/width/i.test(msg) || (width.value ?? 0) < WIDTH_MIN) {
      errorReason.value = t('tools.ascii-text-drawer.errorWidth', { min: WIDTH_MIN, max: WIDTH_MAX });
    }
    else if (/unsupported|encoding|non-ascii/i.test(msg)) {
      errorReason.value = t('tools.ascii-text-drawer.errorUnsupported');
    }
    else {
      errorReason.value = t('tools.ascii-text-drawer.errorGeneral');
    }
  }
  processing.value = false;
});

const fonts = ['1Row', '3-D', '3D Diagonal', '3D-ASCII', '3x5', '4Max', '5 Line Oblique', 'AMC 3 Line', 'AMC 3 Liv1', 'AMC AAA01', 'AMC Neko', 'AMC Razor', 'AMC Razor2', 'AMC Slash', 'AMC Slider', 'AMC Thin', 'AMC Tubes', 'AMC Untitled', 'ANSI Shadow', 'ASCII New Roman', 'Acrobatic', 'Alligator', 'Alligator2', 'Alpha', 'Alphabet', 'Arrows', 'Avatar', 'B1FF', 'B1FF', 'Banner', 'Banner3-D', 'Banner3', 'Banner4', 'Barbwire', 'Basic', 'Bear', 'Bell', 'Benjamin', 'Big Chief', 'Big Money-ne', 'Big Money-nw', 'Big Money-se', 'Big Money-sw', 'Big', 'Bigfig', 'Binary', 'Block', 'Blocks', 'Bloody', 'Bolger', 'Braced', 'Bright', 'Broadway KB', 'Broadway', 'Bubble', 'Bulbhead', 'Caligraphy', 'Caligraphy2', 'Calvin S', 'Cards', 'Catwalk', 'Chiseled', 'Chunky', 'Coinstak', 'Cola', 'Colossal', 'Computer', 'Contessa', 'Contrast', 'Cosmike', 'Crawford', 'Crawford2', 'Crazy', 'Cricket', 'Cursive', 'Cyberlarge', 'Cybermedium', 'Cybersmall', 'Cygnet', 'DANC4', 'DOS Rebel', 'DWhistled', 'Dancing Font', 'Decimal', 'Def Leppard', 'Delta Corps Priest 1', 'Diamond', 'Diet Cola', 'Digital', 'Doh', 'Doom', 'Dot Matrix', 'Double Shorts', 'Double', 'Dr Pepper', 'Efti Chess', 'Efti Font', 'Efti Italic', 'Efti Piti', 'Efti Robot', 'Efti Wall', 'Efti Water', 'Electronic', 'Elite', 'Epic', 'Fender', 'Filter', 'Fire Font-k', 'Fire Font-s', 'Flipped', 'Flower Power', 'Four Tops', 'Fraktur', 'Fun Face', 'Fun Faces', 'Fuzzy', 'Georgi16', 'Georgia11', 'Ghost', 'Ghoulish', 'Glenyn', 'Goofy', 'Gothic', 'Graceful', 'Gradient', 'Graffiti', 'Greek', 'Heart Left', 'Heart Right', 'Henry 3D', 'Hex', 'Hieroglyphs', 'Hollywood', 'Horizontal Left', 'Horizontal Right', 'ICL-1900', 'Impossible', 'Invita', 'Isometric1', 'Isometric2', 'Isometric3', 'Isometric4', 'Italic', 'Ivrit', 'JS Block Letters', 'JS Bracket Letters', 'JS Capital Curves', 'JS Cursive', 'JS Stick Letters', 'Jacky', 'Jazmine', 'Jerusalem', 'Katakana', 'Kban', 'Keyboard', 'Knob', 'Konto Slant', 'Konto', 'LCD', 'Larry 3D 2', 'Larry 3D', 'Lean', 'Letters', 'Lil Devil', 'Line Blocks', 'Linux', 'Lockergnome', 'Madrid', 'Marquee', 'Maxfour', 'Merlin1', 'Merlin2', 'Mike', 'Mini', 'Mirror', 'Mnemonic', 'Modular', 'Morse', 'Morse2', 'Moscow', 'Mshebrew210', 'Muzzle', 'NScript', 'NT Greek', 'NV Script', 'Nancyj-Fancy', 'Nancyj-Improved', 'Nancyj-Underlined', 'Nancyj', 'Nipples', 'O8', 'OS2', 'Octal', 'Ogre', 'Old Banner', 'Patorjk\'s Cheese', 'Patorjk-HeX', 'Pawp', 'Peaks Slant', 'Peaks', 'Pebbles', 'Pepper', 'Poison', 'Puffy', 'Puzzle', 'Pyramid', 'Rammstein', 'Rectangles', 'Red Phoenix', 'Relief', 'Relief2', 'Reverse', 'Roman', 'Rot13', 'Rot13', 'Rotated', 'Rounded', 'Rowan Cap', 'Rozzo', 'Runic', 'Runyc', 'S Blood', 'SL Script', 'Santa Clara', 'Script', 'Serifcap', 'Shadow', 'Shimrod', 'Short', 'Slant Relief', 'Slant', 'Slide', 'Small Caps', 'Small Isometric1', 'Small Keyboard', 'Small Poison', 'Small Script', 'Small Shadow', 'Small Slant', 'Small Tengwar', 'Small', 'Soft', 'Speed', 'Spliff', 'Stacey', 'Stampate', 'Stampatello', 'Standard', 'Star Strips', 'Star Wars', 'Stellar', 'Stforek', 'Stick Letters', 'Stop', 'Straight', 'Stronger Than All', 'Sub-Zero', 'Swamp Land', 'Swan', 'Sweet', 'THIS', 'Tanja', 'Tengwar', 'Term', 'Test1', 'The Edge', 'Thick', 'Thin', 'Thorned', 'Three Point', 'Ticks Slant', 'Ticks', 'Tiles', 'Tinker-Toy', 'Tombstone', 'Train', 'Trek', 'Tsalagi', 'Tubular', 'Twisted', 'Two Point', 'USA Flag', 'Univers', 'Varsity', 'Wavy', 'Weird', 'Wet Letter', 'Whimsy', 'Wow'];
</script>

<template>
  <div class="atd-wrapper">
    <c-card class="atd-card">
      <!-- 输入区 -->
      <div class="field-block">
        <label class="field-label" for="atd-input">{{ t('tools.ascii-text-drawer.inputLabel') }}</label>
        <c-input-text
          id="atd-input"
          v-model:value="input"
          :placeholder="t('tools.ascii-text-drawer.inputPlaceholder')"
          raw-text
          multiline
          rows="3"
          class="atd-input"
        />
        <!-- 字段级错误提示（不替换输出区） -->
        <transition name="slide-down">
          <div v-if="errored && !processing" class="field-error">
            <icon-mdi-alert-circle-outline class="error-icon" />
            {{ errorReason }}
          </div>
        </transition>
      </div>

      <div class="divider" />

      <!-- Font + Width 控件行 -->
      <div class="controls-row">
        <!-- 字体选择 -->
        <div class="control-group control-group--font">
          <label class="field-label">{{ t('tools.ascii-text-drawer.fontLabel') }}</label>
          <c-select
            v-model:value="font"
            :options="fonts"
            searchable="true"
            :placeholder="t('tools.ascii-text-drawer.fontPlaceholder')"
            class="font-select"
          />
        </div>

        <!-- 宽度步进器 -->
        <div class="control-group control-group--width">
          <label class="field-label">{{ t('tools.ascii-text-drawer.widthLabel', { min: WIDTH_MIN, max: WIDTH_MAX }) }}</label>
          <div class="stepper" :class="{ 'stepper--focus': false }">
            <button
              class="stepper-btn"
              :disabled="(width ?? WIDTH_MIN) <= WIDTH_MIN"
              :aria-label="t('tools.ascii-text-drawer.decreaseWidth')"
              @click="stepWidth(-10)"
            >
              −
            </button>
            <input
              v-model.number="width"
              class="stepper-input"
              type="number"
              :min="WIDTH_MIN"
              :max="WIDTH_MAX"
              placeholder="80"
              @blur="onWidthBlur"
            />
            <button
              class="stepper-btn"
              :disabled="(width ?? 0) >= WIDTH_MAX"
              :aria-label="t('tools.ascii-text-drawer.increaseWidth')"
              @click="stepWidth(10)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="divider" />

      <!-- 输出区：始终显示，加载/错误/空 三种状态 -->
      <div class="output-section">
        <div class="output-header">
          <label class="field-label">{{ t('tools.ascii-text-drawer.previewLabel') }}</label>
          <!-- 加载指示 -->
          <div v-if="processing" class="loading-badge">
            <n-spin :size="12" />
            <span>{{ t('tools.ascii-text-drawer.loadingFont') }}</span>
          </div>
        </div>

        <div
          class="output-frame"
          :class="{
            'output-frame--loading': processing,
            'output-frame--error': errored && !processing,
            'output-frame--empty': !input.trim() && !processing,
          }"
        >
          <TextareaCopyable
            v-if="!errored && !processing"
            :value="output"
            copy-placement="outside"
            class="atd-output"
          />

          <!-- 错误状态遮罩 -->
          <div v-else-if="errored && !processing" class="output-state-overlay">
            <icon-mdi-alert-circle-outline class="state-icon state-icon--error" />
            <span>{{ t('tools.ascii-text-drawer.generateFailed') }}</span>
            <span class="state-sub">{{ errorReason }}</span>
          </div>

          <!-- 加载状态遮罩 -->
          <div v-else-if="processing" class="output-state-overlay">
            <n-spin size="large" />
            <span>{{ t('tools.ascii-text-drawer.generating') }}</span>
          </div>

          <!-- 空状态 -->
          <div v-else class="output-state-overlay output-state-overlay--empty">
            <icon-mdi-text-box-outline class="state-icon state-icon--empty" />
            <span>{{ t('tools.ascii-text-drawer.emptyHint') }}</span>
          </div>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
/* ── 总容器 ── */
.atd-wrapper {
  display: flex;
  justify-content: center;
}

.atd-card {
  width: 100%;
  max-width: 640px;
}

/* ── 字段标签 ── */
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

/* ── 输入区 ── */
.field-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.atd-input {
  width: 100%;
}

/* 字段级错误 */
.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #dc3545;
  padding: 5px 8px;
  background: rgba(220, 53, 69, 0.07);
  border-radius: 6px;
  border-left: 3px solid #dc3545;
}

.error-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* 滑入动画 */
.slide-down-enter-active { transition: all 0.2s ease; }
.slide-down-leave-active { transition: all 0.15s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── 分割线 ── */
.divider {
  height: 1px;
  background: var(--n-divider-color, #f0f0f0);
  margin: 14px 0;
}

/* ── 控件行：Font + Width ── */
.controls-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.control-group--font {
  flex: 2;
  min-width: 160px;
}

.control-group--width {
  flex: 1;
  min-width: 140px;
}

.font-select {
  width: 100%;
}

/* ── 自定义步进器 ── */
.stepper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  overflow: hidden;
  background: var(--n-card-color, #fff);
  transition: border-color 0.2s;
}

.stepper:focus-within {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.1);
}

.stepper-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--n-text-color-2, #555);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
  padding: 0;
}

.stepper-btn:hover:not(:disabled) {
  background: rgba(24, 160, 88, 0.08);
  color: var(--primary-color, #18a058);
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-input {
  flex: 1;
  min-width: 0;
  text-align: center;
  border: none;
  border-left: 1px solid var(--n-border-color, #e8e8e8);
  border-right: 1px solid var(--n-border-color, #e8e8e8);
  outline: none;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--n-text-color, #333);
  background: transparent;
  padding: 6px 4px;
  appearance: textfield;
  -moz-appearance: textfield;
  height: 36px;
}

.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

/* ── 输出区 ── */
.output-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.loading-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--primary-color, #18a058);
}

.output-frame {
  border: 1.5px solid var(--n-border-color, #e8e8e8);
  border-radius: 8px;
  overflow: hidden;
  min-height: 120px;
  transition: border-color 0.2s;
}

.output-frame--error {
  border-color: rgba(220, 53, 69, 0.3);
  background: rgba(220, 53, 69, 0.03);
}

.output-frame--empty {
  border-style: dashed;
}

/* 状态遮罩（加载/错误/空） */
.output-state-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--n-text-color-3, #aaa);
  font-size: 14px;
}

.output-state-overlay--empty {
  color: #ccc;
}

.state-icon {
  font-size: 32px;
}

.state-icon--error {
  color: #dc3545;
}

.state-icon--empty {
  color: #ccc;
}

.state-sub {
  font-size: 12px;
  color: #dc3545;
  text-align: center;
}

.atd-output {
  width: 100%;
}

/* ── 移动端：Font / Width 上下堆叠 ── */
@media (max-width: 500px) {
  .controls-row {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group--font,
  .control-group--width {
    min-width: 0;
    flex: none;
    width: 100%;
  }
}
</style>
