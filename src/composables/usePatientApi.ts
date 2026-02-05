/**
 * Patient/EHR REST API client composable
 */
import { ref } from 'vue'
import type {
  PatientListResponse,
  PatientChart,
  PatientSummary,
  AllergyResponse,
  MedicationResponse,
  NoteResponse,
  AddAllergyRequest,
  PrescribeMedicationRequest,
  SaveNoteRequest,
  CreatePatientRequest,
} from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface ApiError {
  status: number
  message: string
  detail?: string
}

async function fetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let detail: string | undefined
    try {
      const errorData = await response.json()
      detail = errorData.detail
    } catch {
      // Ignore JSON parse errors
    }
    const error: ApiError = {
      status: response.status,
      message: response.statusText,
      detail,
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export function usePatientApi() {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  /**
   * Search patients by name and/or DOB
   */
  async function searchPatients(
    name?: string,
    dob?: string
  ): Promise<PatientListResponse> {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (name) params.append('name', name)
      if (dob) params.append('dob', dob)
      const query = params.toString() ? `?${params.toString()}` : ''
      return await fetchJson<PatientListResponse>(`/patients${query}`)
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * List all patients (recent)
   */
  async function listPatients(): Promise<PatientListResponse> {
    return searchPatients()
  }

  /**
   * Get a patient's full chart
   */
  async function getPatientChart(patientId: string): Promise<PatientChart> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<PatientChart>(`/patients/${patientId}`)
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new patient
   */
  async function createPatient(
    request: CreatePatientRequest
  ): Promise<PatientSummary> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<PatientSummary>('/patients', {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Add an allergy to patient's chart
   */
  async function addAllergy(
    patientId: string,
    request: AddAllergyRequest
  ): Promise<AllergyResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<AllergyResponse>(
        `/patients/${patientId}/allergies`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Prescribe medication for patient
   */
  async function prescribeMedication(
    patientId: string,
    request: PrescribeMedicationRequest
  ): Promise<MedicationResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<MedicationResponse>(
        `/patients/${patientId}/medications`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Save clinical note to patient's chart
   */
  async function saveNote(
    patientId: string,
    request: SaveNoteRequest
  ): Promise<NoteResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<NoteResponse>(`/patients/${patientId}/notes`, {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    searchPatients,
    listPatients,
    getPatientChart,
    createPatient,
    addAllergy,
    prescribeMedication,
    saveNote,
  }
}
