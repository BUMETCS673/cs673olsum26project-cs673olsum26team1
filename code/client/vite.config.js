import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['../..']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['../../testing/clienttest/**/*.test.{js,jsx,ts,tsx}'],
    setupFiles: path.resolve(__dirname, '../../testing/clienttest/setup.js'),
  },
})