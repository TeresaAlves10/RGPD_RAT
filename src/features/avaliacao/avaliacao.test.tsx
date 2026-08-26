import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'
import { serializarJson } from '@/io/json/exportar'
import { ficheiroRatFixtureValido, registoResponsavelMinimo } from '@/domain/fixtures/registos'

/** Importa a fixture para a app, para termos registos com que trabalhar. */
async function importarFixture(utilizador: ReturnType<typeof userEvent.setup>) {
  const ficheiro = new File([serializarJson(ficheiroRatFixtureValido)], 'rat.json', {
    type: 'application/json',
  })
  const input = document.querySelector(
    'input[type="file"][accept=".json,.xlsx"]',
  ) as HTMLInputElement
  await utilizador.upload(input, ficheiro)
  await screen.findByText(registoResponsavelMinimo.nomeTratamento)
}

describe('módulo de avaliação de controlos', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('não está ativado num registo que nunca o usou, e pode ser ativado', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    // O registo mínimo não traz avaliação.
    window.location.hash = `#/registos/${registoResponsavelMinimo.id}/avaliacao`
    expect(await screen.findByText(textos.avaliacao.naoAtivado)).toBeInTheDocument()

    await utilizador.click(screen.getByRole('button', { name: textos.avaliacao.ativar }))

    expect(
      screen.getByRole('heading', { name: textos.avaliacao.seccoes.requisitosFuncionais }),
    ).toBeInTheDocument()
    expect(screen.queryByText(textos.avaliacao.naoAtivado)).not.toBeInTheDocument()
  })

  it('guarda uma resposta de controlo no registo', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    window.location.hash = `#/registos/${registoResponsavelMinimo.id}/avaliacao`
    await utilizador.click(await screen.findByRole('button', { name: textos.avaliacao.ativar }))

    await utilizador.selectOptions(
      screen.getByLabelText(textos.avaliacao.campos.direitoAcesso),
      'sim',
    )
    await utilizador.click(screen.getByRole('button', { name: textos.avaliacao.guardar }))

    // Voltámos ao formulário do registo; o botão passa a levar à avaliação
    // existente em vez de convidar a ativá-la.
    expect(
      await screen.findByRole('button', { name: textos.avaliacao.tituloNav }),
    ).toBeInTheDocument()
  })

  it('mantém a avaliação fora do formulário do RAT', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    window.location.hash = `#/registos/${registoResponsavelMinimo.id}/editar`
    await screen.findByLabelText(textos.campos.nomeTratamento)

    // Nenhuma pergunta de controlo aparece no ecrã do RAT (CLAUDE.md §3).
    expect(
      screen.queryByLabelText(textos.avaliacao.campos.direitoAcesso),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(textos.avaliacao.seccoes.controlosOperacionais),
    ).not.toBeInTheDocument()
  })
})

describe('estado do registo', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('mostra o estado de cada registo na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    const tabela = within(screen.getByRole('table'))
    const linha = tabela.getByText(registoResponsavelMinimo.nomeTratamento).closest('tr')
    expect(within(linha as HTMLElement).getByText(textos.estado.rascunho)).toBeInTheDocument()
  })

  it('permite marcar um registo como pronto a enviar', async () => {
    const utilizador = userEvent.setup()
    render(<App />)
    await importarFixture(utilizador)

    window.location.hash = `#/registos/${registoResponsavelMinimo.id}/editar`
    await utilizador.click(
      await screen.findByRole('button', { name: textos.estado.marcarPronto }),
    )
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    const linha = tabela.getByText(registoResponsavelMinimo.nomeTratamento).closest('tr')
    expect(within(linha as HTMLElement).getByText(textos.estado.pronto)).toBeInTheDocument()
  })
})
