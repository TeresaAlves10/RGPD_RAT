import { useMemo, useRef, useState } from 'react'
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
import { WizardResponsavel } from '@/features/preenchimento/wizard-responsavel'
import { WizardSubcontratado } from '@/features/preenchimento/wizard-subcontratado'
import { PainelTotais } from '@/components/painel-totais'
import { EstadoRegistoBadge } from '@/components/estado-registo'
import { exportarJson } from '@/io/json/exportar'
import { CartaoRegisto } from '@/features/validacao/cartao-registo'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'

interface EntradaSessao {
  id: string
  nomeFicheiro: string
  ficheiro: FicheiroRat
}

/**
 * Id fixo do ficheiro que está a ser editado neste mesmo browser (o de
 * `useFicheiro()`). Sem servidor, é o único jeito de um registo "chegar"
 * ao validador sem passar por exportar/importar: se é o mesmo browser,
 * já está em memória — só falta mostrá-lo aqui.
 */
const ID_FICHEIRO_ATUAL = 'ficheiro-atual'

async function interpretarFicheiroImportado(ficheiroSelecionado: File): Promise<FicheiroRat> {
  if (ficheiroSelecionado.name.toLowerCase().endsWith('.json')) {
    const { interpretarJson } = await import('@/io/json/importar')
    return interpretarJson(await ficheiroSelecionado.text())
  }
  const { importarExcelNativo } = await import('@/io/excel/importar')
  return importarExcelNativo(await ficheiroSelecionado.arrayBuffer())
}

export function ModoValidador() {
  const { ficheiro, guardarRegisto: guardarNoFicheiroAtual } = useFicheiro()
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessao, setSessao] = useState<EntradaSessao[]>([])
  const [entradaSelecionadaId, setEntradaSelecionadaId] = useState<string | null>(null)
  const [aImportar, setAImportar] = useState(false)
  const [errosImportacao, setErrosImportacao] = useState<string[]>([])
  const [aExportar, setAExportar] = useState<string | null>(null)
  const [nomeValidador, setNomeValidador] = useState('')
  /** Registo aberto no formulário completo, para o validador corrigir. */
  const [registoEmEdicao, setRegistoEmEdicao] = useState<string | null>(null)

  /**
   * O ficheiro que está a ser editado neste browser (o mesmo do ecrã
   * "Registos") entra sempre na sessão do validador — sem isso, um registo
   * marcado "submetido" só apareceria aqui depois de exportar e reimportar,
   * o que não faz sentido quando é a mesma pessoa no mesmo browser.
   */
  const entradaAtual = useMemo<EntradaSessao>(
    () => ({ id: ID_FICHEIRO_ATUAL, nomeFicheiro: textos.validador.ficheiroAtual, ficheiro }),
    [ficheiro],
  )
  const todasEntradas = useMemo(() => [entradaAtual, ...sessao], [entradaAtual, sessao])

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

  const entradaSelecionada = todasEntradas.find((e) => e.id === entradaSelecionadaId) ?? null
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

  /**
   * Aplica uma alteração a um registo de um dos ficheiros da sessão. Para o
   * ficheiro deste browser, escreve de volta no ficheiro-context partilhado
   * com o ecrã "Registos" — não numa cópia local — para as duas vistas
   * nunca desalinharem.
   */
  function alterarRegisto(entradaId: string, registoId: string, alterar: (r: Registo) => Registo) {
    if (entradaId === ID_FICHEIRO_ATUAL) {
      const registo = ficheiro.registos.find((r) => r.id === registoId)
      if (registo) guardarNoFicheiroAtual(alterar(registo))
      return
    }
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

  const registoAberto = registoEmEdicao
    ? (entradaSelecionada?.ficheiro.registos.find((r) => r.id === registoEmEdicao) ?? null)
    : null

  /**
   * Registos submetidos em toda a sessão — é por aqui que o validador
   * começa, em vez de ter de abrir ficheiro a ficheiro.
   */
  const submetidos = useMemo(
    () =>
      todasEntradas.flatMap((entrada) =>
        entrada.ficheiro.registos
          .filter((registo) => registo.estado === 'submetido')
          .map((registo) => ({ entrada, registo })),
      ),
    [todasEntradas],
  )

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

      {entradaSelecionada && registoAberto ? (
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="self-start"
            onClick={() => setRegistoEmEdicao(null)}
          >
            {textos.validador.botaoVoltarRegistos}
          </Button>
          {/* O validador pode alterar qualquer campo, a qualquer momento:
              é o mesmo formulário do GP, a escrever no ficheiro da sessão. */}
          {registoAberto.tipoRegisto === 'responsavel' ? (
            <WizardResponsavel
              registoInicial={registoAberto}
              permiteValidar
              onGuardar={(registo) => {
                alterarRegisto(entradaSelecionada.id, registo.id, () => registo)
                setRegistoEmEdicao(null)
              }}
              onCancelar={() => setRegistoEmEdicao(null)}
            />
          ) : (
            <WizardSubcontratado
              registoInicial={registoAberto}
              permiteValidar
              onGuardar={(registo) => {
                alterarRegisto(entradaSelecionada.id, registo.id, () => registo)
                setRegistoEmEdicao(null)
              }}
              onCancelar={() => setRegistoEmEdicao(null)}
            />
          )}
        </div>
      ) : entradaSelecionada ? (
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="self-start" onClick={() => setEntradaSelecionadaId(null)}>
            {textos.validador.botaoVoltarSessao}
          </Button>
          <PainelTotais registos={entradaSelecionada.ficheiro.registos} />
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
              onEditar={() => setRegistoEmEdicao(registo.id)}
            />
          ))}
        </div>
      ) : (
        <>
          <PainelTotais registos={todasEntradas.flatMap((e) => e.ficheiro.registos)} />

          {submetidos.length > 0 ? (
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-semibold">{textos.validador.submetidosTitulo}</h2>
                <p className="text-sm text-muted-foreground">
                  {textos.validador.submetidosDescricao}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
                <Label htmlFor="nomeValidadorSessao">{textos.estado.campoValidadoPor}</Label>
                <Input
                  id="nomeValidadorSessao"
                  value={nomeValidador}
                  onChange={(e) => setNomeValidador(e.target.value)}
                />
              </div>
              <ul className="flex flex-col gap-2">
                {submetidos.map(({ entrada, registo }) => (
                  <li
                    key={registo.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">
                        {registo.numero}. {registo.nomeTratamento}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entrada.ficheiro.metadados.equipa} · {entrada.nomeFicheiro} ·{' '}
                        {registo.gestorProjeto.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EstadoRegistoBadge estado={registo.estado} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEntradaSelecionadaId(entrada.id)
                          setRegistoEmEdicao(registo.id)
                        }}
                      >
                        {textos.validador.botaoRever}
                      </Button>
                      {/* Validar direto da lista: o caso comum é o registo
                          estar bom e não precisar de passar pelo formulário. */}
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => mudarEstado(entrada.id, registo.id, 'validado')}
                      >
                        {textos.estado.validar}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => mudarEstado(entrada.id, registo.id, 'devolvido')}
                      >
                        {textos.estado.devolver}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

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
