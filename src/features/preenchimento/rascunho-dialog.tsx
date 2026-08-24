import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { textos } from '@/i18n/pt'

const formatadorData = new Intl.DateTimeFormat('pt-PT', {
  dateStyle: 'short',
  timeStyle: 'short',
})

interface RascunhoDialogProps {
  guardadoEm: string
  onContinuar: () => void
  onComecarNovo: () => void
}

export function RascunhoDialog({ guardadoEm, onContinuar, onComecarNovo }: RascunhoDialogProps) {
  const dataFormatada = formatadorData.format(new Date(guardadoEm))

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="rascunho-dialogo-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle id="rascunho-dialogo-titulo">{textos.rascunho.tituloDialogo}</CardTitle>
          <CardDescription>{textos.rascunho.mensagem(dataFormatada)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{textos.rascunho.aviso}</p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={onComecarNovo}>
            {textos.rascunho.botaoComecarNovo}
          </Button>
          <Button onClick={onContinuar}>{textos.rascunho.botaoContinuar}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
