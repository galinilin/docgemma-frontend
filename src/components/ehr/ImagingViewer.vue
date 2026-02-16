<script setup lang="ts">
import { computed, ref } from 'vue'
import { XMarkIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { usePatientApi } from '@/composables/usePatientApi'
import type { ImagingStudyInfo } from '@/types'

const props = defineProps<{
  study: ImagingStudyInfo
}>()

const emit = defineEmits<{
  close: []
  deleted: []
}>()

const api = usePatientApi()
const showConfirm = ref(false)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const fullImageUrl = computed(() => {
  const url = props.study.image_url
  if (!url) return ''
  if (url.startsWith('/api/')) {
    return `${API_BASE}${url.slice(4)}`
  }
  return url
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown'
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}

function formatContentType(ct: string): string {
  if (ct === 'image/jpeg') return 'JPEG'
  if (ct === 'image/png') return 'PNG'
  return ct
}

async function handleDelete() {
  if (!props.study.id) return
  isDeleting.value = true
  deleteError.value = null
  try {
    const response = await api.deleteImaging(props.study.id)
    if (response.error) {
      deleteError.value = response.error
    } else {
      emit('deleted')
    }
  } catch (err: any) {
    deleteError.value = err?.detail || 'Failed to delete imaging study'
    console.error('Failed to delete imaging:', err)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Dark backdrop -->
    <div
      class="absolute inset-0 bg-black/80"
      @click="emit('close')"
    ></div>

    <!-- Viewer -->
    <div class="relative flex w-full h-full max-w-6xl max-h-[90vh] mx-4">
      <!-- Image area -->
      <div class="flex-1 flex items-center justify-center p-4 min-w-0">
        <img
          :src="fullImageUrl"
          :alt="study.modality_display || 'Medical image'"
          class="max-w-full max-h-full object-contain rounded"
        />
      </div>

      <!-- Metadata sidebar -->
      <div class="w-64 bg-white rounded-r-lg flex flex-col flex-shrink-0">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900 text-sm">Study Details</h3>
          <button
            @click="emit('close')"
            class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Details -->
        <div class="p-4 space-y-4 overflow-y-auto flex-1">
          <!-- Modality -->
          <div>
            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Modality</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ study.modality_display || study.modality || 'Unknown' }}
            </dd>
          </div>

          <!-- Body Site -->
          <div v-if="study.body_site">
            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Body Site</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ study.body_site }}</dd>
          </div>

          <!-- Study Date -->
          <div>
            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Study Date</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(study.study_date) }}</dd>
          </div>

          <!-- Description -->
          <div v-if="study.description">
            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ study.description }}</dd>
          </div>

          <!-- Format -->
          <div>
            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Format</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatContentType(study.content_type) }}</dd>
          </div>
        </div>

        <!-- Delete section -->
        <div class="px-4 py-3 border-t border-gray-200">
          <!-- Error -->
          <div v-if="deleteError" class="mb-2 text-xs text-red-600">
            {{ deleteError }}
          </div>

          <!-- Confirmation -->
          <div v-if="showConfirm" class="space-y-2">
            <p class="text-xs text-gray-600">Remove this imaging study?</p>
            <div class="flex gap-2">
              <button
                @click="showConfirm = false"
                class="flex-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                :disabled="isDeleting"
                class="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {{ isDeleting ? 'Removing...' : 'Remove' }}
              </button>
            </div>
          </div>

          <!-- Delete trigger -->
          <button
            v-else
            @click="showConfirm = true"
            class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon class="h-4 w-4" />
            Remove Study
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
