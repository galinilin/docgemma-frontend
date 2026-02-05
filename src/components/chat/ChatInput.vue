<script setup lang="ts">
import { ref } from 'vue'
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from '@heroicons/vue/24/solid'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    placeholder?: string
  }>(),
  {
    disabled: false,
    loading: false,
    placeholder: 'Ask a medical question...',
  }
)

const emit = defineEmits<{
  send: [content: string, imageBase64?: string]
}>()

const inputText = ref('')
const imagePreview = ref<string | null>(null)
const imageBase64 = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleSubmit() {
  const text = inputText.value.trim()
  if (!text || props.disabled) return

  emit('send', text, imageBase64.value || undefined)
  inputText.value = ''
  clearImage()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    imagePreview.value = result
    // Extract base64 data (remove data:image/...;base64, prefix)
    imageBase64.value = result.split(',')[1]
  }
  reader.readAsDataURL(file)

  // Reset input
  input.value = ''
}

function clearImage() {
  imagePreview.value = null
  imageBase64.value = null
}
</script>

<template>
  <div class="p-4">
    <div class="max-w-[60%] mx-auto">
      <!-- Image preview -->
      <div
        v-if="imagePreview"
        class="mb-3 relative inline-block"
      >
      <img
        :src="imagePreview"
        alt="Attached image"
        class="max-w-xs max-h-32 rounded-lg border border-gray-200"
      />
      <button
        @click="clearImage"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Input row -->
    <div class="flex items-end gap-2">
      <!-- Image upload button -->
      <button
        @click="openFilePicker"
        :disabled="disabled"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Attach image"
      >
        <PhotoIcon class="w-6 h-6" />
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Text input -->
      <div class="flex-1 relative">
        <textarea
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          @keydown="handleKeydown"
          rows="1"
          class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <!-- Send button -->
      <button
        @click="handleSubmit"
        :disabled="disabled || !inputText.trim()"
        class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <PaperAirplaneIcon v-if="!loading" class="w-6 h-6" />
        <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </button>
    </div>

      <!-- Helper text -->
      <p class="mt-2 text-xs text-gray-400">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  </div>
</template>
