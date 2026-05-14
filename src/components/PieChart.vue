<script setup lang="ts">
interface Segment {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  segments: Segment[]
  size?: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

const sz = computed(() => props.size ?? 180)

function draw() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio ?? 1
  el.width = sz.value * dpr
  el.height = sz.value * dpr
  el.style.width = `${sz.value}px`
  el.style.height = `${sz.value}px`
  ctx.scale(dpr, dpr)

  const cx = sz.value / 2
  const cy = sz.value / 2
  const r = sz.value / 2 - 8
  const innerR = r * 0.55

  const total = props.segments.reduce((s, seg) => s + seg.value, 0)
  if (total <= 0) return

  let startAngle = -Math.PI / 2

  ctx.clearRect(0, 0, sz.value, sz.value)

  for (const seg of props.segments) {
    const angle = (seg.value / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, startAngle + angle)
    ctx.closePath()
    ctx.fillStyle = seg.color
    ctx.fill()
    startAngle += angle
  }

  // 内圆（donut）
  ctx.beginPath()
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
  ctx.fillStyle = 'transparent'
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

watchEffect(() => {
  nextTick(draw)
})
</script>

<template>
  <div class="pie-wrap">
    <canvas ref="canvas" :width="sz" :height="sz" />
    <div class="legend">
      <div v-for="seg in segments" :key="seg.label" class="legend-item">
        <span class="legend-dot" :style="{ background: seg.color }" />
        <span class="legend-label">{{ seg.label }}</span>
        <span class="legend-pct">
          {{ segments.reduce((s,x)=>s+x.value,0) > 0 ? ((seg.value / segments.reduce((s,x)=>s+x.value,0)) * 100).toFixed(1) + '%' : '—' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.pie-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

canvas {
  display: block;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  opacity: 0.75;
}

.legend-pct {
  font-weight: 700;
  font-family: 'SF Mono', monospace;
  font-size: 11px;
}
</style>
