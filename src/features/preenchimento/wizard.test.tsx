import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'

/** Preenche a secção 1 do responsável até ao mínimo para o registo existir. */
async function identificarResponsavel(
  utilizador: ReturnType<typeof userEvent.setup>,
  nome: string,
) {
  await utilizador.type(await screen.findByLabelText(textos.campos.direcao), 'Direção Fictícia')
  await utilizador.type(screen.getByLabelText(textos.campos.nomeTratamento), nome)
  await utilizador.click(screen.getByRole('tab', { name: /Observações Gerais/ }))
  await utilizador.type(
    await screen.findByLabelText(textos.campos['gestorProjeto.nome']),
    'Ana Fictícia',
  )
}

describe('wizard de preenchimento', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('mostra as sete secções da especificação no formulário do responsável', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )

    const abas = await screen.findAllByRole('tab')
    expect(abas.map((a) => a.textContent?.replace(/^\d+/, ''))).toEqual([
      textos.passos.caracterizacao,
      textos.passos.ferramentas,
      textos.passos.subcontratados,
      textos.passos.baseLicitude,
      textos.passos.requisitosFuncionais,
      textos.passos.controlosOperacionais,
      textos.passos.observacoesGerais,
    ])
  })

  it('cria um registo de responsável e mostra-o na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await identificarResponsavel(utilizador, 'Tratamento Fictício de Teste')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    const linha = tabela.getByText('Tratamento Fictício de Teste').closest('tr')
    expect(linha).not.toBeNull()
    expect(within(linha as HTMLElement).getByText(textos.lista.tipoResponsavel)).toBeInTheDocument()
  })

  it('cria um registo de subcontratado e mostra-o na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[1],
    )

    await utilizador.type(
      await screen.findByLabelText(textos.campos.nomeResponsavelTratamento),
      'Cliente Fictício, S.A.',
    )
    await utilizador.type(screen.getByLabelText(textos.campos.direcao), 'Direção Fictícia')
    await utilizador.type(
      screen.getByLabelText(textos.campos.nomeTratamento),
      'Serviço Subcontratado Fictício',
    )

    await utilizador.click(screen.getByRole('tab', { name: /Observações Gerais/ }))
    await utilizador.type(
      await screen.findByLabelText(textos.campos['gestorProjeto.nome']),
      'Bruno Fictício',
    )
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    const linha = tabela.getByText('Serviço Subcontratado Fictício').closest('tr')
    expect(linha).not.toBeNull()
    expect(within(linha as HTMLElement).getByText(textos.lista.tipoSubcontratado)).toBeInTheDocument()
  })

  it('mostra as perguntas de consentimento só quando a base é o consentimento', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await utilizador.click(await screen.findByRole('tab', { name: /Base de Licitude/ }))

    expect(
      screen.queryByLabelText(textos.campos.consentimentoMecanismosDemonstracao),
    ).not.toBeInTheDocument()

    await utilizador.selectOptions(
      await screen.findByLabelText(textos.campos.baseLicitude),
      'consentimento',
    )

    expect(
      await screen.findByLabelText(textos.campos.consentimentoMecanismosDemonstracao),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(textos.campos.consentimentoResponsabilidadeParental),
    ).toBeInTheDocument()
  })

  it('permite remover um registo criado', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await identificarResponsavel(utilizador, 'Registo a Remover')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    const linha = tabela.getByText('Registo a Remover').closest('tr')
    const confirmarSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await utilizador.click(
      within(linha as HTMLElement).getByRole('button', { name: textos.lista.botaoRemover }),
    )
    confirmarSpy.mockRestore()

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText(textos.lista.semRegistos)).toBeInTheDocument()
  })
})
