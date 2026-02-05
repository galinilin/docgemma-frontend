<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { AppLayout } from '@/components/layout'
import { GraphPanel } from '@/components/graph'
import { ChatPanel } from '@/components/chat'
import { ToolPanel, ToolApprovalModal } from '@/components/tools'
import { ErrorBanner } from '@/components/common'
import { useSessionStore, useGraphStore } from '@/stores'
import { useApi, useWebSocket } from '@/composables'

const sessionStore = useSessionStore()
const graphStore = useGraphStore()
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

    // Fetch initial graph state
    const graphState = await api.getGraphState(session.session_id)
    graphStore.setGraph(graphState.nodes, graphState.edges)

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

async function handleNewSession() {
  console.log('[ChatView] handleNewSession called')
  try {
    ws.disconnect()
    sessionStore.resetState()
    graphStore.clear()

    const session = await api.createSession()
    sessionStore.setSession(session.session_id)

    const graphState = await api.getGraphState(session.session_id)
    graphStore.setGraph(graphState.nodes, graphState.edges)

    ws.connect(session.session_id)

    // Refresh sidebar list
    appLayoutRef.value?.sidebarRef?.loadSessions()
  } catch (err) {
    sessionStore.setError('Failed to create new session', false)
    console.error('Failed to create new session:', err)
  }
}

async function handleRefreshSession() {
  console.log('[ChatView] handleRefreshSession called')
  if (!sessionStore.sessionId) return

  try {
    graphStore.clear()
    const graphState = await api.getGraphState(sessionStore.sessionId)
    graphStore.setGraph(graphState.nodes, graphState.edges)
  } catch (err) {
    console.error('Failed to refresh session:', err)
  }
}

async function handleSelectSession(sessionId: string) {
  console.log('[ChatView] handleSelectSession called:', sessionId)
  if (sessionId === sessionStore.sessionId) return

  try {
    ws.disconnect()
    sessionStore.resetState()
    graphStore.clear()

    const session = await api.getSession(sessionId)
    sessionStore.setSession(session.session_id)
    if (session.messages.length > 0) {
      sessionStore.setMessages(session.messages)
    }

    const graphState = await api.getGraphState(session.session_id)
    graphStore.setGraph(graphState.nodes, graphState.edges)

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
    @refresh-session="handleRefreshSession"
    @select-session="handleSelectSession"
    @delete-session="handleDeleteSession"
  >
    <template #graph>
      <GraphPanel />
    </template>

    <template #chat>
      <ChatPanel @send-message="handleSendMessage" />
    </template>

    <template #tools>
      <ToolPanel />
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
