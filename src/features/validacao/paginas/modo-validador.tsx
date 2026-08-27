import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import { avaliarFicheiro } from '@/domain/rules/motor'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { AnotacaoCampo, EstadoRegisto } from '@/domain/schema/comum'
import type { Registo } from '@/domain/schema/registo'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { exportarJson } from '@/io/json/exportar'
import { CartaoRegisto } from '@/features/validacao/cartao-registo'

interface EntradaSessao {
  id: string
  nomeFicheiro: string
  ficheiro: FicheiroRat
}

async function interpretarFicheiroImportado(ficheiroSelecionado: File): Promise<FicheiroRat> {
  if (ficheiroSelecionado.name.toLowerCase().endsWith('.json')) {
    const { interpretarJson } = await import('@/io/json/importar')
    return interpretarJson(await ficheiroSelecionado.text())
  }
  const { importarExcelNativo } = await import('@/io/excel/importar')
  return importarExcelNativo(await ficheiroSelecionado.arrayBuffer())
}

export function ModoValidador() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessao, setSessao] = useState<EntradaSessao[]>([])
  const [entradaSelecionadaId, setEntradaSelecionadaId] = useState<string | null>(null)
  const [aImportar, setAImportar] = useState(false)
  const [errosImportacao, setErrosImportacao] = useState<string[]>([])
  const [aExportar, setAExportar] = useState<string | null>(null)
  const [nomeValidador, setNomeValidador] = useState('')
  const navigate = useNavigate()
  const { definirFicheiro } = useFicheiro()

  const resumo = useMemo(
    () =>
      sessao.map((entrada) => {
        const ocorrencias = avaliarFicheiro(entrada.ficheiro)
        return {
          ...entrada,
          nRegistos: entrada.ficheiro.registos.length,
          nErros: ocorrencias.filter((o) => o.severidade === 'erro').length,
          nAvisos: ocorrencias.filter((o) => o.severidade === 'aviso').length,
        }
      }),
    [sessao],
  )

  const entradaSelecionada = sessao.find((e) => e.id === entradaSelecionadaId) ?? null
  const ocorrenciasSelecionada = useMemo(
    () => (entradaSelecionada ? avaliarFicheiro(entradaSelecionada.ficheiro) : []),
    [entradaSelecionada],
  )

  async function importarFicheiros(ficheiros: File[]) {
    setAImportar(true)
    setErrosImportacao([])
    const novasEntradas: EntradaSessao[] = []
    const erros: string[] = []
    for (const ficheiroSelecionado of ficheiros) {
      try {
        const ficheiro = await interpretarFicheiroImportado(ficheiroSelecionado)
        novasEntradas.push({ id: crypto.randomUUID(), nomeFicheiro: ficheiroSelecionado.name, ficheiro })
      } catch {
        erros.push(textos.validador.erroImportacao(ficheiroSelecionado.name))
      }
    }
    setSessao((atual) => [...atual, ...novasEntradas])
    setErrosImportacao(erros)
    setAImportar(false)
  }

  /** Aplica uma alteração a um registo de um dos ficheiros da sessão. */
  function alterarRegisto(entradaId: string, registoId: string, alterar: (r: Registo) => Registo) {
    setSessao((atual) =>
      atual.map((entrada) => {
        if (entrada.id !== entradaId) return entrada
        return {
          ...entrada,
          ficheiro: {
            ...entrada.ficheiro,
            registos: entrada.ficheiro.registos.map((registo) =>
              registo.id === registoId ? alterar(registo) : registo,
            ),
          },
        }
      }),
    )
  }

  function atualizarRegisto(
    entradaId: string,
    registoId: string,
    atualizar: (a: AnotacaoCampo[]) => AnotacaoCampo[],
  ) {
    alterarRegisto(entradaId, registoId, (registo) => ({
      ...registo,
      anotacoes: atualizar(registo.anotacoes ?? []),
    }))
  }

  /**
   * Muda o estado do registo no circuito de validação. Ao validar,
   * regista-se quem validou e quando, para essa informação viajar dentro
   * do ficheiro devolvido à equipa.
   */
  function mudarEstado(entradaId: string, registoId: string, estado: EstadoRegisto) {
    alterarRegisto(entradaId, registoId, (registo) => ({
      ...registo,
      estado,
      validacao:
        estado === 'validado'
          ? { validadoPor: nomeValidador.trim() || undefined, data: new Date().toISOString() }
          : undefined,
    }))
  }

  async function exportar(entrada: EntradaSessao, formato: 'json' | 'excel' | 'pdf') {
    setAExportar(entrada.id)
    try {
      if (formato === 'json') {
        exportarJson(entrada.ficheiro)
      } else if (formato === 'excel') {
        const { exportarExcel } = await import('@/io/excel/exportar')
        await exportarExcel(entrada.ficheiro)
      } else {
        const { exportarPdf } = await import('@/io/pdf/exportar')
        await exportarPdf(entrada.ficheiro)
      }
    } finally {
      setAExportar(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{textos.validador.titulo}</h1>
        <p className="text-sm text-muted-foreground">{textos.validador.descricao}</p>
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".json,.xlsx"
          className="hidden"
          onChange={(e) => {
            const ficheiros = Array.from(e.target.files ?? [])
            e.target.value = ''
            if (ficheiros.length > 0) void importarFicheiros(ficheiros)
          }}
        />
        <Button variant="outline" disabled={aImportar} onClick={() => inputRef.current?.click()}>
          {aImportar ? textos.validador.aImportar : textos.validador.botaoImportar}
        </Button>
        {errosImportacao.map((erro) => (
          <p key={erro} className="mt-1 text-sm text-destructive">
            {erro}
          </p>
        ))}
      </div>

      {entradaSelecionada ? (
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="self-start" onClick={() => setEntradaSelecionadaId(null)}>
            {textos.validador.botaoVoltarSessao}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={aExportar === entradaSelecionada.id}
              onClick={() => exportar(entradaSelecionada, 'json')}
            >
              {textos.exportar.botaoJson}
            </Button>
            <Button
              variant="outline"
              disabled={aExportar === entradaSelecionada.id}
              onClick={() => exportar(entradaSelecionada, 'excel')}
            >
              {textos.exportar.botaoExcel}
            </Button>
            <Button
              variant="outline"
              disabled={aExportar === entradaSelecionada.id}
              onClick={() => exportar(entradaSelecionada, 'pdf')}
            >
              {textos.exportar.botaoPdf}
            </Button>
            {/* Corrigir usa o formulário completo, que trabalha sobre o
                ficheiro em edição — por isso carrega-se lá o ficheiro
                inteiro em vez de editar a cópia da sessão. */}
            <Button
              variant="subtle"
              onClick={() => {
                if (!window.confirm(textos.validador.confirmarCorrigir)) return
                definirFicheiro(entradaSelecionada.ficheiro)
                navigate('/')
              }}
            >
              {textos.validador.botaoCorrigir}
            </Button>
          </div>
          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
            <Label htmlFor="nomeValidador">{textos.estado.campoValidadoPor}</Label>
            <Input
              id="nomeValidador"
              value={nomeValidador}
              onChange={(e) => setNomeValidador(e.target.value)}
            />
          </div>
          {entradaSelecionada.ficheiro.registos.map((registo) => (
            <CartaoRegisto
              key={registo.id}
              registo={registo}
              ocorrencias={ocorrenciasSelecionada.filter((o) => o.registoId === registo.id)}
              onAdicionarAnotacao={(anotacao) =>
                atualizarRegisto(entradaSelecionada.id, registo.id, (atuais) => [...atuais, anotacao])
              }
              onAlternarResolvida={(anotacaoId) =>
                atualizarRegisto(entradaSelecionada.id, registo.id, (atuais) =>
                  atuais.map((a) => (a.id === anotacaoId ? { ...a, resolvida: !a.resolvida } : a)),
                )
              }
              onMudarEstado={(estado) => mudarEstado(entradaSelecionada.id, registo.id, estado)}
            />
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold">{textos.validador.resumoSessaoTitulo}</h2>
          {resumo.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {textos.validador.semSessao}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-3">{textos.validador.colunaFicheiro}</th>
                    <th className="p-3">{textos.validador.colunaEquipa}</th>
                    <th className="p-3">{textos.validador.colunaRegistos}</th>
                    <th className="p-3">{textos.validador.colunaErros}</th>
                    <th className="p-3">{textos.validador.colunaAvisos}</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {resumo.map((entrada) => (
                    <tr key={entrada.id} className="border-t border-border">
                      <td className="p-3">{entrada.nomeFicheiro}</td>
                      <td className="p-3">{entrada.ficheiro.metadados.equipa}</td>
                      <td className="p-3">{entrada.nRegistos}</td>
                      <td className="p-3">
                        {entrada.nErros > 0 ? <Badge variant="destructive">{entrada.nErros}</Badge> : '0'}
                      </td>
                      <td className="p-3">
                        {entrada.nAvisos > 0 ? <Badge variant="outline">{entrada.nAvisos}</Badge> : '0'}
                      </td>
                      <td className="flex justify-end gap-2 p-3">
                        <Button size="sm" variant="outline" onClick={() => setEntradaSelecionadaId(entrada.id)}>
                          {textos.validador.botaoVerDetalhe}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSessao((atual) => atual.filter((e) => e.id !== entrada.id))}
                        >
                          {textos.validador.botaoRemoverDaSessao}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
