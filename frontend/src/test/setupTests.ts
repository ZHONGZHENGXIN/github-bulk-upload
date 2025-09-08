import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// matchMedia mock for components that use it
if (!window.matchMedia) {
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

// ResizeObserver mock (often used by UI libs)
if (!('ResizeObserver' in window)) {
  // @ts-ignore
  class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  // @ts-ignore
  window.ResizeObserver = ResizeObserver
}

// Ensure navigator.onLine exists and is boolean
try {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => true,
  })
} catch {}

