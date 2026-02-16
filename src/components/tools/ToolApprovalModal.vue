<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { PendingToolApproval } from '@/types'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  approval: PendingToolApproval
}>()

const emit = defineEmits<{
  approve: [editedArgs: Record<string, unknown>]
  reject: [reason?: string]
  close: []
}>()

const toolName = computed(() => props.approval.tool_name)
const intent = computed(() => props.approval.subtask_intent)

// Create a reactive copy of tool_args for editing
const editedArgs = reactive<Record<string, unknown>>(
  JSON.parse(JSON.stringify(props.approval.tool_args))
)

const argKeys = computed(() => Object.keys(editedArgs))

function isReadOnly(key: string): boolean {
  return key === 'patient_id'
}

function useTextarea(key: string, value: unknown): boolean {
  if (key === 'note_text') return true
  if (typeof value === 'string' && value.length > 80) return true
  return false
}

function handleApprove() {
  emit('approve', { ...editedArgs })
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

        <!-- Editable Arguments -->
        <div>
          <h4 class="text-sm font-medium text-gray-600 mb-2">Arguments</h4>
          <div class="space-y-3">
            <div v-for="key in argKeys" :key="key">
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ key }}</label>

              <!-- Read-only field (patient_id) -->
              <input
                v-if="isReadOnly(key)"
                type="text"
                :value="String(editedArgs[key] ?? '')"
                readonly
                class="w-full px-3 py-1.5 text-sm bg-gray-100 text-gray-500 border border-gray-200 rounded cursor-not-allowed"
              />

              <!-- Textarea for long strings / note_text -->
              <textarea
                v-else-if="useTextarea(key, editedArgs[key])"
                v-model="editedArgs[key] as string"
                rows="3"
                class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />

              <!-- Text input for other strings -->
              <input
                v-else
                type="text"
                v-model="editedArgs[key] as string"
                class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
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
