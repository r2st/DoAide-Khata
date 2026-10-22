// Offline support for DoAide Khata. The khata itself lives in localStorage, so once the
// app shell is cached a shopkeeper can keep recording udhar with no signal.
// - Pages: network first, falling back to the cached app shell.
// - /assets/* (content-hashed): cache first.
// - /api/* and other origins: never touched.
const VERSION = 'khata-v1'
const SHELL = '/'
const MAX_ASSETS = 80

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll([SHELL, '/favicon.svg', '/manifest.webmanifest']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function trim(cache) {
  const keys = await cache.keys()
  const assets = keys.filter((r) => new URL(r.url).pathname.startsWith('/assets/'))
  await Promise.all(assets.slice(0, Math.max(0, assets.length - MAX_ASSETS)).map((r) => cache.delete(r)))
}

async function networkFirstPage(request) {
  const cache = await caches.open(VERSION)
  try {
    const response = await fetch(request)
    // Keep the freshest SPA shell; guide pages are cached under their own URL.
    if (response.ok) {
      const url = new URL(request.url)
      const key = url.pathname.startsWith('/guides') ? url.pathname : SHELL
      cache.put(key, response.clone())
    }
    return response
  } catch {
    const url = new URL(request.url)
    return (url.pathname.startsWith('/guides') && (await cache.match(url.pathname))) || (await cache.match(SHELL)) || Response.error()
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok) {
    await cache.put(request, response.clone())
    trim(cache)
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') return

  if (request.mode === 'navigate') event.respondWith(networkFirstPage(request))
  else if (url.pathname.startsWith('/assets/')) event.respondWith(cacheFirst(request))
  else if (['/favicon.svg', '/manifest.webmanifest', '/og-image.png'].includes(url.pathname)) event.respondWith(cacheFirst(request))
})
