<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import { UserIcon, CpuChipIcon, WrenchIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')
const isTool = computed(() => props.message.role === 'tool')

const bubbleClasses = computed(() => {
  if (isUser.value) {
    return 'bg-blue-600 text-white ml-auto'
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
  <div
    class="flex gap-3"
    :class="{ 'flex-row-reverse': isUser }"
  >
    <!-- Avatar -->
    <div
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
      :class="iconClasses"
    >
      <component :is="iconComponent" class="w-4 h-4" />
    </div>

    <!-- Message content -->
    <div class="max-w-[80%] space-y-1">
      <div
        class="px-4 py-2 rounded-lg whitespace-pre-wrap"
        :class="bubbleClasses"
      >
        {{ message.content }}
      </div>
      <p
        class="text-xs text-gray-400"
        :class="{ 'text-right': isUser }"
      >
        {{ formattedTime }}
      </p>
    </div>
  </div>
</template>
