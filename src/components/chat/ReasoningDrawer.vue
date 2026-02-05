<script setup lang="ts">
import type { ClinicalTrace } from '@/types/trace'
import TraceStepCard from './TraceStepCard.vue'
import { ClockIcon, BeakerIcon } from '@heroicons/vue/24/outline'

defineProps<{
  trace: ClinicalTrace
  isOpen: boolean
}>()
</script>

<template>
  <div v-if="isOpen" class="mt-3 border border-gray-200 rounded-lg bg-white shadow-sm">
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <span class="text-sm font-medium text-gray-700">Clinical Reasoning Process</span>
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <BeakerIcon class="w-4 h-4" />
          {{ trace.tools_consulted }} source(s)
        </span>
        <span class="flex items-center gap-1">
          <ClockIcon class="w-4 h-4" />
          {{ (trace.total_duration_ms / 1000).toFixed(1) }}s
        </span>
      </div>
    </div>
    <div class="p-4">
      <TraceStepCard
        v-for="(step, i) in trace.steps"
        :key="i"
        :step="step"
        :is-last="i === trace.steps.length - 1"
      />
    </div>
  </div>
</template>
