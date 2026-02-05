/**
 * API types - mirrors backend Pydantic schemas
 */

// Session status enum
export type SessionStatus = 'active' | 'processing' | 'waiting_approval' | 'error'

// Node status for graph visualization
export type NodeStatus = 'pending' | 'active' | 'completed' | 'skipped'

// Node types for styling
export type NodeType = 'llm' | 'tool' | 'code' | 'decision' | 'default'

// Message in conversation
export interface Message {
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
  current_node: string | null
  completed_nodes: string[]
  created_at: string
  updated_at: string
}

// Session list response
export interface SessionListResponse {
  sessions: SessionResponse[]
  total: number
}

// Graph node for visualization
export interface GraphNode {
  id: string
  label: string
  status: NodeStatus
  node_type: NodeType
}

// Graph edge for visualization
export interface GraphEdge {
  source: string
  target: string
  label: string | null
  active: boolean
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

// Graph state response from API
export interface GraphStateResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
  current_node: string | null
  subtasks: Subtask[]
  tool_results: ToolResult[]
}

// Tool info
export interface ToolInfo {
  name: string
  description: string
  args: Record<string, string>
}

// Tool list response
export interface ToolListResponse {
  tools: ToolInfo[]
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
