import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { textos } from '@/i18n/pt'
import type { Registo } from '@/domain/schema/registo'
import type { AnotacaoCampo } from '@/domain/schema/comum'
import type { Ocorrencia } from '@/domain/rules/types'

interface CartaoRegistoProps {
  registo: Registo
  ocorrencias: Ocorrencia[]
  onAdicionarAnotacao: (anotacao: AnotacaoCampo) => void
  onAlternarResolvida: (anotacaoId: string) => void
}

function novaAnotacao(campo: string, texto: string): AnotacaoCampo {
  return {
    id: crypto.randomUUID(),
    campo,
    texto,
    data: new Date().toISOString(),
    resolvida: false,
  }
}

export function CartaoRegisto({
  registo,
  ocorrencias,
  onAdicionarAnotacao,
  onAlternarResolvida,
}: CartaoRegistoProps) {
  const [campoEmAnotacao, setCampoEmAnotacao] = useState<string | null>(null)
  const [textoAnotacao, setTextoAnotacao] = useState('')

  function iniciarAnotacao(campo: string) {
    setCampoEmAnotacao(campo)
    setTextoAnotacao('')
  }

  function guardarAnotacao() {
    if (!campoEmAnotacao || !textoAnotacao.trim()) return
    onAdicionarAnotacao(novaAnotacao(campoEmAnotacao, textoAnotacao.trim()))
    setCampoEmAnotacao(null)
    setTextoAnotacao('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{registo.nomeTratamento}</CardTitle>
        <p className="text-sm text-muted-foreground">{registo.direcao}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium">{textos.validador.ocorrenciasTitulo}</p>
          {ocorrencias.length === 0 ? (
            <p className="text-sm text-muted-foreground">{textos.validador.semOcorrencias}</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {ocorrencias.map((ocorrencia) => (
                <li key={`${ocorrencia.regraId}-${ocorrencia.campo}`} className="flex items-start justify-between gap-2 text-sm">
                  <span className={ocorrencia.severidade === 'erro' ? 'text-destructive' : ''}>
                    {ocorrencia.mensagem}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => iniciarAnotacao(ocorrencia.campo)}>
                    {textos.validador.botaoAnotar}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-sm font-medium">{textos.validador.anotacoesTitulo}</p>
          {(registo.anotacoes ?? []).length === 0 ? null : (
            <ul className="mt-2 flex flex-col gap-2">
              {(registo.anotacoes ?? []).map((anotacao) => (
                <li key={anotacao.id} className="rounded-md border border-border p-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">
                      {anotacao.campo === 'geral' ? textos.validador.campoGeral : anotacao.campo}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => onAlternarResolvida(anotacao.id)}>
                      {anotacao.resolvida ? textos.validador.marcarPorResolver : textos.validador.marcarResolvida}
                    </Button>
                  </div>
                  <p className={`mt-1 ${anotacao.resolvida ? 'text-muted-foreground line-through' : ''}`}>
                    {anotacao.texto}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {campoEmAnotacao ? (
            <div className="mt-2 flex flex-col gap-2">
              <Textarea
                autoFocus
                placeholder={textos.validador.placeholderAnotacao}
                value={textoAnotacao}
                onChange={(e) => setTextoAnotacao(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={guardarAnotacao}>
                  {textos.validador.botaoGuardarAnotacao}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCampoEmAnotacao(null)}>
                  {textos.validador.botaoCancelarAnotacao}
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-2" onClick={() => iniciarAnotacao('geral')}>
              {textos.validador.botaoAnotarGeral}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
