<script setup lang="ts">
import { computed } from 'vue'
import { getBezierPath, EdgeLabelRenderer } from '@vue-flow/core'

const props = defineProps<{
  id: string
  source: string
  target: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: any
  targetPosition: any
  data?: { active?: boolean; label?: string }
  label?: unknown
  selected?: boolean
}>()

const labelText = computed(() => {
  // Check if label is a string (Vue Flow can pass various types)
  if (typeof props.label === 'string') return props.label
  if (props.data?.label && typeof props.data.label === 'string') return props.data.label
  return null
})

const path = computed(() => {
  const [d, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })
  return { d, labelX, labelY }
})

const isActive = computed(() => props.data?.active ?? false)

const edgeClasses = computed(() => [
  'fill-none stroke-2 transition-all duration-200',
  isActive.value
    ? 'stroke-blue-500 stroke-[3px]'
    : 'stroke-gray-300',
])

const animationClasses = computed(() =>
  isActive.value ? 'animate-flow stroke-dasharray-[8,4]' : ''
)
</script>

<template>
  <g>
    <!-- Background path for wider click area -->
    <path
      :d="path.d"
      class="fill-none stroke-transparent stroke-[20px]"
    />

    <!-- Visible edge -->
    <path
      :d="path.d"
      :class="[edgeClasses, animationClasses]"
    />

    <!-- Edge label -->
    <EdgeLabelRenderer v-if="labelText">
      <div
        :style="{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${path.labelX}px, ${path.labelY}px)`,
          pointerEvents: 'all',
        }"
        class="px-2 py-0.5 bg-white text-xs text-gray-600 rounded border border-gray-200 shadow-sm"
      >
        {{ labelText }}
      </div>
    </EdgeLabelRenderer>
  </g>
</template>

<style scoped>
.stroke-dasharray-\[8\,4\] {
  stroke-dasharray: 8 4;
}

.animate-flow {
  animation: flow 0.5s linear infinite;
}

@keyframes flow {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
