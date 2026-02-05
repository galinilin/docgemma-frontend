<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { usePatientApi } from '@/composables/usePatientApi'

const props = defineProps<{
  patientId: string
}>()

const emit = defineEmits<{
  close: []
  added: []
}>()

const api = usePatientApi()

const noteText = ref('')
const noteType = ref('clinical-note')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!noteText.value.trim()) {
    error.value = 'Please enter note content'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const response = await api.saveNote(props.patientId, {
      note_text: noteText.value.trim(),
      note_type: noteType.value,
    })

    if (response.error) {
      error.value = response.error
    } else {
      emit('added')
    }
  } catch (err: any) {
    error.value = err?.detail || 'Failed to save note'
    console.error('Failed to save note:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50"
      @click="emit('close')"
    ></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
        <h2 class="text-lg font-semibold text-amber-900">Add Clinical Note</h2>
        <button
          @click="emit('close')"
          class="p-1 text-amber-400 hover:text-amber-600 rounded transition-colors"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {{ error }}
        </div>

        <!-- Note Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Note Type
          </label>
          <select
            v-model="noteType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="clinical-note">Clinical Note</option>
            <option value="progress-note">Progress Note</option>
            <option value="discharge-summary">Discharge Summary</option>
            <option value="history-and-physical">History & Physical</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>

        <!-- Note Text -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Note Content <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="noteText"
            required
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            placeholder="Enter clinical note content..."
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Note' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
