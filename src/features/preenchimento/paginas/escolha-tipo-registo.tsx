import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { textos } from '@/i18n/pt'

interface CartaoTipoProps {
  etiqueta: string
  titulo: string
  descricao: string
  exemplos: readonly string[]
  meta: string
  destaque?: boolean
  onEscolher: () => void
}

function CartaoTipo({
  etiqueta,
  titulo,
  descricao,
  exemplos,
  meta,
  destaque,
  onEscolher,
}: CartaoTipoProps) {
  return (
    <Card className="flex flex-col transition-colors hover:border-primary-border">
      <CardContent className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {etiqueta}
          </span>
          <h2 className="text-lg font-semibold leading-snug">{titulo}</h2>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>

        <div className="flex flex-col gap-2 rounded-md bg-muted p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {textos.escolhaTipo.exemplosTitulo}
          </span>
          <ul className="flex flex-col gap-1.5 text-sm text-foreground">
            {exemplos.map((exemplo) => (
              <li key={exemplo}>{exemplo}</li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">{meta}</span>
          <Button variant={destaque ? 'default' : 'outline'} onClick={onEscolher}>
            {textos.escolhaTipo.botaoContinuar}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function EscolhaTipoRegisto() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 lg:p-8">
      <div className="flex flex-col gap-3">
        <h1 className="max-w-2xl text-2xl font-semibold leading-snug tracking-tight">
          {textos.escolhaTipo.titulo}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {textos.escolhaTipo.descricao}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <CartaoTipo
          destaque
          etiqueta={textos.escolhaTipo.responsavelEtiqueta}
          titulo={textos.escolhaTipo.responsavelTitulo}
          descricao={textos.escolhaTipo.responsavelDescricao}
          exemplos={textos.escolhaTipo.responsavelExemplos}
          meta={textos.escolhaTipo.responsavelMeta}
          onEscolher={() => navigate('/registos/novo/responsavel')}
        />
        <CartaoTipo
          etiqueta={textos.escolhaTipo.subcontratadoEtiqueta}
          titulo={textos.escolhaTipo.subcontratadoTitulo}
          descricao={textos.escolhaTipo.subcontratadoDescricao}
          exemplos={textos.escolhaTipo.subcontratadoExemplos}
          meta={textos.escolhaTipo.subcontratadoMeta}
          onEscolher={() => navigate('/registos/novo/subcontratado')}
        />
      </div>

      <div className="flex gap-4 rounded-lg border border-primary-border bg-primary-soft p-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7" />
          <path d="M12 17.5h.01" />
        </svg>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{textos.escolhaTipo.duvidaTitulo}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {textos.escolhaTipo.duvidaTexto}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {textos.escolhaTipo.duvidaNota}
          </p>
        </div>
      </div>

      <Button variant="ghost" className="self-start" onClick={() => navigate('/')}>
        {textos.escolhaTipo.botaoCancelar}
      </Button>
    </div>
  )
}
