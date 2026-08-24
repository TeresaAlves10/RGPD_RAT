import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { RelatorioImportacaoLegado } from '@/features/preenchimento/relatorio-importacao-legado'
import type { Registo } from '@/domain/schema/registo'
import type { LinhaRelatorioImportacaoLegado } from '@/io/excel/importador-legado'

type Importacao = 'nativa' | 'legado' | null

export function BarraImportacao() {
  const { ficheiro, definirFicheiro, adicionarRegistos } = useFicheiro()
  const inputNativoRef = useRef<HTMLInputElement>(null)
  const inputLegadoRef = useRef<HTMLInputElement>(null)
  const [aImportar, setAImportar] = useState<Importacao>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [relatorioLegado, setRelatorioLegado] = useState<{
    registos: Registo[]
    linhas: LinhaRelatorioImportacaoLegado[]
  } | null>(null)

  async function importarNativo(ficheiroSelecionado: File) {
    setErro(null)
    if (ficheiro.registos.length > 0 && !window.confirm(textos.importar.confirmarSubstituicao)) {
      return
    }
    setAImportar('nativa')
    try {
      if (ficheiroSelecionado.name.toLowerCase().endsWith('.json')) {
        const { interpretarJson } = await import('@/io/json/importar')
        const texto = await ficheiroSelecionado.text()
        definirFicheiro(interpretarJson(texto))
      } else {
        const { importarExcelNativo } = await import('@/io/excel/importar')
        const buffer = await ficheiroSelecionado.arrayBuffer()
        definirFicheiro(await importarExcelNativo(buffer))
      }
    } catch {
      setErro(textos.importar.erroGenerico)
    } finally {
      setAImportar(null)
    }
  }

  async function importarLegado(ficheiroSelecionado: File) {
    setErro(null)
    setAImportar('legado')
    try {
      const { importarExcelLegado } = await import('@/io/excel/importador-legado')
      const buffer = await ficheiroSelecionado.arrayBuffer()
      const resultado = await importarExcelLegado(buffer)
      setRelatorioLegado({ registos: resultado.registos, linhas: resultado.relatorio })
    } catch {
      setErro(textos.importar.erroGenerico)
    } finally {
      setAImportar(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputNativoRef}
          type="file"
          accept=".json,.xlsx"
          className="hidden"
          onChange={(e) => {
            const ficheiroSelecionado = e.target.files?.[0]
            e.target.value = ''
            if (ficheiroSelecionado) void importarNativo(ficheiroSelecionado)
          }}
        />
        <Button
          variant="outline"
          disabled={aImportar !== null}
          onClick={() => inputNativoRef.current?.click()}
        >
          {aImportar === 'nativa' ? textos.importar.aImportar : textos.importar.botaoImportar}
        </Button>

        <input
          ref={inputLegadoRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const ficheiroSelecionado = e.target.files?.[0]
            e.target.value = ''
            if (ficheiroSelecionado) void importarLegado(ficheiroSelecionado)
          }}
        />
        <Button
          variant="outline"
          disabled={aImportar !== null}
          onClick={() => inputLegadoRef.current?.click()}
        >
          {aImportar === 'legado' ? textos.importar.aImportar : textos.importar.botaoImportarLegado}
        </Button>
      </div>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}

      {relatorioLegado ? (
        <RelatorioImportacaoLegado
          linhas={relatorioLegado.linhas}
          onFechar={() => setRelatorioLegado(null)}
          onAdicionar={() => {
            adicionarRegistos(relatorioLegado.registos)
            setRelatorioLegado(null)
          }}
        />
      ) : null}
    </div>
  )
}
