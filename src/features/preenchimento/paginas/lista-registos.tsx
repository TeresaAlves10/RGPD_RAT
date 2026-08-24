import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { BarraExportacao } from '@/features/preenchimento/barra-exportacao'
import { BarraImportacao } from '@/features/preenchimento/barra-importacao'
import { avaliarFicheiro } from '@/domain/rules/motor'
import { registoSchema, type Registo } from '@/domain/schema/registo'

export function ListaRegistos() {
  const navigate = useNavigate()
  const { ficheiro, removerRegisto, definirMetadados } = useFicheiro()

  const ocorrenciasPorRegisto = useMemo(() => {
    const todas = avaliarFicheiro(ficheiro)
    const mapa = new Map<string, { erros: number; avisos: number }>()
    for (const ocorrencia of todas) {
      if (!ocorrencia.registoId) continue
      const atual = mapa.get(ocorrencia.registoId) ?? { erros: 0, avisos: 0 }
      if (ocorrencia.severidade === 'erro') atual.erros += 1
      else atual.avisos += 1
      mapa.set(ocorrencia.registoId, atual)
    }
    // Campos obrigatórios em falta (ex.: registos importados do template
    // antigo, ainda "por preencher") contam como erros também, ao lado
    // das regras de negócio do motor de regras.
    for (const registo of ficheiro.registos) {
      const resultado = registoSchema.safeParse(registo)
      if (!resultado.success) {
        const atual = mapa.get(registo.id) ?? { erros: 0, avisos: 0 }
        atual.erros += resultado.error.issues.length
        mapa.set(registo.id, atual)
      }
    }
    return mapa
  }, [ficheiro])

  function nomeTipo(registo: Registo) {
    return registo.tipoRegisto === 'responsavel' ? textos.lista.tipoResponsavel : textos.lista.tipoSubcontratado
  }

  function aoRemover(id: string) {
    if (window.confirm(textos.lista.confirmarRemocao)) {
      removerRegisto(id)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{textos.lista.metadadosTitulo}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="metadados-equipa">{textos.lista.campoEquipa}</Label>
            <Input
              id="metadados-equipa"
              value={ficheiro.metadados.equipa}
              onChange={(e) => definirMetadados({ equipa: e.target.value })}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="metadados-contacto">{textos.lista.campoContactoEquipa}</Label>
            <Input
              id="metadados-contacto"
              value={ficheiro.metadados.contacto ?? ''}
              onChange={(e) => definirMetadados({ contacto: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{textos.lista.titulo}</h1>
        <div className="no-print flex flex-wrap items-center gap-4">
          <BarraImportacao />
          <BarraExportacao />
          <Button onClick={() => navigate('/registos/novo')}>{textos.lista.botaoNovoRegisto}</Button>
        </div>
      </div>

      {ficheiro.registos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-medium">{textos.lista.semRegistos}</p>
            <p className="text-sm text-muted-foreground">{textos.lista.semRegistosSugestao}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3">{textos.lista.colunaNome}</th>
                <th className="p-3">{textos.lista.colunaTipo}</th>
                <th className="p-3">{textos.lista.colunaDirecao}</th>
                <th className="p-3">{textos.lista.colunaEstado}</th>
                <th className="no-print p-3" />
              </tr>
            </thead>
            <tbody>
              {ficheiro.registos.map((registo) => {
                const ocorrencias = ocorrenciasPorRegisto.get(registo.id)
                return (
                  <tr key={registo.id} className="border-t border-border">
                    <td className="p-3">{registo.nomeTratamento}</td>
                    <td className="p-3">{nomeTipo(registo)}</td>
                    <td className="p-3">{registo.direcao}</td>
                    <td className="p-3">
                      {!ocorrencias || (ocorrencias.erros === 0 && ocorrencias.avisos === 0) ? (
                        <Badge variant="secondary">{textos.lista.estadoSemProblemas}</Badge>
                      ) : (
                        <div className="flex gap-1">
                          {ocorrencias.erros > 0 ? (
                            <Badge variant="destructive">{textos.lista.estadoErros(ocorrencias.erros)}</Badge>
                          ) : null}
                          {ocorrencias.avisos > 0 ? (
                            <Badge variant="outline">{textos.lista.estadoAvisos(ocorrencias.avisos)}</Badge>
                          ) : null}
                        </div>
                      )}
                      {(registo.anotacoes?.length ?? 0) > 0 ? (
                        <div className="mt-1">
                          <Badge variant="secondary">
                            {textos.lista.estadoAnotacoes(registo.anotacoes?.length ?? 0)}
                          </Badge>
                        </div>
                      ) : null}
                    </td>
                    <td className="no-print flex justify-end gap-2 p-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/registos/${registo.id}/editar`)}>
                        {textos.lista.botaoEditar}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => aoRemover(registo.id)}>
                        {textos.lista.botaoRemover}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
