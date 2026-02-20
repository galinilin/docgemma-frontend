<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import { LightBulbIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'

const md = new MarkdownIt({ linkify: true, breaks: true })

const props = withDefaults(defineProps<{
  text: string
  streaming?: boolean
}>(), {
  streaming: true,
})

const isOpen = ref(false)
const renderedText = computed(() => md.render(props.text))
</script>

<template>
  <div class="flex gap-3 py-2">
    <!-- Avatar -->
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <LightBulbIcon class="w-4 h-4 text-gray-500" />
    </div>

    <!-- Streaming thinking content -->
    <div class="flex-1">
      <div class="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <button
          @click="isOpen = !isOpen"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <span>Agent Thinking</span>
          <span v-if="streaming" class="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
          <ChevronDownIcon
            class="w-3.5 h-3.5 ml-auto transition-transform"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>
        <div v-if="isOpen" class="px-3 pb-2">
          <div class="text-sm text-gray-700 markdown-body" v-html="renderedText" />
          <span v-if="streaming" class="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-0.5" />
        </div>
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
.markdown-body :deep(a) {
  color: #4b5563;
  text-decoration: underline;
}
</style>
