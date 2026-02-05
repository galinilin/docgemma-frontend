<script setup lang="ts">
import { useSessionStore } from '@/stores'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import StreamingText from './StreamingText.vue'

const emit = defineEmits<{
  sendMessage: [content: string, imageBase64?: string]
}>()

const sessionStore = useSessionStore()

function handleSend(content: string, imageBase64?: string) {
  emit('sendMessage', content, imageBase64)
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Message list -->
    <div class="flex-1 overflow-y-auto">
      <MessageList :messages="sessionStore.messages" />

      <!-- Streaming response (centered to match message list) -->
      <div v-if="sessionStore.streamingText" class="px-4">
        <div class="max-w-[60%] mx-auto">
          <StreamingText :text="sessionStore.streamingText" />
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-gray-200">
      <ChatInput
        :disabled="!sessionStore.canSendMessage"
        :loading="sessionStore.isProcessing"
        @send="handleSend"
      />
    </div>
  </div>
</template>
