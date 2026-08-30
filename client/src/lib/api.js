const rawUrl = (import.meta.env.VITE_API_URL || '').trim()
const API_BASE = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl

const asJson = async (response) => {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export const api = {
  // Authentication
  async register(payload) {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  async login(payload) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  async me(token) {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  // Progress Tracking
  async getProgress(token) {
    const response = await fetch(`${API_BASE}/api/progress`, {
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  async updateProgress(token, payload) {
    const response = await fetch(`${API_BASE}/api/progress/update`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  // AI Explainer
  async explain(payload) {
    const response = await fetch(`${API_BASE}/api/ai/explain`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  // Algorithms
  async getAlgorithms() {
    const response = await fetch(`${API_BASE}/api/algorithms`)
    return asJson(response)
  },
}
