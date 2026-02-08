<script setup lang="ts">
import { ref } from 'vue'
import Header from './Header.vue'
import SessionSidebar from './SessionSidebar.vue'

const emit = defineEmits<{
  newSession: []
  selectSession: [sessionId: string]
  deleteSession: [sessionId: string]
}>()

const sidebarRef = ref<InstanceType<typeof SessionSidebar> | null>(null)

// Expose sidebar ref for refreshing session list
defineExpose({ sidebarRef })
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <Header @new-session="emit('newSession')" />

    <!-- Main Content with Sidebar -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Session Sidebar -->
      <div class="w-72 flex-shrink-0">
        <SessionSidebar
          ref="sidebarRef"
          @select-session="emit('selectSession', $event)"
          @delete-session="emit('deleteSession', $event)"
        />
      </div>

      <!-- Main Area -->
      <main class="flex-1 overflow-hidden">
        <slot name="chat" />
      </main>
    </div>
  </div>
</template>
