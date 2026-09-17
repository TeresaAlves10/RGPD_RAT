import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { ImportarConfirmacaoDialog } from '@/features/preenchimento/importar-confirmacao-dialog'

export function BarraImportacao() {
  const { ficheiro, definirFicheiro, adicionarRegistos } = useFicheiro()
  const inputRef = useRef<HTMLInputElement>(null)
  const [aImportar, setAImportar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  /** À espera de "substituir" ou "adicionar", quando já há registos no ficheiro. */
  const [ficheiroPendente, setFicheiroPendente] = useState<File | null>(null)

  async function processar(ficheiroSelecionado: File, modo: 'substituir' | 'adicionar') {
    setErro(null)
    setAImportar(true)
    try {
      const { importarExcelNativo } = await import('@/io/excel/importar')
      const buffer = await ficheiroSelecionado.arrayBuffer()
      const importado = await importarExcelNativo(buffer)
      if (modo === 'substituir') {
        definirFicheiro(importado)
      } else {
        adicionarRegistos(importado.registos)
      }
    } catch {
      setErro(textos.importar.erroGenerico)
    } finally {
      setAImportar(false)
    }
  }

  function aoEscolherFicheiro(ficheiroSelecionado: File) {
    setErro(null)
    if (ficheiro.registos.length > 0) {
      setFicheiroPendente(ficheiroSelecionado)
      return
    }
    void processar(ficheiroSelecionado, 'substituir')
  }

  function resolverPendente(modo: 'substituir' | 'adicionar') {
    const alvo = ficheiroPendente
    setFicheiroPendente(null)
    if (alvo) void processar(alvo, modo)
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
          if (ficheiroSelecionado) aoEscolherFicheiro(ficheiroSelecionado)
        }}
      />
      <Button size="sm" variant="outline" disabled={aImportar} onClick={() => inputRef.current?.click()}>
        {aImportar ? textos.importar.aImportar : textos.importar.botaoImportar}
      </Button>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
      {ficheiroPendente ? (
        <ImportarConfirmacaoDialog
          onSubstituir={() => resolverPendente('substituir')}
          onAdicionar={() => resolverPendente('adicionar')}
          onCancelar={() => setFicheiroPendente(null)}
        />
      ) : null}
    </div>
  )
}
