/**
 * Dagre auto-layout composable for Vue Flow
 */
import dagre from 'dagre'
import type { Node, Edge } from '@vue-flow/core'

export interface LayoutOptions {
  direction: 'TB' | 'LR' | 'BT' | 'RL'
  nodeWidth: number
  nodeHeight: number
  nodeSep: number
  rankSep: number
}

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: 'TB',
  nodeWidth: 180,
  nodeHeight: 60,
  nodeSep: 80,
  rankSep: 100,
}

/**
 * Apply Dagre layout to Vue Flow nodes
 */
export function layoutGraph<T>(
  nodes: Node<T>[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
): Node<T>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Create dagre graph
  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSep,
    ranksep: opts.rankSep,
  })
  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    })
  })

  // Add edges
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  // Run layout
  dagre.layout(g)

  // Apply positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id)
    if (nodeWithPosition) {
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - opts.nodeWidth / 2,
          y: nodeWithPosition.y - opts.nodeHeight / 2,
        },
      }
    }
    return node
  })
}

/**
 * Composable for graph layout
 */
export function useGraphLayout(options: Partial<LayoutOptions> = {}) {
  function applyLayout<T>(nodes: Node<T>[], edges: Edge[]): Node<T>[] {
    return layoutGraph(nodes, edges, options)
  }

  return {
    applyLayout,
  }
}
