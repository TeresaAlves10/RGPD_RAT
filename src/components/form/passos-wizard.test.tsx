import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PassosWizard } from '@/components/form/passos-wizard'

const TITULOS = ['Primeiro', 'Segundo', 'Terceiro'] as const

describe('PassosWizard', () => {
  it('marca o passo atual com aria-selected e tabIndex 0, os outros com -1', () => {
    render(
      <PassosWizard
        idBase="teste"
        titulos={TITULOS}
        passoAtual={1}
        passosComErro={new Set()}
        onMudarPasso={() => {}}
      />,
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('tabindex', '-1')
    expect(tabs[1]).toHaveAttribute('tabindex', '0')
  })

  it('ArrowRight avança para o passo seguinte (com wrap-around)', async () => {
    const utilizador = userEvent.setup()
    const onMudarPasso = vi.fn()
    render(
      <PassosWizard
        idBase="teste"
        titulos={TITULOS}
        passoAtual={2}
        passosComErro={new Set()}
        onMudarPasso={onMudarPasso}
      />,
    )

    screen.getAllByRole('tab')[2].focus()
    await utilizador.keyboard('{ArrowRight}')
    expect(onMudarPasso).toHaveBeenCalledWith(0)
  })

  it('ArrowLeft recua para o passo anterior', async () => {
    const utilizador = userEvent.setup()
    const onMudarPasso = vi.fn()
    render(
      <PassosWizard
        idBase="teste"
        titulos={TITULOS}
        passoAtual={1}
        passosComErro={new Set()}
        onMudarPasso={onMudarPasso}
      />,
    )

    screen.getAllByRole('tab')[1].focus()
    await utilizador.keyboard('{ArrowLeft}')
    expect(onMudarPasso).toHaveBeenCalledWith(0)
  })
})
