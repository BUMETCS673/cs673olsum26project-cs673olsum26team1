import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['../../testing/clienttest/**/*.test.{js,jsx,ts,tsx}'],
    setupFiles: '../../testing/clienttest/setup.js',
  },
})