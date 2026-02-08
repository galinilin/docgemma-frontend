<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useSessionStore } from '@/stores'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import AgentStatusIndicator from './AgentStatusIndicator.vue'
import StreamingText from './StreamingText.vue'

const emit = defineEmits<{
  sendMessage: [content: string, imageBase64?: string]
  cancel: []
}>()

const sessionStore = useSessionStore()
const scrollContainer = ref<HTMLDivElement | null>(null)

function handleSend(content: string, imageBase64?: string) {
  emit('sendMessage', content, imageBase64)
}

function handleCancel() {
  emit('cancel')
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

// Auto-scroll when agent status changes
watch(() => sessionStore.agentStatusText, () => {
  scrollToBottom()
})

// Auto-scroll when streaming text updates
watch(() => sessionStore.streamingText, () => {
  scrollToBottom()
})

// Auto-scroll when new messages are added
watch(() => sessionStore.messages.length, () => {
  scrollToBottom()
})
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Messages + streaming + status (scrollable) -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto">
      <MessageList :messages="sessionStore.messages" />

      <!-- Agent status indicator (inline, like Gemini's thinking indicator) -->
      <div v-if="sessionStore.agentStatusText && !sessionStore.streamingText" class="px-4 pb-4">
        <div class="max-w-[60%] mx-auto">
          <AgentStatusIndicator :text="sessionStore.agentStatusText" />
        </div>
      </div>

      <!-- Streaming response (inside scroll area so user can scroll back) -->
      <div v-if="sessionStore.streamingText" class="px-4 pb-4">
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
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
