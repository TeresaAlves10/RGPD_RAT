import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'

describe('wizard de preenchimento', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('cria um registo de responsável de início a fim e mostra-o na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )

    // Passo 1: Identificação
    await utilizador.type(await screen.findByLabelText(textos.campos.direcao), 'Direção Fictícia')
    await utilizador.type(screen.getByLabelText(textos.campos.nomeTratamento), 'Tratamento Fictício de Teste')
    await utilizador.type(screen.getByLabelText(textos.campos['gestorProjeto.nome']), 'Ana Fictícia')
    await utilizador.type(screen.getByLabelText(textos.campos['gestorProjeto.contacto']), 'ana@exemplo.pt')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 2: Finalidade e base de licitude
    await utilizador.type(await screen.findByLabelText(textos.campos.finalidades), 'Finalidade fictícia de teste.')
    await utilizador.type(screen.getByLabelText(textos.campos.recolhaDados), 'Formulário eletrónico fictício.')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 3: Titulares e dados
    await utilizador.click(await screen.findByLabelText('Colaboradores'))
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.adicionar }))
    await utilizador.type(screen.getByLabelText(textos.campos['categoriaDados.tipos']), 'Nome')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 4: Destinatários e transferências (nada obrigatório)
    await utilizador.click(await screen.findByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 5: Conservação e segurança
    await utilizador.type(await screen.findByLabelText(textos.campos.prazoConservacao), '5 anos, fictício.')
    await utilizador.click(screen.getByLabelText('Passwords'))
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 6: Subcontratantes e observações -> guardar
    await utilizador.click(await screen.findByRole('button', { name: textos.formulario.botaoGuardar }))

    const linha = (await screen.findByText('Tratamento Fictício de Teste')).closest('tr')
    expect(linha).not.toBeNull()
    expect(within(linha as HTMLElement).getByText(textos.lista.tipoResponsavel)).toBeInTheDocument()
  })

  it('cria um registo de subcontratado de início a fim e mostra-o na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[1],
    )

    // Passo 1: Identificação
    await utilizador.type(await screen.findByLabelText(textos.campos.direcao), 'Direção Fictícia')
    await utilizador.type(
      screen.getByLabelText(textos.campos.nomeTratamento),
      'Serviço Subcontratado Fictício',
    )
    await utilizador.type(screen.getByLabelText(textos.campos['gestorProjeto.nome']), 'Bruno Fictício')
    await utilizador.type(screen.getByLabelText(textos.campos['gestorProjeto.contacto']), 'bruno@exemplo.pt')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 2: Responsáveis por conta de quem se atua
    await utilizador.click(await screen.findByRole('button', { name: textos.formulario.adicionar }))
    await utilizador.type(screen.getByLabelText(textos.campos['responsaveis.nome']), 'Cliente Fictício')
    await utilizador.type(
      screen.getByLabelText(textos.campos['responsaveis.categoriasTratamento']),
      'Armazenamento fictício de dados de teste.',
    )
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 3: Transferências (nada obrigatório)
    await utilizador.click(await screen.findByRole('button', { name: textos.formulario.botaoSeguinte }))

    // Passo 4: Segurança e observações -> guardar
    await utilizador.click(await screen.findByLabelText('Cibersegurança'))
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    const linha = (await screen.findByText('Serviço Subcontratado Fictício')).closest('tr')
    expect(linha).not.toBeNull()
    expect(
      within(linha as HTMLElement).getByText(textos.lista.tipoSubcontratado),
    ).toBeInTheDocument()
  })

  it('permite remover um registo criado', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.lista.botaoNovoRegisto }))
    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.escolhaTipo.botaoContinuar }))[0],
    )
    await utilizador.type(await screen.findByLabelText(textos.campos.direcao), 'Direção Fictícia')
    await utilizador.type(screen.getByLabelText(textos.campos.nomeTratamento), 'Registo a Remover')
    await utilizador.type(screen.getByLabelText(textos.campos['gestorProjeto.nome']), 'Ana Fictícia')
    await utilizador.type(screen.getByLabelText(textos.campos['gestorProjeto.contacto']), 'ana@exemplo.pt')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    await utilizador.type(await screen.findByLabelText(textos.campos.finalidades), 'Finalidade fictícia.')
    await utilizador.type(screen.getByLabelText(textos.campos.recolhaDados), 'Formulário fictício.')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    await utilizador.click(await screen.findByLabelText('Colaboradores'))
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.adicionar }))
    await utilizador.type(screen.getByLabelText(textos.campos['categoriaDados.tipos']), 'Nome')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))

    await utilizador.click(await screen.findByRole('button', { name: textos.formulario.botaoSeguinte }))

    await utilizador.type(await screen.findByLabelText(textos.campos.prazoConservacao), '5 anos, fictício.')
    await utilizador.click(screen.getByLabelText('Passwords'))
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoSeguinte }))
    await utilizador.click(await screen.findByRole('button', { name: textos.formulario.botaoGuardar }))

    expect(await screen.findByText('Registo a Remover')).toBeInTheDocument()

    const linha = screen.getByText('Registo a Remover').closest('tr')
    expect(linha).not.toBeNull()

    const confirmarSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await utilizador.click(within(linha as HTMLElement).getByRole('button', { name: textos.lista.botaoRemover }))
    confirmarSpy.mockRestore()

    expect(screen.queryByText('Registo a Remover')).not.toBeInTheDocument()
    expect(screen.getByText(textos.lista.semRegistos)).toBeInTheDocument()
  })
})
