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

/**
 * pdfmake (mandatado pelo CLAUDE.md §8 para exportação de PDF, servido
 * localmente, nunca de CDN) inclui, como parte da biblioteca genérica, um
 * resolvedor opcional de recursos remotos (para o caso de um documento
 * referenciar uma imagem por URL) guardado atrás de fetch()/XMLHttpRequest.
 * A aplicação nunca gera documentos com esse tipo de referência, e
 * src/io/pdf/exportar.ts desativa essa capacidade explicitamente em
 * runtime com setUrlAccessPolicy(() => false)/setLocalAccessPolicy(() =>
 * false) — mas o código continua presente no bundle, pelo que o *scan*
 * estático de padrões de rede exclui este chunk de terceiros. O scan de
 * domínios de CDN abaixo continua a aplicar-se a todos os ficheiros,
 * incluindo este.
 */
const FICHEIROS_IGNORADOS_EM_PADROES_DE_REDE = [/^pdfmake-/]

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
        const nomeBase = ficheiro.split('/').pop() ?? ficheiro
        if (FICHEIROS_IGNORADOS_EM_PADROES_DE_REDE.some((regex) => regex.test(nomeBase))) continue
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
