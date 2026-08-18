import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/test/zero-rede.test.ts'],
    globals: true,
  },
})
