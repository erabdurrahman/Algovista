const asJson = async (response) => {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: 'JWT ' + token } : {}),
})

export const api = {
  async register(payload) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  async login(payload) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  async me(token) {
    const response = await fetch('/api/auth/me', {
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  async listTopics() {
    const response = await fetch('/api/learn/topics')
    return asJson(response)
  },

  async getProgress(token) {
    const response = await fetch('/api/learn/progress', {
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  async markTopicComplete(token, topicId) {
    const response = await fetch(`/api/learn/progress/${topicId}/complete`, {
      method: 'POST',
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  async listSubmissions(token) {
    const response = await fetch('/api/learn/submissions', {
      headers: authHeaders(token),
    })
    return asJson(response)
  },

  async addSubmission(token, payload) {
    const response = await fetch('/api/learn/submissions', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    return asJson(response)
  },

  async explainCode(token, code) {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ code }),
    })
    return asJson(response)
  },
}
