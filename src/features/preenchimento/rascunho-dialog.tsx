import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
    <Dialog open modal>
      <DialogContent
        role="alertdialog"
        // Decisão obrigatória: não fecha ao clicar fora nem com Escape.
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{textos.rascunho.tituloDialogo}</DialogTitle>
          <DialogDescription>{textos.rascunho.mensagem(dataFormatada)}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{textos.rascunho.aviso}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onComecarNovo}>
            {textos.rascunho.botaoComecarNovo}
          </Button>
          <Button onClick={onContinuar}>{textos.rascunho.botaoContinuar}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
