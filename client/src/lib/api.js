const API_BASE = import.meta.env.VITE_API_URL || ''

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
    const response = await fetch('/api/progress', {
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  async updateProgress(token, payload) {
    const response = await fetch('/api/progress/update', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  // AI Explainer
  async explain(payload) {
    const response = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  // Algorithms
  async getAlgorithms() {
    const response = await fetch('/api/algorithms')
    return asJson(response)
  },
}
