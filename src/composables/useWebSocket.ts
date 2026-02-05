/**
 * WebSocket connection composable
 */
import { ref, onUnmounted } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import { useSessionStore } from '@/stores/sessionStore'
import { handleEvent, resetGraphForNewTurn } from '@/utils/eventHandlers'
import type { ClientAction } from '@/types'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api'
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 2000

export function useWebSocket() {
  const wsStore = useWebsocketStore()
  const sessionStore = useSessionStore()

  const socket = ref<WebSocket | null>(null)
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  function connect(sessionId: string) {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.close()
    }

    wsStore.setStatus('connecting')

    const wsUrl = `${WS_BASE}/sessions/${sessionId}/ws`
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      wsStore.setStatus('connected')
      wsStore.resetReconnectAttempts()
    }

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleEvent(data)
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
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
    // Reset graph state for new turn
    resetGraphForNewTurn()
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

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

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
