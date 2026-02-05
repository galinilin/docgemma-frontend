<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import {
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- Logo/Brand -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200">
        <ClipboardDocumentListIcon class="h-8 w-8 text-blue-600" />
        <span class="ml-2 text-xl font-semibold text-gray-900">DocGemma EHR</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2">
        <RouterLink
          to="/ehr"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="[
            $route.name === 'ehr-patients'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <ClipboardDocumentListIcon class="h-5 w-5 mr-3" />
          Patients
        </RouterLink>
      </nav>

      <!-- Back to Chat -->
      <div class="p-4 border-t border-gray-200">
        <RouterLink
          to="/"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChatBubbleLeftRightIcon class="h-5 w-5 mr-3" />
          Back to Chat
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>
