/**
 * EHR/Patient state management
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PatientSummary,
  PatientChart,
  AllergyInfo,
  MedicationInfo,
  ImagingStudyInfo,
} from '@/types'

export const useEhrStore = defineStore('ehr', () => {
  // State
  const patients = ref<PatientSummary[]>([])
  const selectedPatientId = ref<string | null>(null)
  const currentChart = ref<PatientChart | null>(null)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Modal states
  const showAddAllergyModal = ref(false)
  const showAddMedicationModal = ref(false)
  const showAddNoteModal = ref(false)
  const showCreatePatientModal = ref(false)
  const showUploadImagingModal = ref(false)
  const showImagingViewer = ref(false)
  const selectedImagingStudy = ref<ImagingStudyInfo | null>(null)

  // Computed
  const selectedPatient = computed(() =>
    patients.value.find((p) => p.patient_id === selectedPatientId.value)
  )

  const hasPatients = computed(() => patients.value.length > 0)

  const allergies = computed(() => currentChart.value?.allergies ?? [])
  const medications = computed(() => currentChart.value?.medications ?? [])
  const conditions = computed(() => currentChart.value?.conditions ?? [])
  const labs = computed(() => currentChart.value?.labs ?? [])
  const notes = computed(() => currentChart.value?.notes ?? [])
  const vitals = computed(() => currentChart.value?.vitals ?? [])
  const screenings = computed(() => currentChart.value?.screenings ?? [])
  const visitNotes = computed(() => currentChart.value?.visit_notes ?? [])
  const imagingStudies = computed(() => currentChart.value?.imaging_studies ?? [])

  // Actions
  function setPatients(list: PatientSummary[]) {
    patients.value = list
  }

  function setSelectedPatient(patientId: string | null) {
    selectedPatientId.value = patientId
    if (!patientId) {
      currentChart.value = null
    }
  }

  function setChart(chart: PatientChart | null) {
    currentChart.value = chart
  }

  function addAllergyToChart(allergy: AllergyInfo) {
    if (currentChart.value) {
      currentChart.value.allergies = [
        allergy,
        ...currentChart.value.allergies,
      ]
    }
  }

  function addMedicationToChart(medication: MedicationInfo) {
    if (currentChart.value) {
      currentChart.value.medications = [
        medication,
        ...currentChart.value.medications,
      ]
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  function clearError() {
    error.value = null
  }

  // Modal actions
  function openAddAllergyModal() {
    showAddAllergyModal.value = true
  }

  function closeAddAllergyModal() {
    showAddAllergyModal.value = false
  }

  function openAddMedicationModal() {
    showAddMedicationModal.value = true
  }

  function closeAddMedicationModal() {
    showAddMedicationModal.value = false
  }

  function openAddNoteModal() {
    showAddNoteModal.value = true
  }

  function closeAddNoteModal() {
    showAddNoteModal.value = false
  }

  function openCreatePatientModal() {
    showCreatePatientModal.value = true
  }

  function closeCreatePatientModal() {
    showCreatePatientModal.value = false
  }

  function openUploadImagingModal() {
    showUploadImagingModal.value = true
  }

  function closeUploadImagingModal() {
    showUploadImagingModal.value = false
  }

  function openImagingViewer(study: ImagingStudyInfo) {
    selectedImagingStudy.value = study
    showImagingViewer.value = true
  }

  function closeImagingViewer() {
    showImagingViewer.value = false
    selectedImagingStudy.value = null
  }

  function reset() {
    patients.value = []
    selectedPatientId.value = null
    currentChart.value = null
    searchQuery.value = ''
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    patients,
    selectedPatientId,
    currentChart,
    searchQuery,
    isLoading,
    error,

    // Modal states
    showAddAllergyModal,
    showAddMedicationModal,
    showAddNoteModal,
    showCreatePatientModal,
    showUploadImagingModal,
    showImagingViewer,
    selectedImagingStudy,

    // Computed
    selectedPatient,
    hasPatients,
    allergies,
    medications,
    conditions,
    labs,
    notes,
    vitals,
    screenings,
    visitNotes,
    imagingStudies,

    // Actions
    setPatients,
    setSelectedPatient,
    setChart,
    addAllergyToChart,
    addMedicationToChart,
    setSearchQuery,
    setLoading,
    setError,
    clearError,

    // Modal actions
    openAddAllergyModal,
    closeAddAllergyModal,
    openAddMedicationModal,
    closeAddMedicationModal,
    openAddNoteModal,
    closeAddNoteModal,
    openCreatePatientModal,
    closeCreatePatientModal,
    openUploadImagingModal,
    closeUploadImagingModal,
    openImagingViewer,
    closeImagingViewer,

    reset,
  }
})
