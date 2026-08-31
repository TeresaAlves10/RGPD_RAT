import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BarraLateral } from '@/components/layout/barra-lateral'
import { NOME_ORGANIZACAO } from '@/config/organizacao'

function renderBarra() {
  return render(
    <MemoryRouter>
      <BarraLateral />
    </MemoryRouter>,
  )
}

describe('logótipo da organização', () => {
  it('sem logótipo configurado, mostra o nome da organização em texto', () => {
    renderBarra()

    expect(screen.getByText(NOME_ORGANIZACAO)).toBeInTheDocument()
    expect(screen.queryByAltText(NOME_ORGANIZACAO)).not.toBeInTheDocument()
  })
})
