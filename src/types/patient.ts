/**
 * Patient/EHR type definitions
 * Mirrors backend Pydantic models
 */

export interface PatientSummary {
  patient_id: string
  name: string
  dob: string
  gender: string | null
}

export interface PatientListResponse {
  patients: PatientSummary[]
  total: number
  error: string | null
}

export interface AllergyInfo {
  id: string | null
  substance: string
  reaction: string | null
  severity: string | null
  status: string
}

export interface MedicationInfo {
  id: string | null
  name: string
  dosage: string | null
  frequency: string | null
  status: string
}

export interface ConditionInfo {
  id: string | null
  name: string
  status: string
}

export interface LabResult {
  id: string | null
  name: string
  value: string
  date: string | null
  status: string | null
}

export interface ClinicalNote {
  id: string | null
  note_type: string
  date: string | null
  preview: string | null
}

export interface VitalSign {
  id: string | null
  name: string
  value: number
  unit: string
  date: string | null
}

export interface ScreeningResult {
  id: string | null
  name: string
  score: string
  date: string | null
}

export interface VisitNote {
  id: string | null
  note_type: string
  date: string | null
  author: string | null
  content: string
}

export interface ImagingStudyInfo {
  id: string | null
  modality: string | null
  modality_display: string | null
  body_site: string | null
  study_date: string | null
  description: string | null
  content_type: string
  image_url: string
}

export interface ImagingResponse {
  success: boolean
  media_id: string | null
  message: string
  error: string | null
}

export interface PatientChart {
  patient_id: string
  name: string
  dob: string
  gender: string | null
  conditions: ConditionInfo[]
  medications: MedicationInfo[]
  allergies: AllergyInfo[]
  labs: LabResult[]
  notes: ClinicalNote[]
  vitals: VitalSign[]
  screenings: ScreeningResult[]
  visit_notes: VisitNote[]
  imaging_studies: ImagingStudyInfo[]
  error: string | null
}

export interface AllergyResponse {
  success: boolean
  allergy_id: string | null
  message: string
  error: string | null
}

export interface MedicationResponse {
  success: boolean
  order_id: string | null
  message: string
  error: string | null
}

export interface NoteResponse {
  success: boolean
  note_id: string | null
  message: string
  error: string | null
}

// Request types
export interface AddAllergyRequest {
  substance: string
  reaction: string
  severity: string
}

export interface PrescribeMedicationRequest {
  medication_name: string
  dosage: string
  frequency: string
}

export interface SaveNoteRequest {
  note_text: string
  note_type: string
}

export interface CreatePatientRequest {
  given_name: string
  family_name: string
  birth_date: string
  gender: string
}
