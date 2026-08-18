import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Garantia da regra 1 do CLAUDE.md: "zero rede em runtime".
 *
 * Este teste não constrói a aplicação — corre depois de `npm run build`
 * (ver script `test:zero-rede` e o workflow de CI) e falha se o bundle
 * de produção em `dist/` contiver qualquer referência a APIs de rede do
 * browser ou a domínios de CDN conhecidos.
 */

const DIST_DIR = join(import.meta.dirname, '..', '..', 'dist')

const PADROES_PROIBIDOS: RegExp[] = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /\bsendBeacon\b/,
  /\bnavigator\s*\.\s*sendBeacon\b/,
]

const DOMINIOS_CDN_PROIBIDOS: string[] = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'jsdelivr.net',
  'cdnjs.cloudflare.com',
  'esm.sh',
  'skypack.dev',
  'jspm.dev',
  'jspm.io',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.tailwindcss.com',
  'googleapis.com',
  'gstatic.com',
]

function listarFicheiros(dir: string): string[] {
  const entradas = readdirSync(dir)
  const ficheiros: string[] = []
  for (const entrada of entradas) {
    const caminho = join(dir, entrada)
    if (statSync(caminho).isDirectory()) {
      ficheiros.push(...listarFicheiros(caminho))
    } else if (/\.(js|mjs|cjs|html|css)$/.test(entrada)) {
      ficheiros.push(caminho)
    }
  }
  return ficheiros
}

describe('zero rede em runtime (bundle de produção)', () => {
  let ficheiros: string[]

  try {
    ficheiros = listarFicheiros(DIST_DIR)
  } catch {
    ficheiros = []
  }

  it('encontrou o build de produção em dist/', () => {
    expect(
      ficheiros.length,
      'dist/ está vazio ou não existe — corre `npm run build` antes deste teste (ver script `test:zero-rede`)',
    ).toBeGreaterThan(0)
  })

  it.each(PADROES_PROIBIDOS.map((padrao) => [padrao.toString(), padrao] as const))(
    'não contém a API de rede %s',
    (_nome, padrao) => {
      for (const ficheiro of ficheiros) {
        const conteudo = readFileSync(ficheiro, 'utf-8')
        expect(
          padrao.test(conteudo),
          `${ficheiro} contém uma referência proibida a ${padrao}`,
        ).toBe(false)
      }
    },
  )

  it.each(DOMINIOS_CDN_PROIBIDOS)('não referencia o domínio de CDN %s', (dominio) => {
    for (const ficheiro of ficheiros) {
      const conteudo = readFileSync(ficheiro, 'utf-8')
      expect(
        conteudo.includes(dominio),
        `${ficheiro} referencia o domínio de CDN proibido "${dominio}"`,
      ).toBe(false)
    }
  })
})
