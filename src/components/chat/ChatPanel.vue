<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useSessionStore } from '@/stores'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import AgentStatusIndicator from './AgentStatusIndicator.vue'
import StreamingText from './StreamingText.vue'
import PatientSelector from './PatientSelector.vue'
import ToolModeSwitch from './ToolModeSwitch.vue'

const emit = defineEmits<{
  sendMessage: [content: string, imageBase64?: string]
  cancel: []
}>()

const sessionStore = useSessionStore()
const scrollContainer = ref<HTMLDivElement | null>(null)

const isStarterMode = computed(() => sessionStore.messages.length === 0)

const GREETINGS = [
  'How can I help?',
  'What can I look up for you?',
  'Ready when you are.',
  'What are we working on?',
  'Ask me anything.',
]
const greeting = ref('')
onMounted(() => {
  greeting.value = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
})

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
    <!-- Starter mode: centered input -->
    <template v-if="isStarterMode">
      <div class="flex-1 flex items-center justify-center">
        <div class="w-full max-w-[60%] mx-auto px-4">
          <h1 class="text-center text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500 bg-clip-text text-transparent select-none">
            {{ greeting }}
          </h1>
          <ChatInput
            :disabled="!sessionStore.canSendMessage"
            :loading="sessionStore.isProcessing"
            @send="handleSend"
            @cancel="handleCancel"
          />
          <!-- Controls + hint row -->
          <div class="max-w-[60%] mx-auto flex items-center gap-2 mt-2 px-6">
            <PatientSelector />
            <ToolModeSwitch />
            <span class="ml-auto text-[11px] text-gray-300 whitespace-nowrap">Enter to send · Shift+Enter for newline</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Active mode: messages + bottom input -->
    <template v-else>
      <!-- Messages + streaming + status (scrollable) -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto">
        <MessageList :messages="sessionStore.messages" />

        <!-- Agent status indicator -->
        <div v-if="sessionStore.agentStatusText && !sessionStore.streamingText" class="px-4 pb-4">
          <div class="max-w-[60%] mx-auto">
            <AgentStatusIndicator :text="sessionStore.agentStatusText" />
          </div>
        </div>

        <!-- Streaming response -->
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
        <!-- Controls + hint row -->
        <div class="max-w-[60%] mx-auto flex items-center gap-2 -mt-1 pb-3 px-6">
          <PatientSelector />
          <ToolModeSwitch />
          <span class="ml-auto text-[11px] text-gray-300 whitespace-nowrap">Enter to send · Shift+Enter for newline</span>
        </div>
      </div>
    </template>
  </div>
</template>
