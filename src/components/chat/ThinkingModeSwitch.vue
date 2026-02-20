<script setup lang="ts">
import { LightBulbIcon } from '@heroicons/vue/24/outline'
import { useSessionStore } from '@/stores'

const sessionStore = useSessionStore()

function toggle() {
  sessionStore.thinkingEnabled = !sessionStore.thinkingEnabled
}
</script>

<template>
  <button
    @click="toggle"
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border select-none"
    :class="
      sessionStore.thinkingEnabled
        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600'
    "
  >
    <LightBulbIcon class="w-3.5 h-3.5 flex-shrink-0" />
    <span>Thinking {{ sessionStore.thinkingEnabled ? 'ON' : 'OFF' }}</span>
  </button>
</template>
