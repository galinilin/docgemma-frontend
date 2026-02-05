<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { AppLayout } from './components/layout'
import { GraphPanel } from './components/graph'
import { ChatPanel } from './components/chat'
import { ToolPanel, ToolApprovalModal } from './components/tools'
import { ErrorBanner } from './components/common'
import { useSessionStore, useGraphStore } from './stores'
import { useApi, useWebSocket } from './composables'

const sessionStore = useSessionStore()
const graphStore = useGraphStore()
const api = useApi()
const ws = useWebSocket()

const showApprovalModal = computed(() => sessionStore.pendingApproval !== null)
const error = computed(() => sessionStore.error)

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
</script>

<template>
  <AppLayout>
    <template #graph>
      <GraphPanel />
    </template>

    <template #chat>
      <ChatPanel />
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
