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
  return new TextDecoder().decode(buffer.slice(0, 5)) === '%PDF-'
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
      expect(ehPdfValido(await gerarPdfBuffer(criarFicheiroVazio()))).toBe(true)
    },
    20000,
  )
})

describe('conteúdo do PDF', () => {
  const texto = JSON.stringify(gerarDocDefinition(ficheiroRatFixtureValido))

  it('traz as sete secções do responsável', () => {
    for (const seccao of [
      textos.passos.caracterizacao,
      textos.passos.ferramentas,
      textos.passos.subcontratados,
      textos.passos.baseLicitude,
      textos.passos.requisitosFuncionais,
      textos.passos.controlosOperacionais,
      textos.passos.observacoesGerais,
    ]) {
      expect(texto).toContain(seccao)
    }
  })

  it('traz os valores preenchidos do responsável', () => {
    expect(texto).toContain(registoResponsavelCompleto.finalidade)
    expect(texto).toContain(registoResponsavelCompleto.suportesFisicos)
    expect(texto).toContain(registoResponsavelCompleto.entidadesSubcontratadas)
  })

  it('traz os campos do subcontratante', () => {
    expect(texto).toContain(registoSubcontratadoCompleto.nomeResponsavelTratamento)
    expect(texto).toContain(registoSubcontratadoCompleto.prazoConservacao)
    expect(texto).toContain(registoSubcontratadoCompleto.entidadesSubcontratadas)
  })

  it('mostra a numeração automática no título de cada registo', () => {
    expect(texto).toContain(`${registoResponsavelCompleto.numero}. ${registoResponsavelCompleto.nomeTratamento}`)
  })

  it('mostra o estado e quem validou', () => {
    expect(texto).toContain(textos.estado.validado)
    expect(texto).toContain(registoSubcontratadoCompleto.validacao?.validadoPor)
  })

  it('inclui as anotações do validador, para a equipa as ver no PDF', () => {
    expect(texto).toContain(registoResponsavelCompleto.anotacoes?.[0].texto)
  })

  it('não imprime linhas de campos vazios', () => {
    const soMinimo = JSON.stringify(
      gerarDocDefinition({
        ...ficheiroRatFixtureValido,
        registos: [ficheiroRatFixtureValido.registos[0]],
      }),
    )
    // O registo mínimo não tem suportes físicos preenchidos: a linha
    // "Rótulo: valor" não deve existir. O rótulo continua a aparecer na
    // lista de verificações, que é onde faz falta.
    expect(soMinimo).not.toContain(`${textos.campos.suportesFisicos}: `)
    expect(soMinimo).toContain(`${textos.campos.suportesFisicos} — por preencher`)
  })

  it('lista as secções vazias fora do corpo do registo', () => {
    const soMinimo = JSON.stringify(
      gerarDocDefinition({
        ...ficheiroRatFixtureValido,
        registos: [ficheiroRatFixtureValido.registos[0]],
      }),
    )
    // Sem nada preenchido, a secção "Ferramentas" não abre sequer. O
    // teste procura o cabeçalho de secção, não o texto: o rótulo do campo
    // é a mesma frase e aparece na lista de verificações.
    const cabecalhoSeccao = (nome: string) =>
      JSON.stringify({ text: nome, style: 'tituloSeccao' })
    expect(soMinimo).not.toContain(cabecalhoSeccao(textos.passos.ferramentas))
    expect(soMinimo).toContain(cabecalhoSeccao(textos.passos.caracterizacao))
  })
})
