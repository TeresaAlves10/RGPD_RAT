import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'

export function BarraImportacao() {
  const { ficheiro, definirFicheiro } = useFicheiro()
  const inputRef = useRef<HTMLInputElement>(null)
  const [aImportar, setAImportar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function importar(ficheiroSelecionado: File) {
    setErro(null)
    if (ficheiro.registos.length > 0 && !window.confirm(textos.importar.confirmarSubstituicao)) {
      return
    }
    setAImportar(true)
    try {
      const { importarExcelNativo } = await import('@/io/excel/importar')
      const buffer = await ficheiroSelecionado.arrayBuffer()
      definirFicheiro(await importarExcelNativo(buffer))
    } catch {
      setErro(textos.importar.erroGenerico)
    } finally {
      setAImportar(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {textos.importar.titulo}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const ficheiroSelecionado = e.target.files?.[0]
          e.target.value = ''
          if (ficheiroSelecionado) void importar(ficheiroSelecionado)
        }}
      />
      <Button size="sm" variant="outline" disabled={aImportar} onClick={() => inputRef.current?.click()}>
        {aImportar ? textos.importar.aImportar : textos.importar.botaoImportar}
      </Button>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
    </div>
  )
}
