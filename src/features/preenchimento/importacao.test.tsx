import { render, screen, waitFor, within } from '@testing-library/react'
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

  it('pede para escolher entre substituir e adicionar quando já há registos', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const ficheiroExcel = new File([blob], 'rat.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const input = document.querySelector('input[type="file"][accept=".xlsx"]') as HTMLInputElement

    // Primeira importação: ficheiro vazio, não há decisão a tomar.
    await utilizador.upload(input, ficheiroExcel)
    await screen.findByDisplayValue(ficheiroRatFixtureValido.metadados.equipa)
    const totalOriginal = ficheiroRatFixtureValido.registos.length

    // Segunda importação: já há registos, o diálogo pergunta o quê fazer.
    await utilizador.upload(input, ficheiroExcel)
    expect(await screen.findByText(textos.importar.confirmarTitulo)).toBeInTheDocument()

    await utilizador.click(
      screen.getByRole('button', { name: textos.importar.botaoAdicionarAosExistentes }),
    )

    // A tabela já existe desde a primeira importação — só a atualização a
    // adicionar os novos registos é assíncrona, por isso convém esperar
    // pelo número final de linhas em vez de assumir que já lá está.
    await waitFor(() => {
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
        totalOriginal * 2 + 1, // +1 do cabeçalho
      )
    })
    const tabela = within(screen.getByRole('table'))
    // Os nomes ficam duplicados na tabela (dois ficheiros iguais somados).
    for (const registo of ficheiroRatFixtureValido.registos) {
      expect(tabela.getAllByText(registo.nomeTratamento)).toHaveLength(2)
    }
  })

  it('substitui tudo quando se escolhe "Substituir tudo" no diálogo', async () => {
    const utilizador = userEvent.setup()
    render(<App />)

    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const ficheiroExcel = new File([blob], 'rat.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const input = document.querySelector('input[type="file"][accept=".xlsx"]') as HTMLInputElement

    await utilizador.upload(input, ficheiroExcel)
    await screen.findByDisplayValue(ficheiroRatFixtureValido.metadados.equipa)

    await utilizador.upload(input, ficheiroExcel)
    await screen.findByText(textos.importar.confirmarTitulo)
    await utilizador.click(screen.getByRole('button', { name: textos.importar.botaoSubstituir }))

    const totalOriginal = ficheiroRatFixtureValido.registos.length
    await waitFor(() => {
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
        totalOriginal + 1, // +1 do cabeçalho
      )
    })
    const tabela = within(screen.getByRole('table'))
    for (const registo of ficheiroRatFixtureValido.registos) {
      expect(tabela.getAllByText(registo.nomeTratamento)).toHaveLength(1)
    }
  })
})
