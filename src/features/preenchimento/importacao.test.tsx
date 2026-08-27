import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'
import { serializarJson } from '@/io/json/exportar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'

describe('importação nativa (JSON)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('importa um ficheiro JSON válido e mostra os registos na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    const ficheiroJson = new File([serializarJson(ficheiroRatFixtureValido)], 'rat.json', {
      type: 'application/json',
    })

    const input = document.querySelector('input[type="file"][accept=".json,.xlsx"]') as HTMLInputElement
    expect(input).not.toBeNull()
    await utilizador.upload(input, ficheiroJson)

    expect(await screen.findByDisplayValue(ficheiroRatFixtureValido.metadados.equipa)).toBeInTheDocument()
    // Escopado à tabela: um registo por completar aparece também no bloco
    // "Precisa da tua atenção", e o nome ficaria duplicado no ecrã.
    const tabela = within(await screen.findByRole('table'))
    for (const registo of ficheiroRatFixtureValido.registos) {
      expect(tabela.getByText(registo.nomeTratamento)).toBeInTheDocument()
    }
  })

  it('mostra uma mensagem de erro para um ficheiro JSON inválido', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    const ficheiroInvalido = new File(['{"foo":"bar"}'], 'invalido.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"][accept=".json,.xlsx"]') as HTMLInputElement
    await utilizador.upload(input, ficheiroInvalido)

    expect(await screen.findByText(textos.importar.erroGenerico)).toBeInTheDocument()
  })
})
