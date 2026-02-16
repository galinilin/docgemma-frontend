<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types'
import MessageBubble from './MessageBubble.vue'

const props = withDefaults(defineProps<{
  messages: Message[]
  compact?: boolean
}>(), {
  compact: false,
})

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
  <div ref="listRef" class="p-4">
    <!-- Centered container for messages -->
    <div class="mx-auto space-y-4" :class="compact ? 'max-w-full' : 'max-w-[60%]'">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>

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
