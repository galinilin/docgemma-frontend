<script setup lang="ts">
import { CpuChipIcon } from '@heroicons/vue/24/solid'

defineProps<{
  text: string
}>()
</script>

<template>
  <div class="flex gap-3 py-2">
    <!-- Avatar -->
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
      <CpuChipIcon class="w-4 h-4 text-purple-600 animate-pulse" />
    </div>

    <!-- Status text -->
    <div class="flex items-center">
      <p class="text-sm text-gray-500 italic">{{ text }}</p>
    </div>
  </div>
</template>
