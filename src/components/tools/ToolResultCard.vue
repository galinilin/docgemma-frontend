<script setup lang="ts">
import { ref } from 'vue'
import type { ToolResult } from '@/types'
import { CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import JsonViewer from '../common/JsonViewer.vue'

defineProps<{
  result: ToolResult
}>()

const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- Header -->
    <button
      @click="toggleExpand"
      class="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
    >
      <component
        :is="isExpanded ? ChevronDownIcon : ChevronRightIcon"
        class="w-4 h-4 text-gray-400"
      />
      <component
        :is="result.success ? CheckCircleIcon : XCircleIcon"
        class="w-5 h-5"
        :class="result.success ? 'text-green-500' : 'text-red-500'"
      />
      <code class="text-sm font-medium text-gray-700">{{ result.tool_name }}</code>
      <span
        class="ml-auto text-xs"
        :class="result.success ? 'text-green-600' : 'text-red-600'"
      >
        {{ result.success ? 'success' : 'failed' }}
      </span>
      <span v-if="result.duration_ms" class="text-xs text-gray-400">
        {{ result.duration_ms.toFixed(0) }}ms
      </span>
    </button>

    <!-- Expanded content -->
    <div v-show="isExpanded" class="border-t border-gray-200 p-3 bg-gray-50">
      <JsonViewer :data="result.result" :max-height="200" />
    </div>
  </div>
</template>
