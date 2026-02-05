/**
 * Clinical reasoning trace types
 */

export type TraceStepType = 'thought' | 'tool_call' | 'synthesis'

export interface TraceStep {
  type: TraceStepType
  label: string
  description: string
  duration_ms?: number
  tool_name?: string
  tool_result_summary?: string
  success?: boolean
  reasoning_text?: string
}

export interface ClinicalTrace {
  steps: TraceStep[]
  total_duration_ms: number
  tools_consulted: number
}
