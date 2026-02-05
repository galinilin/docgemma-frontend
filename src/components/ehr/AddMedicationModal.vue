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

const medicationName = ref('')
const dosage = ref('')
const frequency = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!medicationName.value.trim() || !dosage.value.trim() || !frequency.value.trim()) {
    error.value = 'Please fill in all fields'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const response = await api.prescribeMedication(props.patientId, {
      medication_name: medicationName.value.trim(),
      dosage: dosage.value.trim(),
      frequency: frequency.value.trim(),
    })

    if (response.error) {
      error.value = response.error
    } else {
      emit('added')
    }
  } catch (err: any) {
    error.value = err?.detail || 'Failed to prescribe medication'
    console.error('Failed to prescribe medication:', err)
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
      <div class="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50">
        <h2 class="text-lg font-semibold text-blue-900">Prescribe Medication</h2>
        <button
          @click="emit('close')"
          class="p-1 text-blue-400 hover:text-blue-600 rounded transition-colors"
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

        <!-- Medication Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Medication Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="medicationName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Metformin, Lisinopril"
          />
        </div>

        <!-- Dosage -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Dosage <span class="text-red-500">*</span>
          </label>
          <input
            v-model="dosage"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 500mg, 10mg"
          />
        </div>

        <!-- Frequency -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Frequency <span class="text-red-500">*</span>
          </label>
          <input
            v-model="frequency"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., once daily, twice daily, every 8 hours"
          />
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
            class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Prescribing...' : 'Prescribe' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
