import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { rotuloUnidade } from '@/config/organizacao'
import { PainelTotais } from '@/components/painel-totais'
import { BarraExportacao } from '@/features/preenchimento/barra-exportacao'
import { BarraImportacao } from '@/features/preenchimento/barra-importacao'
import { avaliarFicheiro } from '@/domain/rules/motor'
import { registoSchema, type Registo } from '@/domain/schema/registo'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'
import { EstadoRegistoBadge } from '@/components/estado-registo'

interface EstadoRegisto {
  erros: number
  avisos: number
  /** Mensagens concretas do que falta, para o bloco de atenção. */
  mensagens: string[]
}

const ESTADO_VAZIO: EstadoRegisto = { erros: 0, avisos: 0, mensagens: [] }

export function ListaRegistos() {
  const navigate = useNavigate()
  const { ficheiro, removerRegisto, definirMetadados, definirFicheiro } = useFicheiro()

  const [pesquisa, setPesquisa] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCompletude, setFiltroCompletude] = useState('')
  const [filtroQualidade, setFiltroQualidade] = useState('')
  const [filtroDirecao, setFiltroDirecao] = useState('')

  const estadoPorRegisto = useMemo(() => {
    const mapa = new Map<string, EstadoRegisto>()

    for (const ocorrencia of avaliarFicheiro(ficheiro)) {
      if (!ocorrencia.registoId) continue
      const atual = mapa.get(ocorrencia.registoId) ?? { erros: 0, avisos: 0, mensagens: [] }
      if (ocorrencia.severidade === 'erro') atual.erros += 1
      else atual.avisos += 1
      atual.mensagens.push(ocorrencia.mensagem)
      mapa.set(ocorrencia.registoId, atual)
    }

    // Campos obrigatórios em falta (ex.: registos importados do template
    // antigo) contam como erros, ao lado das regras de negócio.
    for (const registo of ficheiro.registos) {
      const resultado = registoSchema.safeParse(registo)
      if (resultado.success) continue
      const atual = mapa.get(registo.id) ?? { erros: 0, avisos: 0, mensagens: [] }
      atual.erros += resultado.error.issues.length
      for (const problema of resultado.error.issues) {
        atual.mensagens.push(problema.message)
      }
      mapa.set(registo.id, atual)
    }

    return mapa
  }, [ficheiro])

  const direcoes = useMemo(
    () => [...new Set(ficheiro.registos.map((r) => r.direcao).filter(Boolean))].sort(),
    [ficheiro.registos],
  )

  const registosVisiveis = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase()
    return ficheiro.registos.filter((registo) => {
      const estado = estadoPorRegisto.get(registo.id) ?? ESTADO_VAZIO

      if (termo) {
        const alvo = [registo.nomeTratamento, registo.direcao, registo.unidadeCoordenacao ?? '']
          .join(' ')
          .toLowerCase()
        if (!alvo.includes(termo)) return false
      }
      if (filtroQualidade && registo.tipoRegisto !== filtroQualidade) return false
      if (filtroDirecao && registo.direcao !== filtroDirecao) return false
      if (filtroEstado && registo.estado !== filtroEstado) return false
      if (filtroCompletude === 'completo' && estado.erros > 0) return false
      if (filtroCompletude === 'incompleto' && estado.erros === 0) return false
      return true
    })
  }, [
    ficheiro.registos,
    estadoPorRegisto,
    pesquisa,
    filtroQualidade,
    filtroDirecao,
    filtroEstado,
    filtroCompletude,
  ])

  const resumo = useMemo(() => {
    let prontos = 0
    let avisos = 0
    let erros = 0
    for (const registo of ficheiro.registos) {
      const estado = estadoPorRegisto.get(registo.id) ?? ESTADO_VAZIO
      if (estado.erros > 0) erros += 1
      else if (estado.avisos > 0) avisos += 1
      else prontos += 1
    }
    return { prontos, avisos, erros }
  }, [ficheiro.registos, estadoPorRegisto])

  const precisamAtencao = useMemo(
    () =>
      ficheiro.registos
        .map((registo) => ({ registo, estado: estadoPorRegisto.get(registo.id) ?? ESTADO_VAZIO }))
        .filter((item) => item.estado.mensagens.length > 0)
        .slice(0, 3),
    [ficheiro.registos, estadoPorRegisto],
  )

  const temFiltros = Boolean(
    pesquisa || filtroEstado || filtroCompletude || filtroQualidade || filtroDirecao,
  )

  function nomeTipo(registo: Registo) {
    return registo.tipoRegisto === 'responsavel'
      ? textos.lista.tipoResponsavel
      : textos.lista.tipoSubcontratado
  }

  function aoRemover(id: string) {
    if (window.confirm(textos.lista.confirmarRemocao)) removerRegisto(id)
  }

  function aoCarregarExemplo() {
    if (ficheiro.registos.length > 0 && !window.confirm(textos.lista.confirmarCarregarExemplo)) {
      return
    }
    const agora = new Date().toISOString()
    const exemplo = structuredClone(ficheiroRatFixtureValido)
    definirFicheiro({
      ...exemplo,
      metadados: { ...exemplo.metadados, dataCriacao: agora, dataUltimaEdicao: agora },
    })
  }

  function limparFiltros() {
    setPesquisa('')
    setFiltroEstado('')
    setFiltroCompletude('')
    setFiltroQualidade('')
    setFiltroDirecao('')
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 lg:p-8">
      {/* Cabeçalho da página */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{textos.lista.titulo}</h1>
          <p className="text-sm text-muted-foreground">
            {textos.lista.subtitulo(ficheiro.registos.length)}
          </p>
        </div>
        <Button className="no-print" onClick={() => navigate('/registos/novo')}>
          {textos.lista.botaoNovoRegisto}
        </Button>
      </div>

      {/* Dados da equipa */}
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="metadados-equipa">{textos.lista.campoEquipa}</Label>
            <Input
              id="metadados-equipa"
              value={ficheiro.metadados.equipa}
              onChange={(e) => definirMetadados({ equipa: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="metadados-contacto">{textos.lista.campoContactoEquipa}</Label>
            <Input
              id="metadados-contacto"
              value={ficheiro.metadados.contacto ?? ''}
              onChange={(e) => definirMetadados({ contacto: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Importar / exportar — disponível também com o ficheiro vazio,
          porque importar é um dos pontos de entrada principais. */}
      <div className="no-print flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
        <BarraImportacao />
        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
        <BarraExportacao />
      </div>

      {ficheiro.registos.length > 0 ? (
        <>
          <PainelTotais registos={ficheiro.registos} />
          <p className="-mt-4 text-xs text-muted-foreground">{textos.totais.nota}</p>
          {/* Progresso do conjunto */}
          <div className="flex flex-col gap-3">
            <div className="flex h-2 gap-1 overflow-hidden rounded-full">
              {resumo.prontos > 0 ? (
                <div className="rounded-full bg-primary" style={{ flexGrow: resumo.prontos }} />
              ) : null}
              {resumo.avisos > 0 ? (
                <div className="rounded-full bg-warning" style={{ flexGrow: resumo.avisos }} />
              ) : null}
              {resumo.erros > 0 ? (
                <div className="rounded-full bg-border" style={{ flexGrow: resumo.erros }} />
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
                {textos.lista.resumoProntos(resumo.prontos)}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-warning" aria-hidden="true" />
                {textos.lista.resumoAvisos(resumo.avisos)}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-border" aria-hidden="true" />
                {textos.lista.resumoErros(resumo.erros)}
              </span>
            </div>
          </div>

          {/* Filtros */}
          <div className="no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              type="search"
              aria-label={textos.lista.pesquisar}
              placeholder={textos.lista.pesquisar}
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
            <Select
              aria-label={textos.estado.filtroTodos}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">{textos.estado.filtroTodos}</option>
              <option value="rascunho">{textos.estado.rascunho}</option>
              <option value="submetido">{textos.estado.submetido}</option>
              <option value="devolvido">{textos.estado.devolvido}</option>
              <option value="validado">{textos.estado.validado}</option>
            </Select>
            <Select
              aria-label={textos.lista.filtroTodasCompletudes}
              value={filtroCompletude}
              onChange={(e) => setFiltroCompletude(e.target.value)}
            >
              <option value="">{textos.lista.filtroTodasCompletudes}</option>
              <option value="completo">{textos.lista.estadoCompleto}</option>
              <option value="incompleto">{textos.lista.estadoIncompleto}</option>
            </Select>
            <Select
              aria-label={textos.lista.filtroTodasQualidades}
              value={filtroQualidade}
              onChange={(e) => setFiltroQualidade(e.target.value)}
            >
              <option value="">{textos.lista.filtroTodasQualidades}</option>
              <option value="responsavel">{textos.lista.tipoResponsavel}</option>
              <option value="subcontratado">{textos.lista.tipoSubcontratado}</option>
            </Select>
            <Select
              aria-label={textos.lista.filtroTodasDirecoes}
              value={filtroDirecao}
              onChange={(e) => setFiltroDirecao(e.target.value)}
            >
              <option value="">{textos.lista.filtroTodasDirecoes}</option>
              {direcoes.map((direcao) => (
                <option key={direcao} value={direcao}>
                  {direcao}
                </option>
              ))}
            </Select>
          </div>

          {/* Tabela */}
          {registosVisiveis.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">{textos.lista.semResultados}</p>
                <Button variant="outline" size="sm" onClick={limparFiltros}>
                  {textos.lista.limparFiltros}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full min-w-[64rem] text-left text-sm">
                <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">{textos.campos.numero}</th>
                    <th className="px-4 py-3 font-medium">{textos.lista.colunaNome}</th>
                    <th className="px-4 py-3 font-medium">{textos.lista.colunaTipo}</th>
                    <th className="px-4 py-3 font-medium">{textos.lista.colunaDirecao}</th>
                    <th className="px-4 py-3 font-medium">{textos.lista.colunaUnidade}</th>
                    <th className="px-4 py-3 font-medium">{textos.estado.etiqueta}</th>
                    <th className="px-4 py-3 font-medium">{textos.lista.colunaCamposEmFalta}</th>
                    <th className="no-print px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registosVisiveis.map((registo) => {
                    const estado = estadoPorRegisto.get(registo.id) ?? ESTADO_VAZIO
                    return (
                      <tr key={registo.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                          {registo.numero}
                        </td>
                        <td className="px-4 py-3 font-medium">{registo.nomeTratamento}</td>
                        <td className="px-4 py-3 text-muted-foreground">{nomeTipo(registo)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{registo.direcao}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {rotuloUnidade(registo.unidadeCoordenacao) || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <EstadoRegistoBadge estado={registo.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {estado.erros === 0 && estado.avisos === 0 ? (
                              <Badge variant="secondary">{textos.lista.estadoCompleto}</Badge>
                            ) : null}
                            {estado.erros > 0 ? (
                              <Badge variant="destructive">
                                {textos.lista.estadoErros(estado.erros)}
                              </Badge>
                            ) : null}
                            {estado.avisos > 0 ? (
                              <Badge variant="warning">
                                {textos.lista.estadoAvisos(estado.avisos)}
                              </Badge>
                            ) : null}
                            {(registo.anotacoes?.length ?? 0) > 0 ? (
                              <Badge variant="outline">
                                {textos.lista.estadoAnotacoes(registo.anotacoes?.length ?? 0)}
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="no-print px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/registos/${registo.id}/editar`)}
                            >
                              {textos.lista.botaoEditar}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => aoRemover(registo.id)}>
                              {textos.lista.botaoRemover}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {temFiltros ? (
            <button
              type="button"
              onClick={limparFiltros}
              className="no-print self-start text-sm font-medium text-primary hover:underline"
            >
              {textos.lista.limparFiltros}
            </button>
          ) : null}

          {/* O que falta, em concreto — ao fundo da página, depois da
              tabela: é a lista completa, não um resumo, por isso não devia
              ser a primeira coisa a competir com ela pela atenção. */}
          {precisamAtencao.length > 0 ? (
            <Card className="border-warning-border bg-warning-soft">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-warning">{textos.lista.atencaoTitulo}</p>
                  <p className="text-xs text-muted-foreground">{textos.lista.atencaoDescricao}</p>
                </div>
                <ul className="flex flex-col divide-y divide-warning-border/60">
                  {precisamAtencao.map(({ registo, estado }) => (
                    <li
                      key={registo.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{registo.nomeTratamento}</span>
                        <span className="text-sm text-muted-foreground">{estado.mensagens[0]}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="subtle"
                        className="no-print"
                        onClick={() => navigate(`/registos/${registo.id}/editar`)}
                      >
                        {textos.lista.atencaoResolver}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-medium">{textos.lista.semRegistos}</p>
              <p className="text-sm text-muted-foreground">{textos.lista.semRegistosSugestao}</p>
            </div>
            <div className="no-print flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate('/registos/novo')}>
                {textos.lista.botaoPrimeiroRegisto}
              </Button>
              <Button variant="outline" onClick={aoCarregarExemplo}>
                {textos.lista.botaoCarregarExemplo}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
