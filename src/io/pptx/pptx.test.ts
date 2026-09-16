import { describe, expect, it } from 'vitest'
import {
  agruparPorDirecao,
  agruparPorUnidade,
  calcularTotaisRat,
  gerarPptxBlob,
} from '@/io/pptx/exportar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'
import { rotuloUnidade } from '@/config/organizacao'
import { textos } from '@/i18n/pt'

const registos = ficheiroRatFixtureValido.registos

describe('calcularTotaisRat', () => {
  it('conta os seis totais do painel — responsável, subcontratante, em validação, validados, com AIPD', () => {
    expect(calcularTotaisRat(registos)).toEqual({
      total: 4,
      responsavel: 2,
      subcontratante: 2,
      emValidacao: 1,
      validados: 1,
      comAipd: 1,
    })
  })

  it('devolve zeros para uma lista vazia (não bloqueia por falta de dados)', () => {
    expect(calcularTotaisRat([])).toEqual({
      total: 0,
      responsavel: 0,
      subcontratante: 0,
      emValidacao: 0,
      validados: 0,
      comAipd: 0,
    })
  })
})

describe('agrupamentos', () => {
  it('agrupa todos os registos da fixture na mesma Direção', () => {
    const grupos = agruparPorDirecao(registos)
    expect(grupos).toHaveLength(1)
    expect(grupos[0].totais.total).toBe(4)
  })

  it('agrupa por Unidade de Coordenação, incluindo os registos sem unidade', () => {
    const grupos = agruparPorUnidade(registos)
    const chaves = grupos.map((g) => g.chave).sort()
    expect(chaves).toEqual(
      [rotuloUnidade('uid'), rotuloUnidade('urn'), textos.relatorioResumo.semUnidade].sort(),
    )
    const semUnidade = grupos.find((g) => g.chave === textos.relatorioResumo.semUnidade)
    expect(semUnidade?.totais.total).toBe(2)
  })
})

describe('exportação PowerPoint', () => {
  it(
    'gera um .pptx válido (ficheiro zip) com registos',
    async () => {
      const blob = await gerarPptxBlob(registos)
      expect(blob.size).toBeGreaterThan(0)
      const bytes = new Uint8Array(await blob.arrayBuffer())
      expect(bytes[0]).toBe(0x50) // 'P'
      expect(bytes[1]).toBe(0x4b) // 'K' — assinatura ZIP/OOXML
    },
    20000,
  )

  it(
    'gera um .pptx válido mesmo sem registos (não bloqueia por erros de validação)',
    async () => {
      const blob = await gerarPptxBlob([])
      expect(blob.size).toBeGreaterThan(0)
    },
    20000,
  )
})
