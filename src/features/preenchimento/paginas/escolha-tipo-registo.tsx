import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { textos } from '@/i18n/pt'

interface CartaoConceitoProps {
  conceito: string
  definicao: string
  baseLegal: string
  destaque?: boolean
  onEscolher: () => void
}

/** O conceito, a definição do RGPD e o artigo de onde vem. */
function CartaoConceito({
  conceito,
  definicao,
  baseLegal,
  destaque,
  onEscolher,
}: CartaoConceitoProps) {
  return (
    <Card className="flex flex-col transition-colors hover:border-primary-border">
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold leading-snug">{conceito}</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            RGPD · {baseLegal}
          </span>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{definicao}</p>
        <Button
          className="self-start"
          variant={destaque ? 'default' : 'outline'}
          onClick={onEscolher}
        >
          {textos.escolhaTipo.botaoContinuar}
        </Button>
      </CardContent>
    </Card>
  )
}

export function EscolhaTipoRegisto() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{textos.escolhaTipo.titulo}</h1>
        <p className="text-sm text-muted-foreground">{textos.escolhaTipo.descricao}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <CartaoConceito
          conceito={textos.escolhaTipo.responsavelEtiqueta}
          definicao={textos.escolhaTipo.responsavelDescricao}
          baseLegal={textos.escolhaTipo.responsavelBaseLegal}
          destaque
          onEscolher={() => navigate('/registos/novo/responsavel')}
        />
        <CartaoConceito
          conceito={textos.escolhaTipo.subcontratadoEtiqueta}
          definicao={textos.escolhaTipo.subcontratadoDescricao}
          baseLegal={textos.escolhaTipo.subcontratadoBaseLegal}
          onEscolher={() => navigate('/registos/novo/subcontratado')}
        />
      </div>

      <Button variant="ghost" className="self-start" onClick={() => navigate('/registos')}>
        {textos.escolhaTipo.botaoCancelar}
      </Button>
    </div>
  )
}
