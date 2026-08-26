import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { textos } from '@/i18n/pt'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('abre na lista de registos', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: textos.lista.titulo })).toBeInTheDocument()
  })

  it('mostra a navegação principal', () => {
    render(<App />)
    const navegacao = screen.getByRole('navigation', { name: textos.navegacao.principal })
    expect(navegacao).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: textos.validador.tituloNav }),
    ).toBeInTheDocument()
  })
})
