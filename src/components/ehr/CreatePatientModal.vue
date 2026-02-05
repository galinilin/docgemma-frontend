<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { usePatientApi } from '@/composables/usePatientApi'

const emit = defineEmits<{
  close: []
  created: []
}>()

const api = usePatientApi()

const givenName = ref('')
const familyName = ref('')
const birthDate = ref('')
const gender = ref('unknown')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!givenName.value.trim() || !familyName.value.trim() || !birthDate.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    await api.createPatient({
      given_name: givenName.value.trim(),
      family_name: familyName.value.trim(),
      birth_date: birthDate.value,
      gender: gender.value,
    })
    emit('created')
  } catch (err: any) {
    error.value = err?.detail || 'Failed to create patient'
    console.error('Failed to create patient:', err)
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
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">New Patient</h2>
        <button
          @click="emit('close')"
          class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
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

        <!-- Given Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="givenName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John"
          />
        </div>

        <!-- Family Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="familyName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Smith"
          />
        </div>

        <!-- Birth Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span class="text-red-500">*</span>
          </label>
          <input
            v-model="birthDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            v-model="gender"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
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
            class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Creating...' : 'Create Patient' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
