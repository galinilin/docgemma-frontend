/**
 * Constants for styling and configuration
 */

// WebSocket connection states
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  disconnected: 'bg-gray-400',
  connecting: 'bg-yellow-400',
  connected: 'bg-green-400',
  error: 'bg-red-400',
}
