<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { VueFlowNodeData } from '@/utils/graphHelpers'
import {
  CpuChipIcon,
  WrenchIcon,
  CodeBracketIcon,
  ArrowsPointingOutIcon,
  CircleStackIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  id: string
  data: VueFlowNodeData
  selected?: boolean
}>()

// Icon mapping
const iconComponent = computed(() => {
  switch (props.data.style.icon) {
    case 'CpuChipIcon':
      return CpuChipIcon
    case 'WrenchIcon':
      return WrenchIcon
    case 'CodeBracketIcon':
      return CodeBracketIcon
    case 'ArrowsPointingOutIcon':
      return ArrowsPointingOutIcon
    default:
      return CircleStackIcon
  }
})

// Dynamic classes based on status
const nodeClasses = computed(() => {
  const { style, statusStyle } = props.data
  return [
    'w-44 px-3 py-2 rounded-lg border-2 shadow-sm transition-all duration-200',
    style.bgColor,
    style.borderColor,
    statusStyle.bgOpacity,
    statusStyle.animate ? 'animate-pulse-slow ring-2' : '',
    statusStyle.ringColor,
    props.selected ? 'ring-2 ring-blue-500' : '',
  ]
})

const textClasses = computed(() => props.data.style.textColor)
</script>

<template>
  <div :class="nodeClasses">
    <!-- Input handle -->
    <Handle
      type="target"
      :position="Position.Top"
      class="!bg-gray-400 !w-2 !h-2"
    />

    <!-- Content -->
    <div class="flex items-center gap-2">
      <component
        :is="iconComponent"
        class="w-5 h-5 flex-shrink-0"
        :class="textClasses"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate" :class="textClasses">
          {{ data.label }}
        </p>
        <p class="text-xs text-gray-500 capitalize">
          {{ data.status }}
        </p>
      </div>
    </div>

    <!-- Output handle -->
    <Handle
      type="source"
      :position="Position.Bottom"
      class="!bg-gray-400 !w-2 !h-2"
    />
  </div>
</template>
