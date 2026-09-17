import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { textos } from '@/i18n/pt'
import { rotuloUnidade } from '@/config/organizacao'
import type { Registo } from '@/domain/schema/registo'
import { EstadoRegistoBadge } from '@/components/estado-registo'
import { ESTADO_VAZIO, type EstadoRegisto } from '@/features/preenchimento/estado-por-registo'

function nomeTipo(registo: Registo) {
  return registo.tipoRegisto === 'responsavel'
    ? textos.lista.tipoResponsavel
    : textos.lista.tipoSubcontratado
}

interface TabelaRegistosProps {
  registos: Registo[]
  estadoPorRegisto: Map<string, EstadoRegisto>
  onEditar: (id: string) => void
  /** Sem esta prop, a coluna de ações mostra só "Editar". */
  onRemover?: (id: string) => void
}

/**
 * Tabela de registos partilhada entre o ecrã "Registos" e a vista do
 * gestor de projeto — mesmas colunas, mesma lógica de badges, para as
 * duas vistas nunca divergirem por acidente.
 */
export function TabelaRegistos({ registos, estadoPorRegisto, onEditar, onRemover }: TabelaRegistosProps) {
  return (
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
          {registos.map((registo) => {
            const estado = estadoPorRegisto.get(registo.id) ?? ESTADO_VAZIO
            return (
              <tr key={registo.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{registo.numero}</td>
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
                      <Badge variant="destructive">{textos.lista.estadoErros(estado.erros)}</Badge>
                    ) : null}
                    {estado.avisos > 0 ? (
                      <Badge variant="warning">{textos.lista.estadoAvisos(estado.avisos)}</Badge>
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
                    <Button size="sm" variant="outline" onClick={() => onEditar(registo.id)}>
                      {textos.lista.botaoEditar}
                    </Button>
                    {onRemover ? (
                      <Button size="sm" variant="ghost" onClick={() => onRemover(registo.id)}>
                        {textos.lista.botaoRemover}
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
