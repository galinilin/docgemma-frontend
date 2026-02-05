/**
 * WebSocket connection composable (singleton pattern for HMR stability)
 */
import { ref } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import { useSessionStore } from '@/stores/sessionStore'
import { handleEvent, resetGraphForNewTurn } from '@/utils/eventHandlers'
import type { ClientAction } from '@/types'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api'
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 2000

// Singleton socket state (persists across HMR)
const socket = ref<WebSocket | null>(null)
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
let currentSessionId: string | null = null

export function useWebSocket() {
  const wsStore = useWebsocketStore()
  const sessionStore = useSessionStore()

  function connect(sessionId: string) {
    // Skip if already connected to this session
    if (socket.value?.readyState === WebSocket.OPEN && currentSessionId === sessionId) {
      console.log('[WS] Already connected to session:', sessionId)
      return
    }

    // Close existing connection if connecting to different session
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.close(1000)
    }

    currentSessionId = sessionId
    wsStore.setStatus('connecting')

    const wsUrl = `${WS_BASE}/sessions/${sessionId}/ws`
    console.log('[WS] Connecting to:', wsUrl)
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      wsStore.setStatus('connected')
      wsStore.resetReconnectAttempts()
    }

    socket.value.onmessage = (event) => {
      console.log('[WS] Raw message received:', event.data)
      try {
        const data = JSON.parse(event.data)
        console.log('[WS] Parsed message:', data)
        handleEvent(data)
      } catch (e) {
        console.error('[WS] Failed to parse WebSocket message:', e)
      }
    }

    socket.value.onerror = (event) => {
      console.error('WebSocket error:', event)
      wsStore.setError('WebSocket connection error')
    }

    socket.value.onclose = (event) => {
      wsStore.setStatus('disconnected')

      // Attempt reconnect if not a clean close
      if (event.code !== 1000 && event.code !== 4004) {
        attemptReconnect(sessionId)
      }
    }
  }

  function attemptReconnect(sessionId: string) {
    if (wsStore.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      wsStore.setError('Max reconnection attempts reached')
      return
    }

    wsStore.incrementReconnectAttempts()

    reconnectTimeout = setTimeout(() => {
      connect(sessionId)
    }, RECONNECT_DELAY_MS * wsStore.reconnectAttempts)
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (socket.value) {
      socket.value.close(1000)
      socket.value = null
    }

    currentSessionId = null
    wsStore.reset()
  }

  function send(action: ClientAction) {
    if (socket.value?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    socket.value.send(JSON.stringify(action))
    return true
  }

  function sendMessage(content: string, imageBase64?: string) {
    // Reset all turn state for new message
    resetGraphForNewTurn()
    sessionStore.resetTurnState()  // Clear tool results, streaming text, etc.
    sessionStore.clearStreamingText()  // Explicitly clear any streaming text
    sessionStore.setStatus('processing')

    // Add user message immediately
    sessionStore.addMessage({
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      metadata: imageBase64 ? { has_image: true } : {},
    })

    return send({
      action: 'send_message',
      data: {
        content,
        image_base64: imageBase64 || null,
      },
    })
  }

  function approveTool() {
    sessionStore.clearPendingApproval()
    return send({
      action: 'approve_tool',
      data: {},
    })
  }

  function rejectTool(reason?: string) {
    sessionStore.clearPendingApproval()
    return send({
      action: 'reject_tool',
      data: { reason },
    })
  }

  function cancel() {
    return send({
      action: 'cancel',
      data: {},
    })
  }

  // Note: No onUnmounted cleanup - socket is singleton and persists across HMR

  return {
    socket,
    connect,
    disconnect,
    send,
    sendMessage,
    approveTool,
    rejectTool,
    cancel,
  }
}
