import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ModoValidador } from '@/features/validacao/paginas/modo-validador'
import { textos } from '@/i18n/pt'
import { serializarJson } from '@/io/json/exportar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'

describe('ModoValidador', () => {
  it('importa múltiplos ficheiros e mostra o resumo da sessão', async () => {
    const utilizador = userEvent.setup()
    render(
      <MemoryRouter>
        <ModoValidador />
      </MemoryRouter>,
    )

    const ficheiro = new File([serializarJson(ficheiroRatFixtureValido)], 'sessao.json', {
      type: 'application/json',
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await utilizador.upload(input, ficheiro)

    expect(await screen.findByText('sessao.json')).toBeInTheDocument()
    expect(screen.getByText(ficheiroRatFixtureValido.metadados.equipa)).toBeInTheDocument()
    expect(screen.getByText(String(ficheiroRatFixtureValido.registos.length))).toBeInTheDocument()
  })

  it('permite adicionar uma anotação geral a um registo no detalhe', async () => {
    const utilizador = userEvent.setup()
    render(
      <MemoryRouter>
        <ModoValidador />
      </MemoryRouter>,
    )

    const ficheiro = new File([serializarJson(ficheiroRatFixtureValido)], 'sessao.json', {
      type: 'application/json',
    })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await utilizador.upload(input, ficheiro)

    await utilizador.click(await screen.findByRole('button', { name: textos.validador.botaoVerDetalhe }))
    const botoesAnotarGeral = await screen.findAllByRole('button', {
      name: textos.validador.botaoAnotarGeral,
    })
    await utilizador.click(botoesAnotarGeral[0])
    await utilizador.type(
      screen.getByPlaceholderText(textos.validador.placeholderAnotacao),
      'Rever esta secção, por favor.',
    )
    await utilizador.click(screen.getByRole('button', { name: textos.validador.botaoGuardarAnotacao }))

    expect(await screen.findByText('Rever esta secção, por favor.')).toBeInTheDocument()
  })
})
