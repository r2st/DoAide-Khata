const BASE = import.meta.env.VITE_API_BASE || ''

export const TIMEOUT_MS = 20_000

// Every failure becomes an Error with a status: HTTP errors keep theirs, timeouts are 408
// and a dropped connection is 0, so callers can tell "offline" apart from "server said no".
async function request(path, { method = 'GET', body, token, raw = false, timeout = TIMEOUT_MS } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let resp
  try {
    resp = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (e) {
    const timedOut = e?.name === 'AbortError'
    const err = new Error(timedOut ? 'Request timed out' : 'Network error — check your internet connection')
    err.status = timedOut ? 408 : 0
    throw err
  } finally {
    clearTimeout(timer)
  }
  if (!resp.ok) {
    const detail = await resp.json().then((d) => d.detail, () => null)
    const err = new Error(typeof detail === 'string' ? detail : `Request failed (${resp.status})`)
    err.status = resp.status
    throw err
  }
  return raw ? resp.blob() : resp.json()
}

export const isOfflineError = (e) => e?.status === 0 || e?.status === 408

export const api = {
  config: () => request('/api/config'),
  googleLogin: (credential) => request('/api/auth/google', { method: 'POST', body: { credential } }),
  sync: (token, doc) => request('/api/sync', { method: 'POST', body: doc, token }),
  parse: (text, customers) => request('/api/ai/parse', { method: 'POST', body: { text, customers }, timeout: 12_000 }),
  billPdf: (bill) => request('/api/pdf/bill', { method: 'POST', body: bill, raw: true }),
  ledgerPdf: (data) => request('/api/pdf/ledger', { method: 'POST', body: data, raw: true }),
  summaryPdf: (data) => request('/api/pdf/summary', { method: 'POST', body: data, raw: true }),
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
