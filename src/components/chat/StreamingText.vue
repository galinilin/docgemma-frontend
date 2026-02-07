<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { CpuChipIcon } from '@heroicons/vue/24/solid'

const md = new MarkdownIt({ linkify: true, breaks: true })

const props = defineProps<{
  text: string
}>()

const renderedText = computed(() => md.render(props.text))
</script>

<template>
  <div class="flex gap-3 py-2">
    <!-- Avatar -->
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
      <CpuChipIcon class="w-4 h-4 text-purple-600" />
    </div>

    <!-- Streaming content -->
    <div class="flex-1">
      <div class="px-4 py-2 bg-white border border-gray-200 rounded-lg markdown-body">
        <div v-html="renderedText" />
        <span class="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-0.5" />
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
</style>
