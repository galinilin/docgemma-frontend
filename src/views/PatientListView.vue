<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { useEhrStore } from '@/stores/ehrStore'
import { usePatientApi } from '@/composables/usePatientApi'
import CreatePatientModal from '@/components/ehr/CreatePatientModal.vue'

const router = useRouter()
const ehrStore = useEhrStore()
const api = usePatientApi()

const searchInput = ref('')
const isSearching = ref(false)

onMounted(async () => {
  await loadPatients()
})

async function loadPatients() {
  ehrStore.setLoading(true)
  ehrStore.clearError()
  try {
    const response = await api.listPatients()
    if (response.error) {
      ehrStore.setError(response.error)
    } else {
      ehrStore.setPatients(response.patients)
    }
  } catch (err) {
    ehrStore.setError('Failed to load patients')
    console.error('Failed to load patients:', err)
  } finally {
    ehrStore.setLoading(false)
  }
}

async function handleSearch() {
  if (!searchInput.value.trim()) {
    await loadPatients()
    return
  }

  isSearching.value = true
  ehrStore.setLoading(true)
  ehrStore.clearError()
  try {
    const response = await api.searchPatients(searchInput.value.trim())
    if (response.error) {
      ehrStore.setError(response.error)
    } else {
      ehrStore.setPatients(response.patients)
    }
  } catch (err) {
    ehrStore.setError('Search failed')
    console.error('Search failed:', err)
  } finally {
    ehrStore.setLoading(false)
    isSearching.value = false
  }
}

function selectPatient(patientId: string) {
  router.push({ name: 'ehr-patient', params: { patientId } })
}

async function handlePatientCreated() {
  ehrStore.closeCreatePatientModal()
  await loadPatients()
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'unknown') return 'Unknown'
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Patients</h1>
        <button
          @click="ehrStore.openCreatePatientModal"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlusIcon class="h-5 w-5 mr-2" />
          New Patient
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mt-4">
        <form @submit.prevent="handleSearch" class="flex gap-2">
          <div class="relative flex-1">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search by patient name..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            :disabled="isSearching"
            class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {{ isSearching ? 'Searching...' : 'Search' }}
          </button>
        </form>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <!-- Loading -->
      <div v-if="ehrStore.isLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div
        v-else-if="ehrStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
      >
        {{ ehrStore.error }}
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!ehrStore.hasPatients"
        class="flex flex-col items-center justify-center h-64 text-gray-500"
      >
        <UserIcon class="h-16 w-16 mb-4" />
        <p class="text-lg">No patients found</p>
        <p class="text-sm mt-1">Try a different search or create a new patient</p>
      </div>

      <!-- Patient List -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="patient in ehrStore.patients"
          :key="patient.patient_id"
          @click="selectPatient(patient.patient_id)"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <UserIcon class="h-5 w-5 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">
                {{ patient.name }}
              </h3>
              <p class="text-sm text-gray-500">
                DOB: {{ formatDate(patient.dob) }}
              </p>
              <p v-if="patient.gender" class="text-sm text-gray-500 capitalize">
                {{ patient.gender }}
              </p>
              <p class="text-xs text-gray-400 mt-1 font-mono truncate">
                ID: {{ patient.patient_id }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Patient Modal -->
    <CreatePatientModal
      v-if="ehrStore.showCreatePatientModal"
      @close="ehrStore.closeCreatePatientModal"
      @created="handlePatientCreated"
    />
  </div>
</template>
