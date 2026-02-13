<script setup lang="ts">
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import type { TraceStep } from '@/types/trace'
import { LightBulbIcon, MagnifyingGlassIcon, CheckCircleIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const md = new MarkdownIt({ linkify: true, breaks: true })

const props = defineProps<{
  step: TraceStep
  isLast: boolean
}>()

const icon = {
  thought: LightBulbIcon,
  tool_call: MagnifyingGlassIcon,
  synthesis: CheckCircleIcon,
}[props.step.type]

const iconBg = {
  thought: 'bg-amber-100 text-amber-600',
  tool_call: 'bg-blue-100 text-blue-600',
  synthesis: 'bg-green-100 text-green-600',
}[props.step.type]

const isReasoningOpen = ref(true)
const isDetailOpen = ref(props.step.tool_name === 'analyze_medical_image')

const renderedReasoning = computed(() =>
  props.step.reasoning_text ? md.render(props.step.reasoning_text) : ''
)
const renderedDetail = computed(() =>
  props.step.tool_result_detail ? md.render(props.step.tool_result_detail) : ''
)
</script>

<template>
  <div class="flex gap-3">
    <div class="flex flex-col items-center">
      <div :class="['w-8 h-8 rounded-full flex items-center justify-center', iconBg]">
        <component :is="icon" class="w-4 h-4" />
      </div>
      <div v-if="!isLast" class="w-0.5 flex-1 bg-gray-200 mt-2" />
    </div>
    <div class="flex-1 pb-4">
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-900">{{ step.label }}</span>
        <span v-if="step.duration_ms" class="text-xs text-gray-400">
          {{ (step.duration_ms / 1000).toFixed(1) }}s
        </span>
      </div>
      <p v-if="!step.reasoning_text && step.description" class="text-sm text-gray-600 mt-1">{{ step.description }}</p>

      <!-- Model reasoning (thought steps) -->
      <div v-if="step.reasoning_text" class="mt-1">
        <button
          @click="isReasoningOpen = !isReasoningOpen"
          class="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900"
        >
          <ChevronDownIcon
            class="w-3.5 h-3.5 transition-transform"
            :class="{ 'rotate-180': isReasoningOpen }"
          />
          {{ isReasoningOpen ? 'Hide' : 'Show' }} reasoning
        </button>
        <div
          v-if="isReasoningOpen"
          class="text-sm text-gray-600 mt-2 bg-amber-50 px-3 py-2 rounded markdown-body markdown-amber"
          v-html="renderedReasoning"
        />
      </div>

      <!-- Tool result detail (expandable) -->
      <div v-if="step.tool_result_detail" class="mt-1.5">
        <button
          @click="isDetailOpen = !isDetailOpen"
          class="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900"
        >
          <ChevronDownIcon
            class="w-3.5 h-3.5 transition-transform"
            :class="{ 'rotate-180': isDetailOpen }"
          />
          {{ isDetailOpen ? 'Hide' : 'Show' }} results
        </button>
        <div
          v-if="isDetailOpen"
          class="text-sm text-gray-600 mt-2 bg-blue-50 px-3 py-2 rounded markdown-body markdown-blue"
          v-html="renderedDetail"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Shared markdown-body base */
.markdown-body :deep(h1) { font-size: 1.125rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
.markdown-body :deep(h2) { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.markdown-body :deep(h3) { font-size: 0.875rem; font-weight: 600; margin: 0.375rem 0 0.125rem; }
.markdown-body :deep(p) { margin: 0.375rem 0; }
.markdown-body :deep(p:first-child) { margin-top: 0; }
.markdown-body :deep(p:last-child) { margin-bottom: 0; }
.markdown-body :deep(ul),
.markdown-body :deep(ol) { margin: 0.375rem 0; padding-left: 1.25rem; }
.markdown-body :deep(ul) { list-style-type: disc; }
.markdown-body :deep(ol) { list-style-type: decimal; }
.markdown-body :deep(li) { margin: 0.125rem 0; }
.markdown-body :deep(strong) { font-weight: 700; }
.markdown-body :deep(em) { font-style: italic; }

/* Amber theme (reasoning) */
.markdown-amber :deep(code) { background: rgba(217, 119, 6, 0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125rem; }
.markdown-amber :deep(pre) { background: rgba(217, 119, 6, 0.1); padding: 0.5rem; border-radius: 0.375rem; overflow-x: auto; margin: 0.375rem 0; }
.markdown-amber :deep(pre code) { background: none; padding: 0; }
.markdown-amber :deep(blockquote) { border-left: 3px solid #d97706; padding-left: 0.75rem; margin: 0.375rem 0; color: #92400e; }
.markdown-amber :deep(a) { color: #b45309; text-decoration: underline; }

/* Blue theme (tool results) */
.markdown-blue :deep(code) { background: rgba(37, 99, 235, 0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125rem; }
.markdown-blue :deep(pre) { background: rgba(37, 99, 235, 0.1); padding: 0.5rem; border-radius: 0.375rem; overflow-x: auto; margin: 0.375rem 0; }
.markdown-blue :deep(pre code) { background: none; padding: 0; }
.markdown-blue :deep(blockquote) { border-left: 3px solid #2563eb; padding-left: 0.75rem; margin: 0.375rem 0; color: #1e40af; }
.markdown-blue :deep(a) { color: #2563eb; text-decoration: underline; }
</style>
