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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={aExportar !== null} onClick={() => exportar('json')}>
          {aExportar === 'json' ? textos.exportar.aExportar : textos.exportar.botaoJson}
        </Button>
        <Button variant="outline" disabled={aExportar !== null} onClick={() => exportar('excel')}>
          {aExportar === 'excel' ? textos.exportar.aExportar : textos.exportar.botaoExcel}
        </Button>
        <Button variant="outline" disabled={aExportar !== null} onClick={() => exportar('pdf')}>
          {aExportar === 'pdf' ? textos.exportar.aExportar : textos.exportar.botaoPdf}
        </Button>
      </div>
      {erro ? <p className="text-sm text-destructive">{textos.exportar.erro}</p> : null}
    </div>
  )
}
