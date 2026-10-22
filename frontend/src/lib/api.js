const BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, { method = 'GET', body, token, raw = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const resp = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  if (!resp.ok) {
    const detail = await resp.json().then((d) => d.detail, () => null)
    const err = new Error(typeof detail === 'string' ? detail : `Request failed (${resp.status})`)
    err.status = resp.status
    throw err
  }
  return raw ? resp.blob() : resp.json()
}

export const api = {
  config: () => request('/api/config'),
  googleLogin: (credential) => request('/api/auth/google', { method: 'POST', body: { credential } }),
  sync: (token, doc) => request('/api/sync', { method: 'POST', body: doc, token }),
  parse: (text, customers) => request('/api/ai/parse', { method: 'POST', body: { text, customers } }),
  billPdf: (bill) => request('/api/pdf/bill', { method: 'POST', body: bill, raw: true }),
  ledgerPdf: (data) => request('/api/pdf/ledger', { method: 'POST', body: data, raw: true }),
}

// On phones, hand the PDF to the share sheet (WhatsApp etc.); otherwise download it.
export async function deliverPdf(blob, filename, { share = false } = {}) {
  const file = new File([blob], filename, { type: 'application/pdf' })
  if (share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'downloaded'
}
