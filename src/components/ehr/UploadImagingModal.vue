<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { usePatientApi } from '@/composables/usePatientApi'

const props = defineProps<{
  patientId: string
}>()

const emit = defineEmits<{
  close: []
  added: []
}>()

const api = usePatientApi()

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const modality = ref('CT')
const bodySite = ref('')
const studyDate = ref('')
const description = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const modalityOptions = [
  { value: 'CT', label: 'CT Scan' },
  { value: 'DX', label: 'X-Ray' },
  { value: 'MR', label: 'MRI' },
  { value: 'SM', label: 'Histopathology' },
  { value: 'PT', label: 'Pathology' },
  { value: 'OP', label: 'Ophthalmology' },
  { value: 'XC', label: 'Dermatology' },
]

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  setFile(file)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    error.value = 'Only JPEG and PNG files are supported'
    return
  }
  setFile(file)
}

function setFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File too large. Maximum is 10 MB.'
    return
  }
  selectedFile.value = file
  error.value = null
  // Create preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

async function handleSubmit() {
  if (!selectedFile.value) {
    error.value = 'Please select an image file'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const response = await api.uploadImaging(
      props.patientId,
      selectedFile.value,
      modality.value,
      bodySite.value.trim() || undefined,
      studyDate.value || undefined,
      description.value.trim() || undefined,
    )

    if (response.error) {
      error.value = response.error
    } else {
      emit('added')
    }
  } catch (err: any) {
    error.value = err?.detail || 'Failed to upload imaging study'
    console.error('Failed to upload imaging:', err)
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
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-cyan-100 bg-cyan-50">
        <h2 class="text-lg font-semibold text-cyan-900">Upload Imaging Study</h2>
        <button
          @click="emit('close')"
          class="p-1 text-cyan-400 hover:text-cyan-600 rounded transition-colors"
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

        <!-- File picker / drop zone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Image File <span class="text-red-500">*</span>
          </label>
          <div
            class="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
            :class="selectedFile ? 'border-cyan-300 bg-cyan-50/50' : 'border-gray-300 hover:border-cyan-400'"
            @dragover.prevent
            @drop="handleDrop"
            @click="($refs.fileInput as HTMLInputElement).click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png"
              class="hidden"
              @change="handleFileSelect"
            />
            <!-- Preview -->
            <div v-if="previewUrl" class="space-y-2">
              <img
                :src="previewUrl"
                alt="Preview"
                class="mx-auto max-h-32 rounded object-contain"
              />
              <p class="text-sm text-gray-600">{{ selectedFile?.name }}</p>
              <p class="text-xs text-gray-400">{{ ((selectedFile?.size || 0) / 1024 / 1024).toFixed(1) }} MB</p>
            </div>
            <!-- Placeholder -->
            <div v-else class="space-y-2 py-2">
              <PhotoIcon class="h-10 w-10 mx-auto text-gray-400" />
              <p class="text-sm text-gray-500">Click or drag to upload</p>
              <p class="text-xs text-gray-400">JPEG or PNG, max 10 MB</p>
            </div>
          </div>
        </div>

        <!-- Modality -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Modality <span class="text-red-500">*</span>
          </label>
          <select
            v-model="modality"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option
              v-for="opt in modalityOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Body Site -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Body Site
          </label>
          <input
            v-model="bodySite"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., Chest, Left knee, Brain"
          />
        </div>

        <!-- Study Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Study Date
          </label>
          <input
            v-model="studyDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description / Clinical Indication
          </label>
          <textarea
            v-model="description"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
            placeholder="e.g., Rule out pneumonia, follow-up fracture healing"
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
            :disabled="isSubmitting || !selectedFile"
            class="flex-1 px-4 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
