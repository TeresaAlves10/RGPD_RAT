import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ModoValidador } from '@/features/validacao/paginas/modo-validador'
import { textos } from '@/i18n/pt'
import { serializarJson } from '@/io/json/exportar'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoResponsavelMinimo,
  registoSubcontratadoCompleto,
} from '@/domain/fixtures/registos'
import { FicheiroProvider } from '@/features/preenchimento/store/ficheiro-context'

/**
 * O modo validador precisa do contexto do ficheiro: o botão "corrigir no
 * formulário" carrega lá o ficheiro da sessão.
 */
function renderValidador() {
  return render(
    <MemoryRouter>
      <FicheiroProvider>
        <ModoValidador />
      </FicheiroProvider>
    </MemoryRouter>,
  )
}

describe('ModoValidador', () => {
  it('importa múltiplos ficheiros e mostra o resumo da sessão', async () => {
    const utilizador = userEvent.setup()
    renderValidador()

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
    renderValidador()

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

describe('decisão do validador', () => {
  async function abrirDetalhe(utilizador: ReturnType<typeof userEvent.setup>) {
    renderValidador()
    const ficheiro = new File([serializarJson(ficheiroRatFixtureValido)], 'sessao.json', {
      type: 'application/json',
    })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await utilizador.upload(input, ficheiro)
    await utilizador.click(
      await screen.findByRole('button', { name: textos.validador.botaoVerDetalhe }),
    )
  }

  it('valida um registo e regista quem validou', async () => {
    const utilizador = userEvent.setup()
    await abrirDetalhe(utilizador)

    await utilizador.type(
      await screen.findByLabelText(textos.estado.campoValidadoPor),
      'Eva Revisora Fictícia',
    )

    // O primeiro cartão é o do primeiro registo do ficheiro.
    expect(screen.getAllByRole('heading')[1]).toHaveTextContent(
      registoResponsavelMinimo.nomeTratamento,
    )
    const validar = (await screen.findAllByRole('button', { name: textos.estado.validar }))[0]
    await utilizador.click(validar)

    expect(await screen.findByText(/Validado por Eva Revisora Fictícia/)).toBeInTheDocument()
  })

  it('devolve um registo para correção', async () => {
    const utilizador = userEvent.setup()
    await abrirDetalhe(utilizador)

    const devolver = (
      await screen.findAllByRole('button', { name: textos.estado.devolver })
    )[0]
    await utilizador.click(devolver)

    expect(screen.getAllByText(textos.estado.devolvido).length).toBeGreaterThan(0)
  })

  it('abre o formulário completo para o validador alterar qualquer campo', async () => {
    const utilizador = userEvent.setup()
    await abrirDetalhe(utilizador)

    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.validador.botaoEditar }))[0],
    )

    // É o mesmo formulário do GP — todas as secções e todos os campos.
    expect(await screen.findByLabelText(textos.campos.nomeTratamento)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Controlos Operacionais/ })).toBeInTheDocument()
    // E, ao contrário do formulário da equipa, pode validar aqui mesmo.
    expect(screen.getByRole('button', { name: textos.estado.validar })).toBeInTheDocument()
  })

  it('guarda no ficheiro da sessão o que o validador corrigir', async () => {
    const utilizador = userEvent.setup()
    await abrirDetalhe(utilizador)

    await utilizador.click(
      (await screen.findAllByRole('button', { name: textos.validador.botaoEditar }))[0],
    )
    const campo = await screen.findByLabelText(textos.campos.nomeTratamento)
    await utilizador.clear(campo)
    await utilizador.type(campo, 'Nome Corrigido pelo Validador')
    await utilizador.click(screen.getByRole('button', { name: textos.formulario.botaoGuardar }))

    expect(await screen.findByText(/Nome Corrigido pelo Validador/)).toBeInTheDocument()
  })

  it('lista os registos submetidos de toda a sessão', async () => {
    const utilizador = userEvent.setup()
    renderValidador()
    const ficheiro = new File([serializarJson(ficheiroRatFixtureValido)], 'sessao.json', {
      type: 'application/json',
    })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await utilizador.upload(input, ficheiro)

    expect(await screen.findByText(textos.validador.submetidosTitulo)).toBeInTheDocument()
    // Só o registo em estado "submetido" da fixture aparece aqui.
    expect(
      screen.getByText(new RegExp(registoResponsavelCompleto.nomeTratamento)),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(new RegExp(registoSubcontratadoCompleto.nomeTratamento)),
    ).not.toBeInTheDocument()
  })
})

