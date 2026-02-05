<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { useGraphStore } from '@/stores'
import { useGraphLayout } from '@/composables'
import BaseNode from './BaseNode.vue'
import AnimatedEdge from './AnimatedEdge.vue'

const graphStore = useGraphStore()
const { applyLayout } = useGraphLayout()

const { fitView } = useVueFlow()

const isLayoutApplied = ref(false)

// Apply layout when graph is loaded
watch(
  () => graphStore.isLoaded,
  (loaded) => {
    if (loaded && !isLayoutApplied.value) {
      const layoutedNodes = applyLayout(graphStore.nodes, graphStore.edges)
      graphStore.nodes.forEach((node, i) => {
        node.position = layoutedNodes[i].position
      })
      isLayoutApplied.value = true
      // Fit view after layout
      setTimeout(() => fitView({ padding: 0.2 }), 100)
    }
  },
  { immediate: true }
)

// Reset layout flag when session changes
watch(
  () => graphStore.nodeCount,
  () => {
    if (graphStore.nodeCount === 0) {
      isLayoutApplied.value = false
    }
  }
)

function onNodesChange() {
  // Nodes can be dragged, positions will persist
}
</script>

<template>
  <div class="h-full bg-gray-50">
    <VueFlow
      v-if="graphStore.isLoaded"
      :nodes="graphStore.nodes"
      :edges="graphStore.edges"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :min-zoom="0.5"
      :max-zoom="2"
      fit-view-on-init
      @nodes-change="onNodesChange"
    >
      <template #node-custom="nodeProps">
        <BaseNode v-bind="nodeProps" />
      </template>

      <template #edge-custom="edgeProps">
        <AnimatedEdge v-bind="edgeProps" />
      </template>

      <Controls position="bottom-right" />
      <MiniMap position="bottom-left" />
    </VueFlow>

    <!-- Loading state -->
    <div
      v-else
      class="h-full flex items-center justify-center text-gray-500"
    >
      <div class="text-center">
        <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p>Loading graph...</p>
      </div>
    </div>
  </div>
</template>

<style>
/* Custom Vue Flow styles */
.vue-flow {
  background-color: #f9fafb;
}

.vue-flow__minimap {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.vue-flow__controls {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.vue-flow__controls button {
  background-color: white;
  border: none;
  border-bottom: 1px solid #e5e7eb;
}

.vue-flow__controls button:last-child {
  border-bottom: none;
}

.vue-flow__controls button:hover {
  background-color: #f3f4f6;
}
</style>
