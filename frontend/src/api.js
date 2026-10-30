
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

async function request(url, options) {
  const res = await fetch(`${API_BASE}${url}`, options)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      typeof body.detail === 'string'
        ? body.detail
        : 'Please check your input and try again.'
    )
  }

  return res.json()
}

const post = (url, data) =>
  request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const search = (query, top_k = 5) =>
  post('/api/search', { query, top_k })

export const compare = (text_a, text_b) =>
  post('/api/compare', { text_a, text_b })

export const getClusters = () => request('/api/clusters')

export const getInfo = () => request('/api/info')
