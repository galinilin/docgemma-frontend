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

const substance = ref('')
const reaction = ref('')
const severity = ref('moderate')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!substance.value.trim() || !reaction.value.trim()) {
    error.value = 'Please fill in substance and reaction'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const response = await api.addAllergy(props.patientId, {
      substance: substance.value.trim(),
      reaction: reaction.value.trim(),
      severity: severity.value,
    })

    if (response.error) {
      error.value = response.error
    } else {
      emit('added')
    }
  } catch (err: any) {
    error.value = err?.detail || 'Failed to add allergy'
    console.error('Failed to add allergy:', err)
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
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50">
        <h2 class="text-lg font-semibold text-red-900">Add Allergy</h2>
        <button
          @click="emit('close')"
          class="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
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

        <!-- Substance -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Allergen/Substance <span class="text-red-500">*</span>
          </label>
          <input
            v-model="substance"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., Penicillin, Peanuts"
          />
        </div>

        <!-- Reaction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Reaction <span class="text-red-500">*</span>
          </label>
          <input
            v-model="reaction"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., hives, anaphylaxis, rash"
          />
        </div>

        <!-- Severity -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            v-model="severity"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
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
            class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Adding...' : 'Add Allergy' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
