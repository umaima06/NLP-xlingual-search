async function request(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(typeof body.detail === 'string' ? body.detail : 'Please check your input and try again.')
  }
  return res.json()
}
const post = (url, data) =>
  request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

export const search = (query, top_k = 5, strict = true) => post('/api/search', { query, top_k, strict })
export const compare = (text_a, text_b) => post('/api/compare', { text_a, text_b })
export const getInfo = () => request('/api/info')