/**
 * WebSocket connection state management
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ConnectionStatus } from '@/utils/constants'

export const useWebsocketStore = defineStore('websocket', () => {
  // State
  const status = ref<ConnectionStatus>('disconnected')
  const reconnectAttempts = ref(0)
  const lastError = ref<string | null>(null)

  // Computed
  const isConnected = computed(() => status.value === 'connected')
  const isConnecting = computed(() => status.value === 'connecting')

  // Actions
  function setStatus(newStatus: ConnectionStatus) {
    status.value = newStatus
    if (newStatus === 'connected') {
      reconnectAttempts.value = 0
      lastError.value = null
    }
  }

  function setError(error: string) {
    lastError.value = error
    status.value = 'error'
  }

  function incrementReconnectAttempts() {
    reconnectAttempts.value++
  }

  function resetReconnectAttempts() {
    reconnectAttempts.value = 0
  }

  function reset() {
    status.value = 'disconnected'
    reconnectAttempts.value = 0
    lastError.value = null
  }

  return {
    // State
    status,
    reconnectAttempts,
    lastError,

    // Computed
    isConnected,
    isConnecting,

    // Actions
    setStatus,
    setError,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    reset,
  }
})
