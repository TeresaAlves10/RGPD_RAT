import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'
import { serializarJson } from '@/io/json/exportar'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoResponsavelMinimo,
} from '@/domain/fixtures/registos'

/**
 * O circuito pedido: o Gestor de Projeto preenche e submete; o validador
 * corrige e valida. Não há servidor — o estado viaja dentro do ficheiro
 * exportado (CLAUDE.md §2.2).
 */

async function importarFixture(utilizador: ReturnType<typeof userEvent.setup>) {
  const ficheiro = new File([serializarJson(ficheiroRatFixtureValido)], 'rat.json', {
    type: 'application/json',
  })
  const input = document.querySelector(
    'input[type="file"][accept=".json,.xlsx"]',
  ) as HTMLInputElement
  await utilizador.upload(input, ficheiro)
  await screen.findByRole('table')
}

describe('circuito GP -> validador', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('não deixa submeter um registo com campos obrigatórios por preencher', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    window.location.hash = `#/registos/${registoResponsavelMinimo.id}/editar`
    const submeter = await screen.findByRole('button', { name: textos.estado.submeter })
    expect(submeter).toBeDisabled()
    expect(screen.getByText(new RegExp(textos.estado.submeterBloqueado))).toBeInTheDocument()
  })

  it('deixa submeter um registo completo e o estado passa a "submetido"', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    // O registo completo já vem submetido: reabre-se primeiro, para
    // exercer o caminho rascunho -> submetido.
    window.location.hash = `#/registos/${registoResponsavelCompleto.id}/editar`
    await utilizador.click(await screen.findByRole('button', { name: textos.estado.reabrir }))

    const submeter = await screen.findByRole('button', { name: textos.estado.submeter })
    expect(submeter).toBeEnabled()
    await utilizador.click(submeter)
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    const linha = tabela.getByText(registoResponsavelCompleto.nomeTratamento).closest('tr')
    expect(within(linha as HTMLElement).getByText(textos.estado.submetido)).toBeInTheDocument()
  })

  it('a equipa não pode validar o próprio registo — só o modo validador', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    window.location.hash = `#/registos/${registoResponsavelCompleto.id}/editar`
    await screen.findByRole('button', { name: textos.estado.reabrir })
    expect(screen.queryByRole('button', { name: textos.estado.validar })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: textos.estado.devolver })).not.toBeInTheDocument()
  })

  it('o validador corrige um campo e o registo continua editável', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    window.location.hash = `#/registos/${registoResponsavelCompleto.id}/editar`
    const campo = await screen.findByLabelText(textos.campos.direcao)
    await utilizador.clear(campo)
    await utilizador.type(campo, 'Direção Corrigida Fictícia')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    expect(tabela.getByText('Direção Corrigida Fictícia')).toBeInTheDocument()
  })

  it('mostra o estado de cada registo na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    const tabela = within(screen.getByRole('table'))
    const linhaRascunho = tabela.getByText(registoResponsavelMinimo.nomeTratamento).closest('tr')
    expect(within(linhaRascunho as HTMLElement).getByText(textos.estado.rascunho)).toBeInTheDocument()

    const linhaSubmetido = tabela.getByText(registoResponsavelCompleto.nomeTratamento).closest('tr')
    expect(
      within(linhaSubmetido as HTMLElement).getByText(textos.estado.submetido),
    ).toBeInTheDocument()
  })

  it('conta os registos por qualidade, estado e AIPD', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    const painel = within(screen.getByRole('region', { name: textos.totais.titulo }))
    const total = (rotulo: string) =>
      painel.getByText(rotulo).closest('div')?.textContent?.match(/^\d+/)?.[0]

    // A fixture tem 2 responsáveis e 2 subcontratantes; 1 submetido,
    // 1 validado, 1 com AIPD.
    expect(total(textos.totais.total)).toBe('4')
    expect(total(textos.totais.responsavel)).toBe('2')
    expect(total(textos.totais.subcontratante)).toBe('2')
    expect(total(textos.totais.emValidacao)).toBe('1')
    expect(total(textos.totais.validados)).toBe('1')
    expect(total(textos.totais.comAipd)).toBe('1')
  })
})
