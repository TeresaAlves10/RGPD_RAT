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
import type { LinhaRelatorioImportacaoLegado } from '@/io/excel/importador-legado'

interface RelatorioImportacaoLegadoProps {
  linhas: LinhaRelatorioImportacaoLegado[]
  onAdicionar: () => void
  onFechar: () => void
}

export function RelatorioImportacaoLegado({ linhas, onAdicionar, onFechar }: RelatorioImportacaoLegadoProps) {
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{textos.importar.tituloRelatorio}</DialogTitle>
          <DialogDescription>{textos.importar.descricaoRelatorio}</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2">{textos.importar.colunaLinha}</th>
                <th className="p-2">{textos.importar.colunaNome}</th>
                <th className="p-2">{textos.importar.colunaMapeados}</th>
                <th className="p-2">{textos.importar.colunaPorPreencher}</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.linhaOrigem} className="border-t border-border align-top">
                  <td className="p-2">{linha.linhaOrigem}</td>
                  <td className="p-2">{linha.nomeTratamento}</td>
                  <td className="p-2 text-muted-foreground">{linha.camposMapeados.join(', ')}</td>
                  <td className="p-2 text-destructive">{linha.camposPorPreencher.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            {textos.importar.botaoFechar}
          </Button>
          <Button onClick={onAdicionar}>{textos.importar.botaoAdicionar(linhas.length)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
