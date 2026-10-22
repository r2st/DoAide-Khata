import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Node 25+ ships its own (file-backed, often undefined) localStorage global that
// shadows jsdom's, so give tests a plain in-memory Storage.
class MemoryStorage {
  #data = new Map()
  get length() {
    return this.#data.size
  }
  key(i) {
    return [...this.#data.keys()][i] ?? null
  }
  getItem(k) {
    return this.#data.has(k) ? this.#data.get(k) : null
  }
  setItem(k, v) {
    this.#data.set(k, String(v))
  }
  removeItem(k) {
    this.#data.delete(k)
  }
  clear() {
    this.#data.clear()
  }
}

if (typeof globalThis.localStorage?.clear !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
