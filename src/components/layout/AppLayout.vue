<script setup lang="ts">
import { ref } from 'vue'
import Header from './Header.vue'
import SplitPane from './SplitPane.vue'

const graphPanelWidth = ref(50) // percentage
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
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
</template>
