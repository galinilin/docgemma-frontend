<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Message } from '@/types'
import type { ClinicalTrace } from '@/types/trace'
import { UserIcon, CpuChipIcon, WrenchIcon } from '@heroicons/vue/24/solid'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import ReasoningDrawer from './ReasoningDrawer.vue'

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')
const isTool = computed(() => props.message.role === 'tool')
const isAssistant = computed(() => props.message.role === 'assistant')
const trace = computed(() => props.message.metadata?.clinical_trace as ClinicalTrace | undefined)
const hasTrace = computed(() => isAssistant.value && (trace.value?.steps?.length ?? 0) > 0)
const isTraceOpen = ref(false)

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

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      <div class="space-y-1">
        <div
          class="px-4 py-2 rounded-lg whitespace-pre-wrap"
          :class="bubbleClasses"
        >
          {{ message.content }}
        </div>
        <div class="flex items-center gap-2" :class="{ 'justify-end': isUser }">
          <p class="text-xs text-gray-400">
            {{ formattedTime }}
          </p>
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
            {{ isTraceOpen ? 'Hide' : 'Show' }} reasoning ({{ trace?.tools_consulted }} source(s))
          </button>
        </div>
        <ReasoningDrawer v-if="hasTrace && trace" :trace="trace" :is-open="isTraceOpen" />
      </div>
    </div>
  </div>
</template>
