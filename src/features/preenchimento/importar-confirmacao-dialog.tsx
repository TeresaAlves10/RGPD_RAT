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

interface ImportarConfirmacaoDialogProps {
  onSubstituir: () => void
  onAdicionar: () => void
  onCancelar: () => void
}

/**
 * Decisão obrigatória antes de importar sobre um ficheiro que já tem
 * registos: substituir tudo (como era o único caminho antes) ou juntar
 * os novos registos aos existentes.
 */
export function ImportarConfirmacaoDialog({
  onSubstituir,
  onAdicionar,
  onCancelar,
}: ImportarConfirmacaoDialogProps) {
  return (
    <Dialog open modal onOpenChange={(aberto) => !aberto && onCancelar()}>
      <DialogContent role="alertdialog">
        <DialogHeader>
          <DialogTitle>{textos.importar.confirmarTitulo}</DialogTitle>
          <DialogDescription>{textos.importar.confirmarDescricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancelar}>
            {textos.importar.botaoCancelarImportacao}
          </Button>
          <Button variant="outline" onClick={onSubstituir}>
            {textos.importar.botaoSubstituir}
          </Button>
          <Button onClick={onAdicionar}>{textos.importar.botaoAdicionarAosExistentes}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
