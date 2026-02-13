<script setup lang="ts">
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import { useSessionStore } from '@/stores'

const props = withDefaults(defineProps<{ locked?: boolean }>(), { locked: false })

const sessionStore = useSessionStore()

function toggle() {
  if (props.locked) return
  sessionStore.toolCallingEnabled = !sessionStore.toolCallingEnabled
}
</script>

<template>
  <button
    @click="toggle"
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border select-none"
    :class="[
      sessionStore.toolCallingEnabled
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-gray-50 text-gray-400 border-gray-200',
      locked
        ? 'opacity-60 cursor-not-allowed'
        : sessionStore.toolCallingEnabled
          ? 'hover:bg-emerald-100'
          : 'hover:bg-gray-100 hover:text-gray-600',
    ]"
    :title="locked ? 'Tool calling required for image analysis' : ''"
  >
    <WrenchScrewdriverIcon class="w-3.5 h-3.5 flex-shrink-0" />
    <span>Tools {{ sessionStore.toolCallingEnabled ? 'ON' : 'OFF' }}</span>
  </button>
</template>
