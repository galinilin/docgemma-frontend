<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import type { Message } from '@/types'
import type { ClinicalTrace } from '@/types/trace'
import { UserIcon, CpuChipIcon, WrenchIcon } from '@heroicons/vue/24/solid'
import { ChevronDownIcon, LightBulbIcon } from '@heroicons/vue/24/solid'
import ReasoningDrawer from './ReasoningDrawer.vue'

const md = new MarkdownIt({ linkify: true, breaks: true })

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')
const isTool = computed(() => props.message.role === 'tool')
const isAssistant = computed(() => props.message.role === 'assistant')
const trace = computed(() => props.message.metadata?.clinical_trace as ClinicalTrace | undefined)
const hasTrace = computed(() => isAssistant.value && (trace.value?.steps?.length ?? 0) > 0)
const isTraceOpen = ref(false)

const preliminaryThinking = computed(() => props.message.metadata?.preliminary_thinking as string | undefined)
const hasThinking = computed(() => isAssistant.value && !!preliminaryThinking.value)
const isThinkingOpen = ref(false)
const renderedThinking = computed(() => preliminaryThinking.value ? md.render(preliminaryThinking.value) : '')

const bubbleClasses = computed(() => {
  if (isUser.value) {
    return 'bg-blue-600 text-white'
  }
  if (isTool.value) {
    return 'bg-gray-100 text-gray-800 border border-gray-200'
  }
  return 'bg-white text-gray-800 border border-gray-200'
})

const iconComponent = computed(() => {
  if (isUser.value) return UserIcon
  if (isTool.value) return WrenchIcon
  return CpuChipIcon
})

const iconClasses = computed(() => {
  if (isUser.value) return 'bg-blue-600 text-white'
  if (isTool.value) return 'bg-green-100 text-green-600'
  return 'bg-purple-100 text-purple-600'
})

const imageUrl = computed(() => props.message.metadata?.image_url as string | undefined)

const renderedContent = computed(() => {
  if (isAssistant.value) {
    return md.render(props.message.content)
  }
  return ''
})

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const responseDuration = computed(() => {
  const t = trace.value
  if (!t || !t.total_duration_ms) return null
  return (t.total_duration_ms / 1000).toFixed(1)
})
</script>

<template>
  <div class="flex" :class="isUser ? 'justify-end' : 'justify-start'">
    <div class="flex gap-3 max-w-[85%]" :class="{ 'flex-row-reverse': isUser }">
      <!-- Avatar -->
      <div
        class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        :class="iconClasses"
      >
        <component :is="iconComponent" class="w-4 h-4" />
      </div>

      <!-- Message content -->
      <div class="space-y-1 flex-1 min-w-0">
        <!-- Thinking section (collapsible, gray) -->
        <div v-if="hasThinking" class="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
          <button
            @click="isThinkingOpen = !isThinkingOpen"
            class="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <LightBulbIcon class="w-3.5 h-3.5 flex-shrink-0" />
            <span>Agent Thinking</span>
            <ChevronDownIcon
              class="w-3.5 h-3.5 ml-auto transition-transform"
              :class="{ 'rotate-180': isThinkingOpen }"
            />
          </button>
          <div v-if="isThinkingOpen" class="px-3 pb-2 text-sm text-gray-700 thinking-body" v-html="renderedThinking" />
        </div>
        <div
          v-if="isAssistant"
          class="px-4 py-2 rounded-lg markdown-body"
          :class="bubbleClasses"
          v-html="renderedContent"
        />
        <div
          v-else
          class="px-4 py-2 rounded-lg whitespace-pre-wrap"
          :class="bubbleClasses"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Uploaded medical image"
            class="max-w-xs max-h-48 rounded-lg mb-2"
          />
          {{ message.content }}
        </div>
        <div class="flex items-center gap-2" :class="{ 'justify-end': isUser }">
          <p class="text-xs text-gray-400">
            {{ formattedTime }}
          </p>
          <!-- Response time badge -->
          <span v-if="responseDuration" class="text-xs text-gray-400">
            Responded in {{ responseDuration }}s
          </span>
          <!-- Trace toggle -->
          <button
            v-if="hasTrace"
            @click="isTraceOpen = !isTraceOpen"
            class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronDownIcon
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': isTraceOpen }"
            />
            {{ isTraceOpen ? 'Hide' : 'Show' }} steps ({{ trace?.tools_consulted }} source(s))
          </button>
        </div>
        <ReasoningDrawer v-if="hasTrace && trace" :trace="trace" :is-open="isTraceOpen" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-body :deep(h1) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.75rem 0 0.5rem;
}
.markdown-body :deep(h2) {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}
.markdown-body :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}
.markdown-body :deep(p) {
  margin: 0.5rem 0;
}
.markdown-body :deep(p:first-child) {
  margin-top: 0;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}
.markdown-body :deep(ul) {
  list-style-type: disc;
}
.markdown-body :deep(ol) {
  list-style-type: decimal;
}
.markdown-body :deep(li) {
  margin: 0.25rem 0;
}
.markdown-body :deep(strong) {
  font-weight: 700;
}
.markdown-body :deep(em) {
  font-style: italic;
}
.markdown-body :deep(code) {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
.markdown-body :deep(pre) {
  background: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}
.markdown-body :deep(blockquote) {
  border-left: 3px solid #d1d5db;
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: #6b7280;
}
.markdown-body :deep(table) {
  border-collapse: collapse;
  margin: 0.5rem 0;
  width: 100%;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.375rem 0.75rem;
  text-align: left;
}
.markdown-body :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}
.markdown-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0.75rem 0;
}

/* Thinking section markdown styles */
.thinking-body :deep(p) {
  margin: 0.375rem 0;
}
.thinking-body :deep(p:first-child) {
  margin-top: 0;
}
.thinking-body :deep(p:last-child) {
  margin-bottom: 0;
}
.thinking-body :deep(ul),
.thinking-body :deep(ol) {
  margin: 0.375rem 0;
  padding-left: 1.5rem;
}
.thinking-body :deep(ul) {
  list-style-type: disc;
}
.thinking-body :deep(ol) {
  list-style-type: decimal;
}
.thinking-body :deep(li) {
  margin: 0.125rem 0;
}
.thinking-body :deep(strong) {
  font-weight: 700;
}
.thinking-body :deep(em) {
  font-style: italic;
}
.thinking-body :deep(code) {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
.thinking-body :deep(a) {
  color: #4b5563;
  text-decoration: underline;
}
</style>
