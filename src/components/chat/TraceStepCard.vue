<script setup lang="ts">
import type { TraceStep } from '@/types/trace'
import { LightBulbIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  step: TraceStep
  isLast: boolean
}>()

const icon = {
  thought: LightBulbIcon,
  tool_call: MagnifyingGlassIcon,
  synthesis: CheckCircleIcon,
}[props.step.type]

const iconBg = {
  thought: 'bg-amber-100 text-amber-600',
  tool_call: 'bg-blue-100 text-blue-600',
  synthesis: 'bg-green-100 text-green-600',
}[props.step.type]
</script>

<template>
  <div class="flex gap-3">
    <div class="flex flex-col items-center">
      <div :class="['w-8 h-8 rounded-full flex items-center justify-center', iconBg]">
        <component :is="icon" class="w-4 h-4" />
      </div>
      <div v-if="!isLast" class="w-0.5 flex-1 bg-gray-200 mt-2" />
    </div>
    <div class="flex-1 pb-4">
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-900">{{ step.label }}</span>
        <span v-if="step.duration_ms" class="text-xs text-gray-400">
          {{ (step.duration_ms / 1000).toFixed(1) }}s
        </span>
      </div>
      <p class="text-sm text-gray-600 mt-1">{{ step.description }}</p>
      <p
        v-if="step.tool_result_summary"
        class="text-sm text-gray-500 mt-2 bg-gray-50 px-3 py-2 rounded"
      >
        {{ step.tool_result_summary }}
      </p>
    </div>
  </div>
</template>
