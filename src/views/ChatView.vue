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

onMounted(() => {
  // Start with a clean slate — session created lazily on first message
  sessionStore.resetState()
  sessionStore.resetControls()
  sessionStore.sessionId = null
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

async function handleSendMessage(content: string, imageBase64?: string) {
  console.log('[ChatView] handleSendMessage called:', { content, imageBase64: !!imageBase64 })

  // Lazily create session on first message
  if (!sessionStore.sessionId) {
    try {
      const session = await api.createSession()
      sessionStore.setSession(session.session_id)
      await ws.connect(session.session_id)
      // Refresh sidebar to show the new session
      appLayoutRef.value?.sidebarRef?.loadSessions()
    } catch (err) {
      sessionStore.setError('Failed to create session', false)
      console.error('Failed to create session:', err)
      return
    }
  }

  ws.sendMessage(content, imageBase64)
}

function handleCancel() {
  ws.cancel()
  sessionStore.setStatus('active')
  sessionStore.clearStreamingText()
  sessionStore.clearAgentStatusText()
}

function handleNewSession() {
  console.log('[ChatView] handleNewSession called')
  ws.disconnect()
  sessionStore.resetState()
  sessionStore.resetControls()
  sessionStore.sessionId = null
}

async function handleSelectSession(sessionId: string) {
  console.log('[ChatView] handleSelectSession called:', sessionId)
  if (sessionId === sessionStore.sessionId) return

  try {
    ws.disconnect()

    // Fetch session data BEFORE resetting state to avoid starter screen flash
    const session = await api.getSession(sessionId)

    sessionStore.resetState()
    sessionStore.resetControls()

    sessionStore.sessionId = session.session_id
    if (session.messages.length > 0) {
      sessionStore.setMessages(session.messages)
    }

    // Restore persisted patient selection (PatientSelector validates against EHR)
    sessionStore.selectedPatientId = session.selected_patient_id ?? null

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
