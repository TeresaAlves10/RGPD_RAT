import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'

describe('página inicial', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('é o que se vê ao abrir a aplicação', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: textos.inicio.titulo, level: 1 }),
    ).toBeInTheDocument()
  })

  it('explica as três coisas que a aplicação faz', async () => {
    render(<App />)
    const destaques = within(
      await screen.findByRole('region', { name: textos.inicio.destaquesTitulo }),
    )
    for (const titulo of [
      textos.inicio.matrizTitulo,
      textos.inicio.circuitoTitulo,
      textos.inicio.importarTitulo,
    ]) {
      expect(destaques.getByRole('heading', { name: titulo })).toBeInTheDocument()
    }
  })

  it('leva à lista de registos', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(await screen.findByRole('button', { name: textos.inicio.botaoEntrar }))
    expect(await screen.findByRole('heading', { name: textos.lista.titulo })).toBeInTheDocument()
  })

  it('leva diretamente à criação de um registo', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    await utilizador.click(
      await screen.findByRole('button', { name: textos.inicio.botaoNovoRegisto }),
    )
    expect(
      await screen.findByRole('heading', { name: textos.escolhaTipo.titulo }),
    ).toBeInTheDocument()
  })

  /** Sem servidor não há contas — e isso tem de ficar dito a quem chega. */
  it('diz que os dados não saem do computador', async () => {
    render(<App />)
    expect(await screen.findByText(textos.inicio.privacidadeTexto)).toBeInTheDocument()
  })
})
