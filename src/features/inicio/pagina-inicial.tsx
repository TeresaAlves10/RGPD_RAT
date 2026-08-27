import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { textos } from '@/i18n/pt'

const traco = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

interface Destaque {
  icone: ReactNode
  titulo: string
  texto: string
}

const DESTAQUES: Destaque[] = [
  {
    titulo: textos.inicio.matrizTitulo,
    texto: textos.inicio.matrizTexto,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
        <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
        <path d="M9 11h6M9 15h4" />
      </svg>
    ),
  },
  {
    titulo: textos.inicio.circuitoTitulo,
    texto: textos.inicio.circuitoTexto,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    ),
  },
  {
    titulo: textos.inicio.importarTitulo,
    texto: textos.inicio.importarTexto,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </svg>
    ),
  },
]

/**
 * Página de entrada. Explica o que a aplicação faz antes de mostrar
 * ecrãs de preenchimento — quem chega aqui pela primeira vez é uma
 * equipa que recebeu o link e ainda não sabe o que se espera dela.
 */
export function PaginaInicial() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-14 lg:px-8">
      <header className="flex flex-col gap-6">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          {textos.inicio.etiqueta}
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
          {textos.inicio.titulo}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {textos.inicio.subtitulo}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate('/registos')}>
            {textos.inicio.botaoEntrar}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/registos/novo')}>
            {textos.inicio.botaoNovoRegisto}
          </Button>
        </div>
      </header>

      <section aria-label={textos.inicio.destaquesTitulo} className="grid gap-5 md:grid-cols-3">
        {DESTAQUES.map((destaque) => (
          <Card key={destaque.titulo} className="h-full">
            <CardContent className="flex h-full flex-col gap-3 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                <span className="h-5 w-5">{destaque.icone}</span>
              </span>
              <h2 className="text-base font-semibold">{destaque.titulo}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{destaque.texto}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-lg border border-primary-border bg-primary-soft p-6">
        <h2 className="text-sm font-semibold text-primary-strong">
          {textos.inicio.privacidadeTitulo}
        </h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-primary-strong/85">
          {textos.inicio.privacidadeTexto}
        </p>
      </section>
    </div>
  )
}
