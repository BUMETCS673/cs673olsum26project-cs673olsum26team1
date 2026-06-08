import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..', '../../testing']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,

    // keep your external tests
    include: ['../../testing/clienttest/**/*.test.{js,jsx,ts,tsx}'],

    // IMPORTANT: must be array
    setupFiles: [path.resolve(__dirname, '../../testing/clienttest/setup.js')],

    // IMPORTANT: fixes external dependency resolution
    deps: {
      inline: ['@testing-library/jest-dom']
    }
  }
})