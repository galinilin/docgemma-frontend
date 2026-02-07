<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { AppLayout } from '@/components/layout'
import { ChatPanel } from '@/components/chat'
import { ToolApprovalModal } from '@/components/tools'
import { ErrorBanner } from '@/components/common'
import { useSessionStore } from '@/stores'
import { useApi, useWebSocket } from '@/composables'

const sessionStore = useSessionStore()
const api = useApi()
const ws = useWebSocket()

const appLayoutRef = ref<InstanceType<typeof AppLayout> | null>(null)

const showApprovalModal = computed(() => sessionStore.pendingApproval !== null)
const error = computed(() => sessionStore.error)

// Debug: watch for error changes
watch(error, (newError) => {
  console.log('[ChatView] error changed:', newError)
}, { immediate: true })

onMounted(async () => {
  // Create a new session on mount
  try {
    const session = await api.createSession()
    sessionStore.setSession(session.session_id)
    if (session.messages.length > 0) {
      sessionStore.setMessages(session.messages)
    }

    // Connect WebSocket
    ws.connect(session.session_id)
  } catch (err) {
    sessionStore.setError('Failed to initialize session', false)
    console.error('Failed to create session:', err)
  }
})

function handleApprove() {
  ws.approveTool()
}

function handleReject(reason?: string) {
  ws.rejectTool(reason)
}

function dismissError() {
  sessionStore.clearError()
}

function handleSendMessage(content: string, imageBase64?: string) {
  console.log('[ChatView] handleSendMessage called:', { content, imageBase64: !!imageBase64 })
  ws.sendMessage(content, imageBase64)
}

function handleCancel() {
  ws.cancel()
  sessionStore.setStatus('active')
  sessionStore.clearStreamingText()
  sessionStore.clearAgentStatusText()
}

async function handleNewSession() {
  console.log('[ChatView] handleNewSession called')
  try {
    ws.disconnect()
    sessionStore.resetState()

    const session = await api.createSession()
    sessionStore.setSession(session.session_id)

    ws.connect(session.session_id)

    // Refresh sidebar list
    appLayoutRef.value?.sidebarRef?.loadSessions()
  } catch (err) {
    sessionStore.setError('Failed to create new session', false)
    console.error('Failed to create new session:', err)
  }
}

async function handleSelectSession(sessionId: string) {
  console.log('[ChatView] handleSelectSession called:', sessionId)
  if (sessionId === sessionStore.sessionId) return

  try {
    ws.disconnect()
    sessionStore.resetState()

    const session = await api.getSession(sessionId)
    sessionStore.setSession(session.session_id)
    if (session.messages.length > 0) {
      sessionStore.setMessages(session.messages)
    }

    ws.connect(session.session_id)
  } catch (err) {
    sessionStore.setError('Failed to load session', false)
    console.error('Failed to load session:', err)
  }
}

async function handleDeleteSession(sessionId: string) {
  console.log('[ChatView] handleDeleteSession called:', sessionId)
  if (sessionId === sessionStore.sessionId) {
    await handleNewSession()
  }
  appLayoutRef.value?.sidebarRef?.loadSessions()
}
</script>

<template>
  <AppLayout
    ref="appLayoutRef"
    @new-session="handleNewSession"
    @select-session="handleSelectSession"
    @delete-session="handleDeleteSession"
  >
    <template #chat>
      <ChatPanel @send-message="handleSendMessage" @cancel="handleCancel" />
    </template>
  </AppLayout>

  <!-- Error Banner -->
  <ErrorBanner
    v-if="error"
    :message="error.message"
    :recoverable="error.recoverable"
    @dismiss="dismissError"
  />

  <!-- Tool Approval Modal -->
  <ToolApprovalModal
    v-if="showApprovalModal"
    :approval="sessionStore.pendingApproval!"
    @approve="handleApprove"
    @reject="handleReject"
  />
</template>
