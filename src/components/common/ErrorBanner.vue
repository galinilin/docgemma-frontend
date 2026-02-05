<script setup lang="ts">
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  message: string
  recoverable?: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div
    class="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <ExclamationTriangleIcon class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="text-sm font-medium text-red-800">Error</p>
        <p class="text-sm text-red-700 mt-1">{{ message }}</p>
        <p v-if="!recoverable" class="text-xs text-red-600 mt-2">
          Please refresh the page to continue.
        </p>
      </div>
      <button
        v-if="recoverable"
        @click="emit('dismiss')"
        class="text-red-400 hover:text-red-600 transition-colors"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>
