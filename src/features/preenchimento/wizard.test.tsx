import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'
import { DIRECAO_POR_OMISSAO, UNIDADES_COORDENACAO } from '@/config/organizacao'

/** Preenche o mínimo para o registo existir na lista. */
async function identificar(utilizador: ReturnType<typeof userEvent.setup>, nome: string) {
  await utilizador.type(await screen.findByLabelText(textos.campos.nomeTratamento), nome)
  await utilizador.click(screen.getByRole('tab', { name: /Observações Gerais/ }))
  await utilizador.type(
    await screen.findByLabelText(textos.campos['gestorProjeto.nome']),
    'Ana Fictícia',
  )
}

describe('wizard de preenchimento', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = '#/registos'
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
    await identificar(utilizador, 'Tratamento Fictício de Teste')
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
    await identificar(utilizador, 'Serviço Subcontratado Fictício')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    const linha = tabela.getByText('Serviço Subcontratado Fictício').closest('tr')
    expect(linha).not.toBeNull()
    expect(within(linha as HTMLElement).getByText(textos.lista.tipoSubcontratado)).toBeInTheDocument()
  })

  it('preenche a Direção por omissão e oferece as Unidades de Coordenação', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )

    expect(await screen.findByLabelText(textos.campos.direcao)).toHaveValue(DIRECAO_POR_OMISSAO)

    const unidade = screen.getByLabelText(textos.campos.unidadeCoordenacao)
    for (const u of UNIDADES_COORDENACAO) {
      expect(within(unidade).getByRole('option', { name: `${u.sigla} — ${u.nome}` })).toBeInTheDocument()
    }
  })

  it('mostra as perguntas do consentimento na secção da base de licitude', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await utilizador.click(await screen.findByRole('tab', { name: /Base de Licitude/ }))

    // A base de licitude passou a texto livre, por isso as duas perguntas
    // do consentimento estão sempre visíveis, sob o seu próprio aviso.
    expect(await screen.findByLabelText(textos.campos.baseLicitude)).toBeInTheDocument()
    expect(
      screen.getByLabelText(textos.campos.consentimentoMecanismosDemonstracao),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(textos.campos.consentimentoResponsabilidadeParental),
    ).toBeInTheDocument()
  })

  it('atribui numeração automática a cada registo novo', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await identificar(utilizador, 'Primeiro registo')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await identificar(utilizador, 'Segundo registo')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const tabela = within(await screen.findByRole('table'))
    expect(tabela.getByText('Primeiro registo').closest('tr')).toHaveTextContent('1')
    expect(tabela.getByText('Segundo registo').closest('tr')).toHaveTextContent('2')
  })

  it('permite remover um registo criado', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await identificar(utilizador, 'Registo a Remover')
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

  it('mostra as definições do RGPD e o artigo de cada conceito', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))

    expect(await screen.findByText(textos.escolhaTipo.responsavelDescricao)).toBeInTheDocument()
    expect(screen.getByText(textos.escolhaTipo.subcontratadoDescricao)).toBeInTheDocument()
    expect(screen.getByText(/Artigo 4\.º, n\.º 7/)).toBeInTheDocument()
    expect(screen.getByText(/Artigo 4\.º, n\.º 8/)).toBeInTheDocument()
  })

  it('deixa registar a ordem de grandeza e o número exato nas contagens', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await utilizador.click(await screen.findByRole('tab', { name: /Ferramentas/ }))

    await utilizador.selectOptions(
      await screen.findByLabelText(textos.campos.volumeDadosPessoais),
      'medio',
    )
    const valor = screen.getByLabelText(
      `${textos.campos.volumeDadosPessoais} — ${textos.escala.valorRotulo}`,
    )
    await utilizador.type(valor, '240 processos')
    expect(valor).toHaveValue('240 processos')
  })

  it('coloca a pergunta das violações de dados nos Controlos Operacionais', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )

    await utilizador.click(await screen.findByRole('tab', { name: /Requisitos Funcionais/ }))
    expect(
      screen.queryByLabelText(textos.campos.detecaoNotificacaoViolacoes),
    ).not.toBeInTheDocument()

    await utilizador.click(screen.getByRole('tab', { name: /Controlos Operacionais/ }))
    expect(
      await screen.findByLabelText(textos.campos.detecaoNotificacaoViolacoes),
    ).toBeInTheDocument()
  })
})
