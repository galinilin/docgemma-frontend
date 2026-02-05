<script setup lang="ts">
import { computed } from 'vue'
import type { PendingToolApproval } from '@/types'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import JsonViewer from '../common/JsonViewer.vue'

const props = defineProps<{
  approval: PendingToolApproval
}>()

const emit = defineEmits<{
  approve: []
  reject: [reason?: string]
  close: []
}>()

const toolName = computed(() => props.approval.tool_name)
const toolArgs = computed(() => props.approval.tool_args)
const intent = computed(() => props.approval.subtask_intent)

function handleApprove() {
  emit('approve')
}

function handleReject() {
  emit('reject')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50"
      @click="handleClose"
    />

    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-yellow-50 border-b border-yellow-100">
        <div class="flex items-center gap-2">
          <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600" />
          <h3 class="font-medium text-gray-900">Tool Approval Required</h3>
        </div>
        <button
          @click="handleClose"
          class="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-4">
        <!-- Intent -->
        <div>
          <h4 class="text-sm font-medium text-gray-600 mb-1">Intent</h4>
          <p class="text-gray-800">{{ intent }}</p>
        </div>

        <!-- Tool name -->
        <div>
          <h4 class="text-sm font-medium text-gray-600 mb-1">Tool</h4>
          <code class="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {{ toolName }}
          </code>
        </div>

        <!-- Arguments -->
        <div>
          <h4 class="text-sm font-medium text-gray-600 mb-1">Arguments</h4>
          <JsonViewer :data="toolArgs" :max-height="200" />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
        <button
          @click="handleReject"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reject
        </button>
        <button
          @click="handleApprove"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>
