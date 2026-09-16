import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { gerarDocumento, gerarWordBlob } from '@/io/word/exportar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'
import { criarFicheiroVazio } from '@/features/preenchimento/store/ficheiro-context'
import { textos } from '@/i18n/pt'

describe('exportação Word', () => {
  it(
    'gera um .docx válido (ficheiro zip) com registos',
    async () => {
      const blob = await gerarWordBlob(ficheiroRatFixtureValido)
      expect(blob.size).toBeGreaterThan(0)
      const bytes = new Uint8Array(await blob.arrayBuffer())
      expect(bytes[0]).toBe(0x50) // 'P'
      expect(bytes[1]).toBe(0x4b) // 'K' — assinatura ZIP/OOXML
    },
    20000,
  )

  it(
    'gera um .docx válido mesmo sem registos (não bloqueia por erros de validação)',
    async () => {
      const blob = await gerarWordBlob(criarFicheiroVazio())
      expect(blob.size).toBeGreaterThan(0)
    },
    20000,
  )
})

describe('conteúdo do Word', () => {
  it(
    'traz as sete secções do responsável, extraídas do XML gerado',
    async () => {
      const documento = gerarDocumento(ficheiroRatFixtureValido)
      const buffer = await Packer.toBuffer(documento)
      const { default: JSZip } = await import('jszip')
      const zip = await JSZip.loadAsync(buffer)
      const xml = await zip.file('word/document.xml')!.async('string')

      for (const seccao of [
        textos.passos.caracterizacao,
        textos.passos.ferramentas,
        textos.passos.subcontratados,
        textos.passos.baseLicitude,
        textos.passos.requisitosFuncionais,
        textos.passos.controlosOperacionais,
        textos.passos.observacoesGerais,
      ]) {
        expect(xml).toContain(seccao)
      }
    },
    20000,
  )
})
