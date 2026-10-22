const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export function formatINR(value) {
  const n = Number(value) || 0
  return `${n < 0 ? '-' : ''}₹${inr.format(Math.abs(n))}`
}

export function todayISO(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(iso, lang = 'en') {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function daysBetween(fromISO, toISO) {
  const [a, b] = [fromISO, toISO].map((s) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  })
  return Math.round((b - a) / 86400000)
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase()
}
