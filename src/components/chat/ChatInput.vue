<script setup lang="ts">
import { ref } from 'vue'
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon, StopIcon } from '@heroicons/vue/24/solid'

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
  cancel: []
  imageChange: [hasImage: boolean]
}>()

const inputText = ref('')
const imagePreview = ref<string | null>(null)
const imageBase64 = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)

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
    emit('imageChange', true)
  }
  reader.readAsDataURL(file)

  // Reset input
  input.value = ''
}

function clearImage() {
  imagePreview.value = null
  imageBase64.value = null
  emit('imageChange', false)
}
</script>

<template>
  <div class="px-4 py-3">
    <div class="max-w-[60%] mx-auto">
      <!-- Card container -->
      <div
        class="rounded-2xl border bg-white transition-all duration-200"
        :class="
          focused
            ? 'border-blue-300 shadow-md shadow-blue-100/50 ring-1 ring-blue-200/60'
            : 'border-gray-200 shadow-sm hover:shadow'
        "
      >
        <!-- Image preview inside card -->
        <div v-if="imagePreview" class="px-4 pt-3">
          <div class="relative inline-block">
            <img
              :src="imagePreview"
              alt="Attached image"
              class="max-w-xs max-h-28 rounded-lg border border-gray-200"
            />
            <button
              @click="clearImage"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <textarea
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          @focus="focused = true"
          @blur="focused = false"
          @keydown="handleKeydown"
          rows="1"
          class="w-full px-4 pt-3 pb-1 bg-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
        />

        <!-- Bottom bar -->
        <div class="flex items-center justify-between px-2.5 pb-2">
          <!-- Left: image upload -->
          <button
            @click="openFilePicker"
            :disabled="disabled"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Attach image"
          >
            <PhotoIcon class="w-5 h-5" />
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />

          <!-- Right: send / stop -->
          <button
            v-if="loading"
            @click="emit('cancel')"
            class="p-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Stop generation"
          >
            <StopIcon class="w-5 h-5" />
          </button>
          <button
            v-else
            @click="handleSubmit"
            :disabled="disabled || !inputText.trim()"
            class="p-1.5 rounded-lg transition-all duration-150"
            :class="
              inputText.trim()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            "
          >
            <PaperAirplaneIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
