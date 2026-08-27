import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { textos } from '@/i18n/pt'
import { gerarExcel } from '@/io/excel/exportar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'

describe('importação nativa (Excel)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = '#/registos'
  })

  it('importa um ficheiro Excel válido e mostra os registos na lista', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const ficheiroExcel = new File([blob], 'rat.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const input = document.querySelector('input[type="file"][accept=".xlsx"]') as HTMLInputElement
    expect(input).not.toBeNull()
    await utilizador.upload(input, ficheiroExcel)

    expect(await screen.findByDisplayValue(ficheiroRatFixtureValido.metadados.equipa)).toBeInTheDocument()
    // Escopado à tabela: um registo por completar aparece também no bloco
    // "Precisa da tua atenção", e o nome ficaria duplicado no ecrã.
    const tabela = within(await screen.findByRole('table'))
    for (const registo of ficheiroRatFixtureValido.registos) {
      expect(tabela.getByText(registo.nomeTratamento)).toBeInTheDocument()
    }
  })

  it('mostra uma mensagem de erro para um ficheiro Excel inválido', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    const ficheiroInvalido = new File(['não é um Excel'], 'invalido.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const input = document.querySelector('input[type="file"][accept=".xlsx"]') as HTMLInputElement
    await utilizador.upload(input, ficheiroInvalido)

    expect(await screen.findByText(textos.importar.erroGenerico)).toBeInTheDocument()
  })
})
