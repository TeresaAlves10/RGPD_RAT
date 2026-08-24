import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { textos } from '@/i18n/pt'
import type { LinhaRelatorioImportacaoLegado } from '@/io/excel/importador-legado'

interface RelatorioImportacaoLegadoProps {
  linhas: LinhaRelatorioImportacaoLegado[]
  onAdicionar: () => void
  onFechar: () => void
}

export function RelatorioImportacaoLegado({ linhas, onAdicionar, onFechar }: RelatorioImportacaoLegadoProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="relatorio-importacao-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <Card className="max-h-[85vh] w-full max-w-3xl overflow-y-auto">
        <CardHeader>
          <CardTitle id="relatorio-importacao-titulo">{textos.importar.tituloRelatorio}</CardTitle>
          <CardDescription>{textos.importar.descricaoRelatorio}</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={onFechar}>
            {textos.importar.botaoFechar}
          </Button>
          <Button onClick={onAdicionar}>{textos.importar.botaoAdicionar(linhas.length)}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
