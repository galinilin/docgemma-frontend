<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types'
import MessageBubble from './MessageBubble.vue'

const props = defineProps<{
  messages: Message[]
}>()

const listRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom on new messages
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  }
)
</script>

<template>
  <div ref="listRef" class="h-full overflow-y-auto p-4 space-y-4">
    <MessageBubble
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />

    <!-- Empty state -->
    <div
      v-if="messages.length === 0"
      class="h-full flex items-center justify-center text-gray-400"
    >
      <div class="text-center">
        <p class="text-lg font-medium mb-2">Start a conversation</p>
        <p class="text-sm">Ask a medical question or upload an image for analysis</p>
      </div>
    </div>
  </div>
</template>
