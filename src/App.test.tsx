import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { textos } from '@/i18n/pt'

describe('App', () => {
  it('mostra o título da aplicação', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: textos.app.titulo }),
    ).toBeInTheDocument()
  })
})
