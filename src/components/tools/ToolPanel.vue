<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline'
import ToolResultCard from './ToolResultCard.vue'

const sessionStore = useSessionStore()

const isExpanded = ref(true)

const hasContent = computed(() =>
  sessionStore.subtasks.length > 0 || sessionStore.toolResults.length > 0
)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="bg-white">
    <!-- Header (always visible) -->
    <button
      @click="toggleExpand"
      class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-700">Tool Activity</span>
        <span
          v-if="sessionStore.toolResults.length > 0"
          class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
        >
          {{ sessionStore.toolResults.length }} result(s)
        </span>
        <span
          v-if="sessionStore.executingTool"
          class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full animate-pulse"
        >
          Running: {{ sessionStore.executingTool.name }}
        </span>
      </div>
      <component
        :is="isExpanded ? ChevronDownIcon : ChevronUpIcon"
        class="w-5 h-5 text-gray-400"
      />
    </button>

    <!-- Collapsible content -->
    <div v-show="isExpanded" class="border-t border-gray-100">
      <!-- Subtasks -->
      <div v-if="sessionStore.subtasks.length > 0" class="p-4 border-b border-gray-100">
        <h4 class="text-sm font-medium text-gray-600 mb-2">Subtasks</h4>
        <ul class="space-y-2">
          <li
            v-for="(subtask, index) in sessionStore.subtasks"
            :key="index"
            class="flex items-start gap-2 text-sm"
          >
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
              :class="{
                'bg-green-100 text-green-700': subtask.status === 'completed',
                'bg-yellow-100 text-yellow-700': subtask.status === 'pending',
                'bg-red-100 text-red-700': subtask.status === 'failed',
              }"
            >
              {{ index + 1 }}
            </span>
            <span class="text-gray-700">{{ subtask.intent }}</span>
            <span v-if="subtask.tool_hint" class="text-gray-400 text-xs">
              ({{ subtask.tool_hint }})
            </span>
          </li>
        </ul>
      </div>

      <!-- Tool results -->
      <div v-if="sessionStore.toolResults.length > 0" class="p-4">
        <h4 class="text-sm font-medium text-gray-600 mb-2">Tool Results</h4>
        <div class="space-y-3">
          <ToolResultCard
            v-for="(result, index) in sessionStore.toolResults"
            :key="index"
            :result="result"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!hasContent && !sessionStore.executingTool"
        class="p-4 text-center text-gray-400 text-sm"
      >
        No tool activity yet
      </div>

      <!-- Currently executing -->
      <div
        v-if="sessionStore.executingTool"
        class="p-4 border-t border-gray-100"
      >
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span class="text-sm text-gray-600">
            Executing: <code class="text-blue-600">{{ sessionStore.executingTool.name }}</code>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
