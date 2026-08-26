import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { exportarJson } from '@/io/json/exportar'

type Formato = 'json' | 'excel' | 'pdf'

/**
 * O download nunca é bloqueado por erros de validação (CLAUDE.md §7) — os
 * três formatos exportam sempre, mesmo com erros/avisos por resolver.
 */
export function BarraExportacao() {
  const { ficheiro } = useFicheiro()
  const [aExportar, setAExportar] = useState<Formato | null>(null)
  const [erro, setErro] = useState(false)

  async function exportar(formato: Formato) {
    setErro(false)
    setAExportar(formato)
    try {
      if (formato === 'json') {
        exportarJson(ficheiro)
      } else if (formato === 'excel') {
        const { exportarExcel } = await import('@/io/excel/exportar')
        await exportarExcel(ficheiro)
      } else {
        const { exportarPdf } = await import('@/io/pdf/exportar')
        await exportarPdf(ficheiro)
      }
    } catch {
      setErro(true)
    } finally {
      setAExportar(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {textos.exportar.titulo}
      </span>
      <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('json')}>
        {aExportar === 'json' ? textos.exportar.aExportar : 'JSON'}
      </Button>
      <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('excel')}>
        {aExportar === 'excel' ? textos.exportar.aExportar : 'Excel'}
      </Button>
      <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('pdf')}>
        {aExportar === 'pdf' ? textos.exportar.aExportar : 'PDF'}
      </Button>
      {erro ? <p className="text-sm text-destructive">{textos.exportar.erro}</p> : null}
    </div>
  )
}
