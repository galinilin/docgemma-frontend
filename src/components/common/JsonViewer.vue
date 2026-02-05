<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: unknown
  expandLevel?: number
}>()

const formattedJson = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2)
  } catch {
    return String(props.data)
  }
})
</script>

<template>
  <pre class="bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-auto max-h-64 font-mono">{{ formattedJson }}</pre>
</template>
