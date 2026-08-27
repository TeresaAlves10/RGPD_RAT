import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { textos } from '@/i18n/pt'

interface CartaoConceitoProps {
  conceito: string
  explicacao: string
  destaque?: boolean
  onEscolher: () => void
}

/** Um conceito e a sua explicação breve — sem exemplos nem perguntas. */
function CartaoConceito({ conceito, explicacao, destaque, onEscolher }: CartaoConceitoProps) {
  return (
    <Card className="flex flex-col transition-colors hover:border-primary-border">
      <CardContent className="flex flex-1 flex-col gap-5 p-6">
        <h2 className="text-lg font-semibold leading-snug">{conceito}</h2>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{explicacao}</p>
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
          explicacao={textos.escolhaTipo.responsavelDescricao}
          destaque
          onEscolher={() => navigate('/registos/novo/responsavel')}
        />
        <CartaoConceito
          conceito={textos.escolhaTipo.subcontratadoEtiqueta}
          explicacao={textos.escolhaTipo.subcontratadoDescricao}
          onEscolher={() => navigate('/registos/novo/subcontratado')}
        />
      </div>

      <Button variant="ghost" className="self-start" onClick={() => navigate('/')}>
        {textos.escolhaTipo.botaoCancelar}
      </Button>
    </div>
  )
}
