import { cp, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'

// Keep the existing Workers output unchanged until the Pages address is live.
await rm('pages-dist', { recursive: true, force: true })
await cp('dist', 'pages-dist', { recursive: true })
await build({
  configFile: false,
  publicDir: false,
  build: {
    outDir: 'pages-dist',
    emptyOutDir: false,
    target: 'es2022',
    lib: { entry: 'worker.js', formats: ['es'], fileName: () => '_worker.js' },
  },
})
await writeFile('pages-dist/_routes.json', JSON.stringify({
  version: 1,
  include: ['/*'],
  exclude: ['/assets/*', '/photos/*', '/favicon.svg', '/og-image.svg', '/icons.svg'],
}, null, 2) + '\n')
