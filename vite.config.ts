import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      sitemap: {
        enabled: true,
        host: 'https://nutriflow-main.vercel.app',
      },
      pages: [{ path: '/' }],
    }),
    nitro(),
    viteReact(),
  ],
})

export default config
