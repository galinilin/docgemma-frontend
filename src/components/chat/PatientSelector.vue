<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { UserIcon, ChevronUpDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useSessionStore } from '@/stores'
import { useApi } from '@/composables'

const sessionStore = useSessionStore()
const api = useApi()

interface PatientOption {
  patient_id: string
  name: string
  dob: string
  gender: string | null
  specialty: string | null
}

const patients = ref<PatientOption[]>([])
const open = ref(false)
const search = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const highlightedIndex = ref(-1)

const selected = computed(() =>
  patients.value.find((p) => p.patient_id === sessionStore.selectedPatientId) ?? null
)

const filtered = computed(() => {
  if (!search.value) return patients.value
  const q = search.value.toLowerCase()
  return patients.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.specialty?.toLowerCase().includes(q) ||
      p.dob.includes(q)
  )
})

onMounted(async () => {
  try {
    const data = await api.listPatients()
    patients.value = data.patients

    // Validate restored patient ID — clear if no longer in EHR
    if (
      sessionStore.selectedPatientId &&
      !data.patients.some((p) => p.patient_id === sessionStore.selectedPatientId)
    ) {
      sessionStore.selectedPatientId = null
    }
  } catch {
    // Silently fail
  }
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}

function toggle() {
  if (open.value) {
    close()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  open.value = true
  search.value = ''
  highlightedIndex.value = -1
  nextTick(() => inputRef.value?.focus())
}

function close() {
  open.value = false
  search.value = ''
  highlightedIndex.value = -1
}

function select(p: PatientOption) {
  sessionStore.selectedPatientId = p.patient_id
  close()
}

function clear() {
  sessionStore.selectedPatientId = null
  close()
}

function handleKeydown(e: KeyboardEvent) {
  const list = filtered.value
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, list.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (highlightedIndex.value >= 0 && highlightedIndex.value < list.length) {
      select(list[highlightedIndex.value])
    }
  } else if (e.key === 'Escape') {
    close()
  }
}

function formatAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return `${age}y`
}

function genderAbbr(g: string | null): string {
  if (!g) return ''
  return g.charAt(0).toUpperCase()
}
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Trigger button -->
    <button
      @click="toggle"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border"
      :class="
        selected
          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
      "
    >
      <UserIcon class="w-3.5 h-3.5 flex-shrink-0" />
      <span class="max-w-[140px] truncate">
        {{ selected ? selected.name : 'Patient' }}
      </span>
      <XMarkIcon
        v-if="selected"
        class="w-3.5 h-3.5 flex-shrink-0 hover:text-blue-900"
        @click.stop="clear"
      />
      <ChevronUpDownIcon v-else class="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
      >
        <!-- Search input -->
        <div class="p-2 border-b border-gray-100">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              ref="inputRef"
              v-model="search"
              @keydown="handleKeydown"
              type="text"
              placeholder="Search patients..."
              class="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <!-- Patient list -->
        <ul class="max-h-56 overflow-y-auto py-1">
          <li
            v-if="filtered.length === 0"
            class="px-3 py-4 text-center text-xs text-gray-400"
          >
            No patients found
          </li>
          <li
            v-for="(p, i) in filtered"
            :key="p.patient_id"
            @click="select(p)"
            @mouseenter="highlightedIndex = i"
            class="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors"
            :class="[
              highlightedIndex === i ? 'bg-blue-50' : 'hover:bg-gray-50',
              p.patient_id === sessionStore.selectedPatientId ? 'bg-blue-50/50' : '',
            ]"
          >
            <!-- Avatar circle -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              :class="
                p.patient_id === sessionStore.selectedPatientId
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              {{ p.name.charAt(0) }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">{{ p.name }}</div>
              <div class="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span>{{ formatAge(p.dob) }}</span>
                <span v-if="p.gender" class="text-gray-300">&middot;</span>
                <span v-if="p.gender">{{ genderAbbr(p.gender) }}</span>
                <span v-if="p.specialty" class="text-gray-300">&middot;</span>
                <span v-if="p.specialty" class="truncate">{{ p.specialty }}</span>
              </div>
            </div>

            <!-- Check mark for selected -->
            <svg
              v-if="p.patient_id === sessionStore.selectedPatientId"
              class="w-4 h-4 text-blue-600 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
