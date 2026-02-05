/**
 * Helpers for transforming API data to Vue Flow format
 */
import type { Node, Edge } from '@vue-flow/core'
import type { GraphNode, GraphEdge } from '@/types'
import { getNodeTypeStyle, getNodeStatusStyle } from './constants'

// Extended node data for Vue Flow
export interface VueFlowNodeData {
  id: string
  label: string
  status: string
  nodeType: string
  style: ReturnType<typeof getNodeTypeStyle>
  statusStyle: ReturnType<typeof getNodeStatusStyle>
}

/**
 * Convert API GraphNode to Vue Flow Node
 */
export function apiNodeToVueFlow(node: GraphNode): Node<VueFlowNodeData> {
  const style = getNodeTypeStyle(node.node_type)
  const statusStyle = getNodeStatusStyle(node.status)

  return {
    id: node.id,
    type: 'custom',
    position: { x: 0, y: 0 }, // Will be set by Dagre layout
    data: {
      id: node.id,
      label: node.label,
      status: node.status,
      nodeType: node.node_type,
      style,
      statusStyle,
    },
    draggable: true,
  }
}

/**
 * Convert API GraphEdge to Vue Flow Edge
 */
export function apiEdgeToVueFlow(edge: GraphEdge): Edge {
  return {
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.label ?? undefined,
    type: 'custom',
    animated: edge.active,
    data: {
      active: edge.active,
    },
  }
}

/**
 * Convert full graph state to Vue Flow format
 */
export function apiGraphToVueFlow(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { nodes: Node<VueFlowNodeData>[]; edges: Edge[] } {
  return {
    nodes: nodes.map(apiNodeToVueFlow),
    edges: edges.map(apiEdgeToVueFlow),
  }
}

/**
 * Update node status in place
 */
export function updateNodeStatus(
  nodes: Node<VueFlowNodeData>[],
  nodeId: string,
  status: string
): Node<VueFlowNodeData>[] {
  return nodes.map((node) => {
    if (node.id === nodeId && node.data) {
      const statusStyle = getNodeStatusStyle(status as any)
      const newNode: Node<VueFlowNodeData> = {
        ...node,
        data: {
          id: node.data.id,
          label: node.data.label,
          status,
          nodeType: node.data.nodeType,
          style: node.data.style,
          statusStyle,
        },
      }
      return newNode
    }
    return node
  })
}

/**
 * Update edge active state
 */
export function updateEdgeActive(
  edges: Edge[],
  sourceId: string,
  targetId: string,
  active: boolean
): Edge[] {
  return edges.map((edge) => {
    if (edge.source === sourceId && edge.target === targetId) {
      return {
        ...edge,
        animated: active,
        data: { ...edge.data, active },
      }
    }
    return edge
  })
}
