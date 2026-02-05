<script setup lang="ts">
import { ref } from 'vue'
import Header from './Header.vue'
import SplitPane from './SplitPane.vue'
import SessionSidebar from './SessionSidebar.vue'

const emit = defineEmits<{
  newSession: []
  refreshSession: []
  selectSession: [sessionId: string]
  deleteSession: [sessionId: string]
}>()

const graphPanelWidth = ref(50) // percentage
const sidebarRef = ref<InstanceType<typeof SessionSidebar> | null>(null)

// Expose sidebar ref for refreshing session list
defineExpose({ sidebarRef })
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <Header
      @new-session="emit('newSession')"
      @refresh-session="emit('refreshSession')"
    />

    <!-- Main Content with Sidebar -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Session Sidebar -->
      <div class="w-56 flex-shrink-0">
        <SessionSidebar
          ref="sidebarRef"
          @select-session="emit('selectSession', $event)"
          @delete-session="emit('deleteSession', $event)"
        />
      </div>

      <!-- Main Area -->
      <main class="flex-1 overflow-hidden">
        <SplitPane v-model:size="graphPanelWidth" :min="30" :max="70">
          <template #left>
            <slot name="graph" />
          </template>
          <template #right>
            <div class="flex flex-col h-full">
              <!-- Chat takes most space -->
              <div class="flex-1 overflow-hidden">
                <slot name="chat" />
              </div>
              <!-- Tool panel at bottom -->
              <div class="border-t border-gray-200">
                <slot name="tools" />
              </div>
            </div>
          </template>
        </SplitPane>
      </main>
    </div>
  </div>
</template>
