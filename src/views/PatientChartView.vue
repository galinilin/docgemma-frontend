<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  UserIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  HeartIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'
import { useEhrStore } from '@/stores/ehrStore'
import { usePatientApi } from '@/composables/usePatientApi'
import AddAllergyModal from '@/components/ehr/AddAllergyModal.vue'
import AddMedicationModal from '@/components/ehr/AddMedicationModal.vue'
import AddNoteModal from '@/components/ehr/AddNoteModal.vue'

const props = defineProps<{
  patientId: string
}>()

const router = useRouter()
const ehrStore = useEhrStore()
const api = usePatientApi()
const expandedNotes = ref<Set<string>>(new Set())

function toggleNote(noteId: string) {
  if (expandedNotes.value.has(noteId)) {
    expandedNotes.value.delete(noteId)
  } else {
    expandedNotes.value.add(noteId)
  }
}

onMounted(async () => {
  await loadPatientChart()
})

watch(() => props.patientId, async () => {
  await loadPatientChart()
})

async function loadPatientChart() {
  ehrStore.setLoading(true)
  ehrStore.clearError()
  ehrStore.setSelectedPatient(props.patientId)
  try {
    const chart = await api.getPatientChart(props.patientId)
    if (chart.error) {
      ehrStore.setError(chart.error)
    } else {
      ehrStore.setChart(chart)
    }
  } catch (err: any) {
    if (err?.status === 404) {
      ehrStore.setError('Patient not found')
    } else {
      ehrStore.setError('Failed to load patient chart')
    }
    console.error('Failed to load patient chart:', err)
  } finally {
    ehrStore.setLoading(false)
  }
}

function goBack() {
  router.push({ name: 'ehr-patients' })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr || dateStr === 'unknown') return 'Unknown'
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}

async function handleAllergyAdded() {
  ehrStore.closeAddAllergyModal()
  await loadPatientChart()
}

async function handleMedicationAdded() {
  ehrStore.closeAddMedicationModal()
  await loadPatientChart()
}

async function handleNoteAdded() {
  ehrStore.closeAddNoteModal()
  await loadPatientChart()
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </button>

        <div v-if="ehrStore.currentChart" class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900">
              {{ ehrStore.currentChart.name }}
            </h1>
            <p class="text-sm text-gray-500">
              DOB: {{ formatDate(ehrStore.currentChart.dob) }}
              <span v-if="ehrStore.currentChart.gender" class="ml-2 capitalize">
                {{ ehrStore.currentChart.gender }}
              </span>
            </p>
          </div>
        </div>
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

      <!-- Chart Content -->
      <div v-else-if="ehrStore.currentChart" class="space-y-6">
        <!-- Top Row: Allergies & Conditions -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Allergies -->
          <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 bg-red-50 border-b border-red-100">
              <div class="flex items-center gap-2">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-600" />
                <h2 class="font-semibold text-red-900">Allergies</h2>
              </div>
              <button
                @click="ehrStore.openAddAllergyModal"
                class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              >
                <PlusIcon class="h-5 w-5" />
              </button>
            </div>
            <div class="p-4">
              <div v-if="ehrStore.allergies.length === 0" class="text-gray-500 text-sm">
                NKDA (No Known Drug Allergies)
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="allergy in ehrStore.allergies"
                  :key="allergy.id || allergy.substance"
                  class="flex items-start gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                  <div>
                    <span class="font-medium text-gray-900">{{ allergy.substance }}</span>
                    <span v-if="allergy.severity" class="text-sm text-gray-500 ml-1">
                      ({{ allergy.severity }})
                    </span>
                    <p v-if="allergy.reaction" class="text-sm text-gray-500">
                      {{ allergy.reaction }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Conditions -->
          <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 bg-purple-50 border-b border-purple-100">
              <HeartIcon class="h-5 w-5 text-purple-600" />
              <h2 class="font-semibold text-purple-900">Conditions</h2>
            </div>
            <div class="p-4">
              <div v-if="ehrStore.conditions.length === 0" class="text-gray-500 text-sm">
                No conditions documented
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="condition in ehrStore.conditions"
                  :key="condition.id || condition.name"
                  class="flex items-start gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                  <span class="text-gray-900">{{ condition.name }}</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <!-- Vital Signs -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 bg-teal-50 border-b border-teal-100">
            <HeartIcon class="h-5 w-5 text-teal-600" />
            <h2 class="font-semibold text-teal-900">Vital Signs</h2>
          </div>
          <div class="p-4">
            <div v-if="ehrStore.vitals.length === 0" class="text-gray-500 text-sm">
              No vital signs recorded
            </div>
            <div v-else class="grid md:grid-cols-2 gap-3">
              <div
                v-for="vital in ehrStore.vitals"
                :key="vital.id || vital.name"
                class="p-3 bg-teal-50/50 rounded-lg border border-teal-100"
              >
                <div class="text-sm text-teal-700">{{ vital.name }}</div>
                <div class="text-lg font-bold text-gray-900">
                  {{ vital.value }} <span class="text-sm font-normal text-gray-500">{{ vital.unit }}</span>
                </div>
                <div v-if="vital.date" class="text-xs text-gray-400 mt-1">
                  {{ formatDate(vital.date) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Medications -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div class="flex items-center gap-2">
              <BeakerIcon class="h-5 w-5 text-blue-600" />
              <h2 class="font-semibold text-blue-900">Medications</h2>
            </div>
            <button
              @click="ehrStore.openAddMedicationModal"
              class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            >
              <PlusIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="p-4">
            <div v-if="ehrStore.medications.length === 0" class="text-gray-500 text-sm">
              No active medications
            </div>
            <div v-else class="grid md:grid-cols-2 gap-3">
              <div
                v-for="med in ehrStore.medications"
                :key="med.id || med.name"
                class="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <span class="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                <div>
                  <span class="font-medium text-gray-900">{{ med.name }}</span>
                  <p v-if="med.dosage" class="text-sm text-gray-500">
                    {{ med.dosage }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Labs -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 bg-green-50 border-b border-green-100">
            <BeakerIcon class="h-5 w-5 text-green-600" />
            <h2 class="font-semibold text-green-900">Recent Labs</h2>
          </div>
          <div class="p-4">
            <div v-if="ehrStore.labs.length === 0" class="text-gray-500 text-sm">
              No recent lab results
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-500 border-b">
                    <th class="pb-2 font-medium">Test</th>
                    <th class="pb-2 font-medium">Result</th>
                    <th class="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="lab in ehrStore.labs"
                    :key="lab.id || lab.name"
                    class="border-b border-gray-100 last:border-0"
                  >
                    <td class="py-2 text-gray-900">{{ lab.name }}</td>
                    <td class="py-2 font-medium">{{ lab.value }}</td>
                    <td class="py-2 text-gray-500">{{ formatDate(lab.date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Screenings -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 bg-rose-50 border-b border-rose-100">
            <ClipboardDocumentCheckIcon class="h-5 w-5 text-rose-600" />
            <h2 class="font-semibold text-rose-900">Screenings</h2>
          </div>
          <div class="p-4">
            <div v-if="ehrStore.screenings.length === 0" class="text-gray-500 text-sm">
              No screening assessments
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-500 border-b">
                    <th class="pb-2 font-medium">Assessment</th>
                    <th class="pb-2 font-medium">Score</th>
                    <th class="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="screening in ehrStore.screenings"
                    :key="screening.id || screening.name"
                    class="border-b border-gray-100 last:border-0"
                  >
                    <td class="py-2 text-gray-900">{{ screening.name }}</td>
                    <td class="py-2 font-medium">{{ screening.score }}</td>
                    <td class="py-2 text-gray-500">{{ formatDate(screening.date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Visit Documentation -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <DocumentMagnifyingGlassIcon class="h-5 w-5 text-indigo-600" />
            <h2 class="font-semibold text-indigo-900">Visit Documentation</h2>
          </div>
          <div class="p-4">
            <div v-if="ehrStore.visitNotes.length === 0" class="text-gray-500 text-sm">
              No visit documentation
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="(note, index) in ehrStore.visitNotes"
                :key="note.id || `visit-${index}`"
                class="border border-gray-100 rounded-lg overflow-hidden"
              >
                <button
                  @click="toggleNote(note.id || `visit-${index}`)"
                  class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 text-xs font-medium rounded-full"
                      :class="{
                        'bg-indigo-100 text-indigo-700': note.note_type === 'HPI',
                        'bg-violet-100 text-violet-700': note.note_type === 'Review of Systems',
                        'bg-fuchsia-100 text-fuchsia-700': note.note_type === 'Physical Exam',
                      }"
                    >
                      {{ note.note_type }}
                    </span>
                    <span class="text-sm text-gray-500">{{ formatDate(note.date) }}</span>
                    <span v-if="note.author" class="text-sm text-gray-400">— {{ note.author }}</span>
                  </div>
                  <svg
                    class="h-4 w-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': expandedNotes.has(note.id || `visit-${index}`) }"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  v-if="expandedNotes.has(note.id || `visit-${index}`)"
                  class="px-3 pb-3"
                >
                  <div class="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto bg-gray-50 rounded p-3">
                    {{ note.content }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- Clinical Notes -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
            <div class="flex items-center gap-2">
              <DocumentTextIcon class="h-5 w-5 text-amber-600" />
              <h2 class="font-semibold text-amber-900">Clinical Notes</h2>
            </div>
            <button
              @click="ehrStore.openAddNoteModal"
              class="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
            >
              <PlusIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="p-4">
            <div v-if="ehrStore.notes.length === 0" class="text-gray-500 text-sm">
              No clinical notes
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="(note, index) in ehrStore.notes"
                :key="note.id || `note-${index}`"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                  <span class="font-medium text-gray-900">{{ note.note_type }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ formatDate(note.date) }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <!-- Modals -->
    <AddAllergyModal
      v-if="ehrStore.showAddAllergyModal"
      :patient-id="patientId"
      @close="ehrStore.closeAddAllergyModal"
      @added="handleAllergyAdded"
    />

    <AddMedicationModal
      v-if="ehrStore.showAddMedicationModal"
      :patient-id="patientId"
      @close="ehrStore.closeAddMedicationModal"
      @added="handleMedicationAdded"
    />

    <AddNoteModal
      v-if="ehrStore.showAddNoteModal"
      :patient-id="patientId"
      @close="ehrStore.closeAddNoteModal"
      @added="handleNoteAdded"
    />
  </div>
</template>
