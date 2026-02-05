<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size: number // percentage for left pane
    min?: number
    max?: number
    direction?: 'horizontal' | 'vertical'
  }>(),
  {
    min: 20,
    max: 80,
    direction: 'horizontal',
  }
)

const emit = defineEmits<{
  'update:size': [value: number]
}>()

const isDragging = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const leftStyle = computed(() => ({
  width: props.direction === 'horizontal' ? `${props.size}%` : '100%',
  height: props.direction === 'vertical' ? `${props.size}%` : '100%',
}))

const rightStyle = computed(() => ({
  width: props.direction === 'horizontal' ? `${100 - props.size}%` : '100%',
  height: props.direction === 'vertical' ? `${100 - props.size}%` : '100%',
}))

function startDrag(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  let newSize: number

  if (props.direction === 'horizontal') {
    newSize = ((e.clientX - rect.left) / rect.width) * 100
  } else {
    newSize = ((e.clientY - rect.top) / rect.height) * 100
  }

  // Clamp to min/max
  newSize = Math.max(props.min, Math.min(props.max, newSize))
  emit('update:size', newSize)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex h-full"
    :class="{
      'flex-row': direction === 'horizontal',
      'flex-col': direction === 'vertical',
      'select-none': isDragging,
    }"
  >
    <!-- Left/Top pane -->
    <div :style="leftStyle" class="overflow-hidden">
      <slot name="left" />
    </div>

    <!-- Divider -->
    <div
      class="flex-shrink-0 bg-gray-200 hover:bg-blue-400 transition-colors"
      :class="{
        'w-1 cursor-col-resize': direction === 'horizontal',
        'h-1 cursor-row-resize': direction === 'vertical',
        'bg-blue-400': isDragging,
      }"
      @mousedown="startDrag"
    />

    <!-- Right/Bottom pane -->
    <div :style="rightStyle" class="overflow-hidden">
      <slot name="right" />
    </div>
  </div>
</template>
