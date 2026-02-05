/**
 * WebSocket event types - mirrors backend event schemas
 */
import type { ClinicalTrace } from './trace'

// Base event structure
export interface BaseEvent {
  event: string
  timestamp: string
}

// Node start event
export interface NodeStartEvent extends BaseEvent {
  event: 'node_start'
  node_id: string
  node_label: string
}

// Node end event
export interface NodeEndEvent extends BaseEvent {
  event: 'node_end'
  node_id: string
  node_label: string
  duration_ms: number
}

// Tool approval request event
export interface ToolApprovalRequestEvent extends BaseEvent {
  event: 'tool_approval_request'
  tool_name: string
  tool_args: Record<string, unknown>
  subtask_intent: string
}

// Tool execution start event
export interface ToolExecutionStartEvent extends BaseEvent {
  event: 'tool_execution_start'
  tool_name: string
  tool_args: Record<string, unknown>
}

// Tool execution end event
export interface ToolExecutionEndEvent extends BaseEvent {
  event: 'tool_execution_end'
  tool_name: string
  success: boolean
  result: Record<string, unknown>
  duration_ms: number
}

// Streaming text event
export interface StreamingTextEvent extends BaseEvent {
  event: 'streaming_text'
  text: string
  node_id: string
}

// Completion event
export interface CompletionEvent extends BaseEvent {
  event: 'completion'
  final_response: string
  tool_calls_made: number
  clinical_trace?: ClinicalTrace
}

// Error event
export interface ErrorEvent extends BaseEvent {
  event: 'error'
  error_type: string
  message: string
  recoverable: boolean
}

// Union type for all events
export type AgentEvent =
  | NodeStartEvent
  | NodeEndEvent
  | ToolApprovalRequestEvent
  | ToolExecutionStartEvent
  | ToolExecutionEndEvent
  | StreamingTextEvent
  | CompletionEvent
  | ErrorEvent

// Client to server actions
export interface SendMessageAction {
  action: 'send_message'
  data: {
    content: string
    image_base64?: string | null
  }
}

export interface ApproveToolAction {
  action: 'approve_tool'
  data: Record<string, never>
}

export interface RejectToolAction {
  action: 'reject_tool'
  data: {
    reason?: string
  }
}

export interface CancelAction {
  action: 'cancel'
  data: Record<string, never>
}

export type ClientAction =
  | SendMessageAction
  | ApproveToolAction
  | RejectToolAction
  | CancelAction
