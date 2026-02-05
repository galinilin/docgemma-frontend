/**
 * Constants for styling and configuration
 */
import type { NodeType, NodeStatus } from '@/types'

// Node type styling configuration
export interface NodeStyle {
  icon: string
  bgColor: string
  borderColor: string
  textColor: string
}

export const NODE_TYPE_CONFIG: Record<NodeType | 'default', NodeStyle> = {
  llm: {
    icon: 'CpuChipIcon',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-700',
  },
  tool: {
    icon: 'WrenchIcon',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
  },
  code: {
    icon: 'CodeBracketIcon',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    textColor: 'text-green-700',
  },
  decision: {
    icon: 'ArrowsPointingOutIcon',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-700',
  },
  default: {
    icon: 'CircleStackIcon',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-700',
  },
}

// Node status styling
export interface StatusStyle {
  ringColor: string
  bgOpacity: string
  animate: boolean
}

export const NODE_STATUS_CONFIG: Record<NodeStatus, StatusStyle> = {
  pending: {
    ringColor: 'ring-gray-300',
    bgOpacity: 'opacity-50',
    animate: false,
  },
  active: {
    ringColor: 'ring-blue-500',
    bgOpacity: 'opacity-100',
    animate: true,
  },
  completed: {
    ringColor: 'ring-green-500',
    bgOpacity: 'opacity-100',
    animate: false,
  },
  skipped: {
    ringColor: 'ring-gray-400',
    bgOpacity: 'opacity-30',
    animate: false,
  },
}

// WebSocket connection states
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  disconnected: 'bg-gray-400',
  connecting: 'bg-yellow-400',
  connected: 'bg-green-400',
  error: 'bg-red-400',
}

// Get style for a node type with fallback to default
export function getNodeTypeStyle(nodeType: string): NodeStyle {
  return NODE_TYPE_CONFIG[nodeType as NodeType] ?? NODE_TYPE_CONFIG.default
}

// Get status style
export function getNodeStatusStyle(status: NodeStatus): StatusStyle {
  return NODE_STATUS_CONFIG[status] ?? NODE_STATUS_CONFIG.pending
}
