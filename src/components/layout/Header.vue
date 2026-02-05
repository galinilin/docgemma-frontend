<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSessionStore, useWebsocketStore } from '@/stores'
import { CONNECTION_STATUS_COLORS } from '@/utils/constants'
import { PlusIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  newSession: []
}>()

const sessionStore = useSessionStore()
const wsStore = useWebsocketStore()

const sessionId = computed(() => sessionStore.sessionId)
const shortSessionId = computed(() =>
  sessionId.value ? sessionId.value.slice(0, 8) : 'No session'
)

const statusColor = computed(() =>
  CONNECTION_STATUS_COLORS[wsStore.status]
)

const statusText = computed(() => {
  switch (wsStore.status) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'disconnected':
      return 'Disconnected'
    case 'error':
      return 'Error'
  }
})
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex items-center justify-between">
      <!-- Logo and title -->
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold text-gray-900">DocGemma</h1>
        <span class="text-sm text-gray-500">Medical AI Assistant</span>
      </div>

      <!-- Session info and controls -->
      <div class="flex items-center gap-4">
        <!-- Connection status -->
        <div class="flex items-center gap-2">
          <span
            class="w-2 h-2 rounded-full"
            :class="statusColor"
          />
          <span class="text-sm text-gray-600">{{ statusText }}</span>
        </div>

        <!-- Session ID -->
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
          <span class="text-sm text-gray-500">Session:</span>
          <code class="text-sm font-mono text-gray-700">{{ shortSessionId }}</code>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <RouterLink
            to="/ehr"
            class="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
            title="Open EHR"
          >
            <ClipboardDocumentListIcon class="w-5 h-5" />
            EHR
          </RouterLink>
          <button
            @click="emit('newSession')"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
