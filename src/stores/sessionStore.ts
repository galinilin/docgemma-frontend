/**
 * Session state management
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SessionStatus,
  Message,
  PendingToolApproval,
  ToolResult,
  Subtask,
} from '@/types'

export const useSessionStore = defineStore('session', () => {
  // State
  const sessionId = ref<string | null>(null)
  const status = ref<SessionStatus>('active')
  const messages = ref<Message[]>([])
  const pendingApproval = ref<PendingToolApproval | null>(null)
  const currentNode = ref<string | null>(null)
  const completedNodes = ref<string[]>([])
  const subtasks = ref<Subtask[]>([])
  const toolResults = ref<ToolResult[]>([])
  const streamingText = ref<string>('')
  const executingTool = ref<{ name: string; args: Record<string, unknown> } | null>(null)
  const error = ref<{ message: string; recoverable: boolean } | null>(null)

  // Computed
  const isProcessing = computed(() => status.value === 'processing')
  const isWaitingApproval = computed(() => status.value === 'waiting_approval')
  const hasError = computed(() => status.value === 'error')
  const canSendMessage = computed(() => status.value === 'active')

  // Actions
  function setSession(id: string) {
    sessionId.value = id
    resetState()
  }

  function setStatus(newStatus: SessionStatus) {
    status.value = newStatus
  }

  function addMessage(message: Message) {
    messages.value.push(message)
  }

  function setMessages(newMessages: Message[]) {
    messages.value = newMessages
  }

  function setPendingApproval(approval: PendingToolApproval | null) {
    pendingApproval.value = approval
    if (approval) {
      status.value = 'waiting_approval'
    }
  }

  function clearPendingApproval() {
    pendingApproval.value = null
    status.value = 'processing'
  }

  function setCurrentNode(nodeId: string | null) {
    currentNode.value = nodeId
  }

  function addCompletedNode(nodeId: string) {
    if (!completedNodes.value.includes(nodeId)) {
      completedNodes.value.push(nodeId)
    }
  }

  function setSubtasks(newSubtasks: Subtask[]) {
    subtasks.value = newSubtasks
  }

  function addToolResult(result: ToolResult) {
    toolResults.value.push(result)
  }

  function setToolExecuting(name: string, args: Record<string, unknown>) {
    executingTool.value = { name, args }
  }

  function clearToolExecuting() {
    executingTool.value = null
  }

  function appendStreamingText(text: string) {
    streamingText.value += text
  }

  function clearStreamingText() {
    streamingText.value = ''
  }

  function setError(message: string, recoverable: boolean) {
    error.value = { message, recoverable }
  }

  function clearError() {
    error.value = null
  }

  function resetTurnState() {
    currentNode.value = null
    completedNodes.value = []
    subtasks.value = []
    toolResults.value = []
    executingTool.value = null
  }

  function resetState() {
    status.value = 'active'
    messages.value = []
    pendingApproval.value = null
    currentNode.value = null
    completedNodes.value = []
    subtasks.value = []
    toolResults.value = []
    streamingText.value = ''
    executingTool.value = null
    error.value = null
  }

  return {
    // State
    sessionId,
    status,
    messages,
    pendingApproval,
    currentNode,
    completedNodes,
    subtasks,
    toolResults,
    streamingText,
    executingTool,
    error,

    // Computed
    isProcessing,
    isWaitingApproval,
    hasError,
    canSendMessage,

    // Actions
    setSession,
    setStatus,
    addMessage,
    setMessages,
    setPendingApproval,
    clearPendingApproval,
    setCurrentNode,
    addCompletedNode,
    setSubtasks,
    addToolResult,
    setToolExecuting,
    clearToolExecuting,
    appendStreamingText,
    clearStreamingText,
    setError,
    clearError,
    resetTurnState,
    resetState,
  }
})
