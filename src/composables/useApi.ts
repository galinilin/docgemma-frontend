/**
 * REST API client composable
 */
import { ref } from 'vue'
import type {
  SessionResponse,
  SessionListResponse,
  ToolListResponse,
  HealthResponse,
  CreateSessionRequest,
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

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export function useApi() {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  // Health check
  async function checkHealth(): Promise<HealthResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<HealthResponse>('/health')
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  // Sessions
  async function createSession(
    request?: CreateSessionRequest
  ): Promise<SessionResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<SessionResponse>('/sessions', {
        method: 'POST',
        body: request ? JSON.stringify(request) : undefined,
      })
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  async function listSessions(): Promise<SessionListResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<SessionListResponse>('/sessions')
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getSession(sessionId: string): Promise<SessionResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<SessionResponse>(`/sessions/${sessionId}`)
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteSession(sessionId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await fetchJson<void>(`/sessions/${sessionId}`, {
        method: 'DELETE',
      })
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  // Tools
  async function listTools(): Promise<ToolListResponse> {
    loading.value = true
    error.value = null
    try {
      return await fetchJson<ToolListResponse>('/tools')
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
    checkHealth,
    createSession,
    listSessions,
    getSession,
    deleteSession,
    listTools,
  }
}
