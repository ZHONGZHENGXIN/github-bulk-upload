import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    globals: true,
    css: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
}))

