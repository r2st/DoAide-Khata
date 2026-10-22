export const ONBOARDED_KEY = 'khata:onboarded'
export const BACKUP_KEY = 'khata:lastBackup'

// localStorage can throw (private mode, quota, blocked storage); never let that break the app.

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function downloadBackup(state) {
  const blob = new Blob([JSON.stringify({ app: 'doaide-khata', version: 1, ...state }, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `khata-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
  writeJSON(BACKUP_KEY, Date.now())
}
