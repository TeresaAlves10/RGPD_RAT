import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { exportarJson } from '@/io/json/exportar'
import { filtrarParaExportacao } from '@/io/filtrar-ficheiro'

type Formato = 'json' | 'excel' | 'pdf' | 'word'

/**
 * O download nunca é bloqueado por erros de validação (CLAUDE.md §7) — os
 * quatro formatos exportam sempre, mesmo com erros/avisos por resolver.
 *
 * O seletor de âmbito ("Todos os registos" ou um registo específico)
 * restringe o ficheiro exportado antes de gerar qualquer um dos formatos —
 * é o mesmo `FicheiroRat`, só que com `registos` filtrado a um.
 */
export function BarraExportacao() {
  const { ficheiro } = useFicheiro()
  const [registoId, setRegistoId] = useState('')
  const [aExportar, setAExportar] = useState<Formato | null>(null)
  const [erro, setErro] = useState(false)

  async function exportar(formato: Formato) {
    setErro(false)
    setAExportar(formato)
    try {
      const alvo = filtrarParaExportacao(ficheiro, registoId || null)
      if (formato === 'json') {
        exportarJson(alvo)
      } else if (formato === 'excel') {
        const { exportarExcel } = await import('@/io/excel/exportar')
        await exportarExcel(alvo)
      } else if (formato === 'pdf') {
        const { exportarPdf } = await import('@/io/pdf/exportar')
        await exportarPdf(alvo)
      } else {
        const { exportarWord } = await import('@/io/word/exportar')
        await exportarWord(alvo)
      }
    } catch {
      setErro(true)
    } finally {
      setAExportar(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {textos.exportar.titulo}
      </span>

      {ficheiro.registos.length > 0 ? (
        <div className="flex items-center gap-1.5">
          <Label htmlFor="exportar-escopo" className="sr-only">
            {textos.exportar.escopoLabel}
          </Label>
          <Select
            id="exportar-escopo"
            aria-label={textos.exportar.escopoLabel}
            value={registoId}
            onChange={(e) => setRegistoId(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">{textos.exportar.escopoTodos}</option>
            {ficheiro.registos.map((registo) => (
              <option key={registo.id} value={registo.id}>
                {registo.numero}. {registo.nomeTratamento || '—'}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('json')}>
          {aExportar === 'json' ? textos.exportar.aExportar : 'JSON'}
        </Button>
        <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('excel')}>
          {aExportar === 'excel' ? textos.exportar.aExportar : 'Excel'}
        </Button>
        <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('pdf')}>
          {aExportar === 'pdf' ? textos.exportar.aExportar : 'PDF'}
        </Button>
        <Button size="sm" variant="outline" disabled={aExportar !== null} onClick={() => exportar('word')}>
          {aExportar === 'word' ? textos.exportar.aExportar : 'Word'}
        </Button>
      </div>
      {erro ? <p className="text-sm text-destructive">{textos.exportar.erro}</p> : null}
    </div>
  )
}
