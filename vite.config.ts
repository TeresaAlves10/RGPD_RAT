import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Injeta a CSP restritiva (CLAUDE.md §2.1, "zero rede em runtime") apenas
 * no build de produção. Em `npm run dev` o servidor do Vite precisa de
 * WebSocket (HMR) e de scripts inline, que esta CSP bloquearia.
 *
 * - connect-src 'none' bloqueia fetch/XHR/WebSocket/EventSource/sendBeacon.
 * - script-src 'self' proíbe scripts de terceiros/CDN.
 * - style-src mantém 'unsafe-inline' porque componentes Radix/shadcn-ui
 *   aplicam estilos inline via JS (posicionamento de popovers, portais).
 * - default-src 'none' nega tudo o que não seja explicitamente permitido.
 */
function cspRestritivaPlugin(): Plugin {
  const csp = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
  ].join('; ')

  return {
    name: 'csp-restritiva',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          '</head>',
          `    <meta http-equiv="Content-Security-Policy" content="${csp};" />\n  </head>`,
        )
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), cspRestritivaPlugin()],
  build: {
    // O polyfill de modulepreload do Vite usa fetch() internamente,
    // o que viola a regra de "zero rede em runtime" (CLAUDE.md §2.1).
    modulePreload: { polyfill: false },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
