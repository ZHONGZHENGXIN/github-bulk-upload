import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOffline } from '../useOffline'

describe('useOffline (smoke)', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    localStorage.clear()
  })

  it('exposes basic offline state and actions', async () => {
    const { result } = renderHook(() => useOffline())

    expect(result.current.isOnline).toBeTypeOf('boolean')
    expect(result.current.pendingCount).toBeTypeOf('number')
    expect(result.current.cacheCount).toBeTypeOf('number')
    expect(result.current.syncInProgress).toBeTypeOf('boolean')

    expect(typeof result.current.syncData).toBe('function')
    expect(typeof result.current.updateStats).toBe('function')
    expect(typeof result.current.cacheData).toBe('function')
    expect(typeof result.current.getCachedData).toBe('function')
    expect(typeof result.current.cleanExpiredCache).toBe('function')
    expect(typeof result.current.storeOfflineData).toBe('function')

    await act(async () => {
      await result.current.updateStats()
    })

    expect(result.current.pendingCount).toBeGreaterThanOrEqual(0)
    expect(result.current.cacheCount).toBeGreaterThanOrEqual(0)
  })

  it('caches and retrieves data via offlineService wrappers', async () => {
    const { result } = renderHook(() => useOffline())

    await act(async () => {
      await result.current.cacheData('test-key', { foo: 'bar' }, 1)
    })

    const cached = await result.current.getCachedData('test-key')
    expect(cached).not.toBeNull()
  })
})

