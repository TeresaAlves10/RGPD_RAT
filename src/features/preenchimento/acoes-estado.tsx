import { Button } from '@/components/ui/button'
import { EstadoRegistoBadge } from '@/components/estado-registo'
import { textos } from '@/i18n/pt'
import type { EstadoRegisto } from '@/domain/schema/comum'
import type { Ocorrencia } from '@/domain/rules/types'

interface AcoesEstadoProps {
  estado: EstadoRegisto
  onMudar: (estado: EstadoRegisto) => void
  /** Erros por resolver: mostrados como alerta, mas não impedem submeter. */
  erros?: Ocorrencia[]
  /** Só o modo validador pode validar ou devolver. */
  permiteValidar?: boolean
}

/**
 * Circuito do registo: o GP preenche e submete, o validador corrige e
 * valida (ou devolve).
 *
 * Não há servidor por trás disto (CLAUDE.md §2.2). O estado é um marcador
 * dentro do ficheiro: "submeter" marca o registo, e o envio ao validador
 * é a pessoa exportar o ficheiro e mandá-lo. Nenhuma ação é bloqueada por
 * erros de preenchimento — nem submeter, nem guardar, nem exportar.
 */
export function AcoesEstado({ estado, onMudar, erros = [], permiteValidar }: AcoesEstadoProps) {
  return (
    <div className="no-print flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{textos.estado.etiqueta}</span>
        <EstadoRegistoBadge estado={estado} />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{textos.estado.aviso}</p>

      <div className="flex flex-wrap items-center gap-2">
        {/* Submeter vive na barra de ações do formulário, no fim das
            Observações Gerais — não aqui, para não haver dois botões
            iguais no mesmo ecrã. */}
        {estado === 'submetido' || estado === 'validado' ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => onMudar('rascunho')}>
            {textos.estado.reabrir}
          </Button>
        ) : null}

        {permiteValidar && estado !== 'validado' ? (
          <Button type="button" size="sm" variant="subtle" onClick={() => onMudar('validado')}>
            {textos.estado.validar}
          </Button>
        ) : null}

        {permiteValidar && estado === 'submetido' ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => onMudar('devolvido')}>
            {textos.estado.devolver}
          </Button>
        ) : null}
      </div>

      {erros.length > 0 && (estado === 'rascunho' || estado === 'devolvido') ? (
        <p className="text-xs text-muted-foreground">
          {textos.estado.camposPorPreencher} ({erros.length}).
        </p>
      ) : null}
    </div>
  )
}
