import { describe, expect, it } from 'vitest'
import { gerarPdfBuffer } from '@/io/pdf/exportar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'
import { criarFicheiroVazio } from '@/features/preenchimento/store/ficheiro-context'

function ehPdfValido(buffer: Uint8Array): boolean {
  const cabecalho = new TextDecoder().decode(buffer.slice(0, 5))
  return cabecalho === '%PDF-'
}

describe('exportação PDF', () => {
  it(
    'gera um PDF válido com registos',
    async () => {
      const buffer = await gerarPdfBuffer(ficheiroRatFixtureValido)
      expect(buffer.length).toBeGreaterThan(0)
      expect(ehPdfValido(buffer)).toBe(true)
    },
    20000,
  )

  it(
    'gera um PDF válido mesmo sem registos (não bloqueia por erros de validação)',
    async () => {
      const buffer = await gerarPdfBuffer(criarFicheiroVazio())
      expect(ehPdfValido(buffer)).toBe(true)
    },
    20000,
  )
})
