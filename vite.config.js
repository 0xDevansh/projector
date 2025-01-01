import { join } from 'node:path'
import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'

export default {
  root: join(import.meta.dirname, 'src/client'),
  base: '/app',
  plugins: [
    viteReact({ jsxRuntime: 'automatic' }),
    viteFastifyReact(),
  ],
  build: {
    emptyOutDir: true,
    outDir: join(import.meta.dirname, 'dist/client'),
  },
}
