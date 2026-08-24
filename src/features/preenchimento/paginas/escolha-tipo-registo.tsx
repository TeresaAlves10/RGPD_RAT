import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { textos } from '@/i18n/pt'

export function EscolhaTipoRegisto() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{textos.escolhaTipo.titulo}</h1>
        <p className="text-sm text-muted-foreground">{textos.escolhaTipo.descricao}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{textos.escolhaTipo.responsavelTitulo}</CardTitle>
            <CardDescription>{textos.escolhaTipo.responsavelDescricao}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/registos/novo/responsavel')}>
              {textos.escolhaTipo.botaoContinuar}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{textos.escolhaTipo.subcontratadoTitulo}</CardTitle>
            <CardDescription>{textos.escolhaTipo.subcontratadoDescricao}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/registos/novo/subcontratado')}>
              {textos.escolhaTipo.botaoContinuar}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" className="self-start" onClick={() => navigate('/')}>
        {textos.escolhaTipo.botaoCancelar}
      </Button>
    </div>
  )
}
