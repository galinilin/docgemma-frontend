<script setup lang="ts">
import { CpuChipIcon } from '@heroicons/vue/24/solid'

defineProps<{
  text: string
}>()
</script>

<template>
  <div class="flex gap-3 px-4 py-2">
    <!-- Avatar -->
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
      <CpuChipIcon class="w-4 h-4 text-purple-600" />
    </div>

    <!-- Streaming content -->
    <div class="flex-1">
      <div class="px-4 py-2 bg-white border border-gray-200 rounded-lg">
        <p class="whitespace-pre-wrap text-gray-800">
          {{ text }}
          <span class="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-0.5" />
        </p>
      </div>
    </div>
  </div>
</template>
