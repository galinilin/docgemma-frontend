/**
 * WebSocket event dispatch handlers
 */
import type { AgentEvent } from '@/types'
import { useSessionStore } from '@/stores/sessionStore'
import { useGraphStore } from '@/stores/graphStore'

/**
 * Handle incoming WebSocket event
 * Uses graceful degradation - unknown events are logged but don't crash
 */
export function handleEvent(event: unknown): void {
  const e = event as AgentEvent
  const sessionStore = useSessionStore()
  const graphStore = useGraphStore()

  switch (e.event) {
    case 'node_start':
      graphStore.setNodeStatus(e.node_id, 'active')
      sessionStore.setCurrentNode(e.node_id)
      break

    case 'node_end':
      graphStore.setNodeStatus(e.node_id, 'completed')
      sessionStore.addCompletedNode(e.node_id)
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
      sessionStore.appendStreamingText(e.text)
      break

    case 'completion':
      sessionStore.addMessage({
        role: 'assistant',
        content: e.final_response,
        timestamp: e.timestamp,
        metadata: { tool_calls_made: e.tool_calls_made },
      })
      sessionStore.clearStreamingText()
      sessionStore.setStatus('active')
      sessionStore.resetTurnState()
      break

    case 'error':
      sessionStore.setError(e.message, e.recoverable)
      if (!e.recoverable) {
        sessionStore.setStatus('error')
      }
      break

    default:
      // Graceful degradation for unknown events
      console.warn('Unknown event type:', (e as any).event, event)
  }
}

/**
 * Reset graph state for new turn
 */
export function resetGraphForNewTurn(): void {
  const graphStore = useGraphStore()
  graphStore.resetAllNodeStatus()
}
