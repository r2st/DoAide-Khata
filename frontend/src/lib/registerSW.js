// Registered only in production builds; dev and tests never get a service worker.
export function registerSW(nav = globalThis.navigator) {
  if (!import.meta.env.PROD || !nav?.serviceWorker) return false
  window.addEventListener('load', () => {
    nav.serviceWorker.register('/sw.js').catch(() => {})
  })
  return true
}
