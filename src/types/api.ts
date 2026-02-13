/**
 * API types - mirrors backend Pydantic schemas
 */

// Session status enum
export type SessionStatus = 'active' | 'processing' | 'waiting_approval' | 'error'

// Message in conversation
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  timestamp: string
  metadata: Record<string, unknown>
}

// Pending tool approval
export interface PendingToolApproval {
  tool_name: string
  tool_args: Record<string, unknown>
  subtask_intent: string
  checkpoint_id: string
}

// Session response from API
export interface SessionResponse {
  session_id: string
  status: SessionStatus
  messages: Message[]
  pending_approval: PendingToolApproval | null
  selected_patient_id: string | null
  created_at: string
  updated_at: string
}

// Session list response
export interface SessionListResponse {
  sessions: SessionResponse[]
  total: number
}

// Subtask from decompose intent
export interface Subtask {
  intent: string
  tool_hint: string | null
  status: 'pending' | 'completed' | 'failed'
}

// Tool result
export interface ToolResult {
  tool_name: string
  success: boolean
  result: Record<string, unknown>
  duration_ms?: number
}

// Health response
export interface HealthResponse {
  status: string
  model_loaded: boolean
  version: string
}

// Create session request
export interface CreateSessionRequest {
  initial_context?: string
}
