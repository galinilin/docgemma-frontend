<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useSessionStore } from '@/stores'
import { useApi } from '@/composables'
import type { SessionResponse } from '@/types'

const emit = defineEmits<{
  selectSession: [sessionId: string]
  deleteSession: [sessionId: string]
}>()

const api = useApi()
const sessionStore = useSessionStore()

const sessions = ref<SessionResponse[]>([])
const isLoading = ref(false)

async function loadSessions() {
  isLoading.value = true
  try {
    const response = await api.listSessions()
    sessions.value = response.sessions
  } catch (err) {
    console.error('Failed to load sessions:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleDelete(sessionId: string, event: Event) {
  event.stopPropagation()
  try {
    await api.deleteSession(sessionId)
    sessions.value = sessions.value.filter(s => s.session_id !== sessionId)
    emit('deleteSession', sessionId)
  } catch (err) {
    console.error('Failed to delete session:', err)
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getSessionPreview(session: SessionResponse): string {
  const firstUserMessage = session.messages.find(m => m.role === 'user')
  if (firstUserMessage) {
    return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
  }
  return 'New session'
}

onMounted(loadSessions)

// Expose refresh method
defineExpose({ loadSessions })
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 border-r border-gray-200">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 bg-white">
      <h2 class="text-sm font-semibold text-gray-700">Sessions</h2>
    </div>

    <!-- Session list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="p-4 text-center text-gray-500 text-sm">
        Loading...
      </div>

      <div v-else-if="sessions.length === 0" class="p-4 text-center text-gray-500 text-sm">
        No sessions yet
      </div>

      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="session in sessions"
          :key="session.session_id"
          @click="emit('selectSession', session.session_id)"
          class="p-3 hover:bg-gray-100 cursor-pointer transition-colors group"
          :class="{ 'bg-blue-50 border-l-2 border-blue-500': session.session_id === sessionStore.sessionId }"
        >
          <div class="flex items-start gap-2">
            <ChatBubbleLeftRightIcon class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 truncate">
                {{ getSessionPreview(session) }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ formatDate(session.created_at) }}
              </p>
            </div>
            <button
              @click="handleDelete(session.session_id, $event)"
              class="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete session"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Refresh button -->
    <div class="p-2 border-t border-gray-200 bg-white">
      <button
        @click="loadSessions"
        class="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
      >
        Refresh list
      </button>
    </div>
  </div>
</template>
