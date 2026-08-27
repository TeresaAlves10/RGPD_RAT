import { render, screen, fireEvent } from '@testing-library/react'
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
  it('mostra o logótipo servido do próprio bundle, não de uma CDN', () => {
    renderBarra()
    const logo = screen.getByAltText(NOME_ORGANIZACAO)
    // Caminho relativo: o ficheiro vem de public/, junto do bundle.
    expect(logo.getAttribute('src')).not.toMatch(/^https?:/)
  })

  it('cai no nome da organização quando o ficheiro do logótipo não existe', () => {
    renderBarra()
    fireEvent.error(screen.getByAltText(NOME_ORGANIZACAO))

    expect(screen.queryByAltText(NOME_ORGANIZACAO)).not.toBeInTheDocument()
    expect(screen.getByText(NOME_ORGANIZACAO)).toBeInTheDocument()
  })
})
