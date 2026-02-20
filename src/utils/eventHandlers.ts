/**
 * WebSocket event dispatch handlers
 */
import type { AgentEvent } from '@/types'
import { useSessionStore } from '@/stores/sessionStore'

/**
 * Handle incoming WebSocket event
 * Uses graceful degradation - unknown events are logged but don't crash
 */
export function handleEvent(event: unknown): void {
  const e = event as AgentEvent
  const sessionStore = useSessionStore()

  console.log('[WS Event]', e.event, event)

  switch (e.event) {
    case 'node_start':
      break

    case 'node_end':
      break

    case 'agent_status':
      // When a status update arrives after thinking was streaming,
      // the thinking phase is done — stop the streaming indicator.
      if (sessionStore.isThinkingStreaming) {
        sessionStore.isThinkingStreaming = false
      }
      sessionStore.setAgentStatusText(e.status_text)
      break

    case 'tool_approval_request':
      sessionStore.setPendingApproval({
        tool_name: e.tool_name,
        tool_args: e.tool_args,
        subtask_intent: e.subtask_intent,
        checkpoint_id: '', // Not provided in event
      })
      sessionStore.setStatus('waiting_approval')
      break

    case 'tool_execution_start':
      sessionStore.setToolExecuting(e.tool_name, e.tool_args)
      break

    case 'tool_execution_end':
      sessionStore.addToolResult({
        tool_name: e.tool_name,
        success: e.success,
        result: e.result,
        duration_ms: e.duration_ms,
      })
      sessionStore.clearToolExecuting()
      break

    case 'streaming_text':
      sessionStore.clearAgentStatusText()
      if (e.node_id === 'preliminary_thinking') {
        sessionStore.isThinkingStreaming = true
        sessionStore.appendStreamingThinkingText(e.text)
      } else {
        sessionStore.appendStreamingText(e.text)
      }
      break

    case 'completion':
      sessionStore.addMessage({
        role: 'assistant',
        content: e.final_response,
        timestamp: e.timestamp,
        metadata: {
          tool_calls_made: e.tool_calls_made,
          clinical_trace: e.clinical_trace,
          preliminary_thinking: e.preliminary_thinking,
        },
      })
      sessionStore.clearStreamingText()
      sessionStore.clearStreamingThinkingText()
      sessionStore.clearAgentStatusText()
      sessionStore.setStatus('active')
      sessionStore.resetTurnState()
      break

    case 'error':
      console.log('[WS Error Event] message:', e.message, 'recoverable:', e.recoverable)
      sessionStore.setError(e.message, e.recoverable)
      sessionStore.clearAgentStatusText()
      sessionStore.clearStreamingText()
      sessionStore.clearStreamingThinkingText()
      if (!e.recoverable) {
        sessionStore.setStatus('error')
      }
      console.log('[WS Error Event] sessionStore.error:', sessionStore.error)
      break

    default:
      // Graceful degradation for unknown events
      console.warn('Unknown event type:', (e as any).event, event)
  }
}
