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
  const subtasks = ref<Subtask[]>([])
  const toolResults = ref<ToolResult[]>([])
  const streamingText = ref<string>('')
  const streamingThinkingText = ref<string>('')
  const isThinkingStreaming = ref<boolean>(false)
  const executingTool = ref<{ name: string; args: Record<string, unknown> } | null>(null)
  const agentStatusText = ref<string>('')
  const error = ref<{ message: string; recoverable: boolean } | null>(null)
  const selectedPatientId = ref<string | null>(null)
  const toolCallingEnabled = ref<boolean>(true)
  const thinkingEnabled = ref<boolean>(false)
  const pendingImageAttachment = ref<{
    base64: string
    previewUrl: string
    description: string
  } | null>(null)

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

  function addMessage(message: Omit<Message, 'id'> & { id?: string }) {
    // Generate ID if not provided
    const id = message.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    // Deduplicate: don't add if a message with same content and role exists recently
    const isDuplicate = messages.value.some(
      (m) =>
        m.role === message.role &&
        m.content === message.content &&
        Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
    )

    if (!isDuplicate) {
      messages.value.push({ ...message, id })
    }
  }

  function setMessages(newMessages: Array<Omit<Message, 'id'> & { id?: string }>) {
    // Ensure all messages have IDs
    messages.value = newMessages.map((m, i) => ({
      ...m,
      id: m.id || `loaded-${i}-${Date.now()}`,
    }))
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

  function setAgentStatusText(text: string) {
    agentStatusText.value = text
  }

  function clearAgentStatusText() {
    agentStatusText.value = ''
  }

  function appendStreamingText(text: string) {
    streamingText.value += text
  }

  function clearStreamingText() {
    streamingText.value = ''
  }

  function appendStreamingThinkingText(text: string) {
    streamingThinkingText.value += text
  }

  function clearStreamingThinkingText() {
    streamingThinkingText.value = ''
  }

  function setError(message: string, recoverable: boolean) {
    console.log('[SessionStore] setError called:', { message, recoverable })
    error.value = { message, recoverable }
    console.log('[SessionStore] error.value is now:', error.value)
  }

  function clearError() {
    error.value = null
  }

  function resetTurnState() {
    subtasks.value = []
    toolResults.value = []
    executingTool.value = null
    agentStatusText.value = ''
    streamingThinkingText.value = ''
    isThinkingStreaming.value = false
  }

  function resetState() {
    status.value = 'active'
    messages.value = []
    pendingApproval.value = null
    subtasks.value = []
    toolResults.value = []
    streamingText.value = ''
    streamingThinkingText.value = ''
    isThinkingStreaming.value = false
    executingTool.value = null
    agentStatusText.value = ''
    error.value = null
  }

  function setPendingImageAttachment(attachment: { base64: string; previewUrl: string; description: string }) {
    pendingImageAttachment.value = attachment
  }

  function clearPendingImageAttachment() {
    pendingImageAttachment.value = null
  }

  function resetControls() {
    selectedPatientId.value = null
    toolCallingEnabled.value = true
    thinkingEnabled.value = false
  }

  return {
    // State
    sessionId,
    status,
    messages,
    pendingApproval,
    subtasks,
    toolResults,
    streamingText,
    streamingThinkingText,
    isThinkingStreaming,
    executingTool,
    agentStatusText,
    error,
    selectedPatientId,
    toolCallingEnabled,
    thinkingEnabled,
    pendingImageAttachment,

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
    setSubtasks,
    addToolResult,
    setToolExecuting,
    clearToolExecuting,
    setAgentStatusText,
    clearAgentStatusText,
    appendStreamingText,
    clearStreamingText,
    appendStreamingThinkingText,
    clearStreamingThinkingText,
    setError,
    clearError,
    resetTurnState,
    resetState,
    resetControls,
    setPendingImageAttachment,
    clearPendingImageAttachment,
  }
})
