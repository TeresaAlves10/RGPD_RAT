import { describe, expect, it } from 'vitest'
import { gerarDocDefinition, gerarPdfBuffer } from '@/io/pdf/exportar'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoSubcontratadoCompleto,
} from '@/domain/fixtures/registos'
import { criarFicheiroVazio } from '@/features/preenchimento/store/ficheiro-context'
import { textos } from '@/i18n/pt'

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

  it('inclui a matriz de levantamento do responsável', () => {
    const texto = JSON.stringify(gerarDocDefinition(ficheiroRatFixtureValido))
    const matriz = registoResponsavelCompleto.matriz
    expect(matriz?.caracterizacao?.operacoesTratamento).toBeTruthy()
    expect(texto).toContain(matriz?.caracterizacao?.operacoesTratamento)
    expect(texto).toContain(matriz?.normativosAplicaveis)
    expect(texto).toContain(textos.matriz.campos.suportesFisicos)
  })

  it('inclui os campos opcionais do subcontratante quando preenchidos', () => {
    const texto = JSON.stringify(gerarDocDefinition(ficheiroRatFixtureValido))
    expect(texto).toContain(registoSubcontratadoCompleto.responsaveis[0].nome)
    // A ausência destes campos não invalida o registo, mas quando existem
    // têm de sair no PDF que a equipa envia ao DPO.
    expect(texto).toContain(textos.campos.aipdRealizada)
  })
})
