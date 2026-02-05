/**
 * Graph state management for Vue Flow
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { GraphNode, GraphEdge, NodeStatus } from '@/types'
import {
  apiNodeToVueFlow,
  apiEdgeToVueFlow,
  updateNodeStatus,
  type VueFlowNodeData,
} from '@/utils/graphHelpers'

export const useGraphStore = defineStore('graph', () => {
  // State
  const nodes = ref<Node<VueFlowNodeData>[]>([])
  const edges = ref<Edge[]>([])
  const isLoaded = ref(false)

  // Computed
  const nodeCount = computed(() => nodes.value.length)
  const activeNode = computed(() =>
    nodes.value.find((n) => n.data?.status === 'active')
  )

  // Actions
  function setGraph(apiNodes: GraphNode[], apiEdges: GraphEdge[]) {
    nodes.value = apiNodes.map(apiNodeToVueFlow)
    edges.value = apiEdges.map(apiEdgeToVueFlow)
    isLoaded.value = true
  }

  function setNodeStatus(nodeId: string, status: NodeStatus) {
    nodes.value = updateNodeStatus(nodes.value, nodeId, status)

    // Update edge animation when node becomes active
    if (status === 'active') {
      edges.value = edges.value.map((edge) => ({
        ...edge,
        animated: edge.target === nodeId,
        data: { ...edge.data, active: edge.target === nodeId },
      }))
    }
  }

  function setEdgeActive(sourceId: string, targetId: string, active: boolean) {
    edges.value = edges.value.map((edge) => {
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

  function resetAllNodeStatus() {
    nodes.value = nodes.value.map((node) => {
      if (!node.data) return node
      const newNode: Node<VueFlowNodeData> = {
        ...node,
        data: {
          id: node.data.id,
          label: node.data.label,
          status: 'pending',
          nodeType: node.data.nodeType,
          style: node.data.style,
          statusStyle: {
            ringColor: 'ring-gray-300',
            bgOpacity: 'opacity-50',
            animate: false,
          },
        },
      }
      return newNode
    })
    edges.value = edges.value.map((edge) => ({
      ...edge,
      animated: false,
      data: { ...edge.data, active: false },
    }))
  }

  function updateNodePositions(positionMap: Record<string, { x: number; y: number }>) {
    nodes.value = nodes.value.map((node) => {
      const pos = positionMap[node.id]
      if (pos) {
        return { ...node, position: pos }
      }
      return node
    })
  }

  function clear() {
    nodes.value = []
    edges.value = []
    isLoaded.value = false
  }

  return {
    // State
    nodes,
    edges,
    isLoaded,

    // Computed
    nodeCount,
    activeNode,

    // Actions
    setGraph,
    setNodeStatus,
    setEdgeActive,
    resetAllNodeStatus,
    updateNodePositions,
    clear,
  }
})
