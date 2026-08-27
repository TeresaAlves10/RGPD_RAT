import { Button } from '@/components/ui/button'
import { EstadoRegistoBadge } from '@/components/estado-registo'
import { textos } from '@/i18n/pt'
import type { EstadoRegisto } from '@/domain/schema/comum'
import type { Ocorrencia } from '@/domain/rules/types'

interface AcoesEstadoProps {
  estado: EstadoRegisto
  onMudar: (estado: EstadoRegisto) => void
  /** Erros por resolver: enquanto existirem, não se pode submeter. */
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
 * é a pessoa exportar o ficheiro e mandá-lo. Submeter é a única ação
 * bloqueada por erros de preenchimento — guardar e exportar nunca são.
 */
export function AcoesEstado({ estado, onMudar, erros = [], permiteValidar }: AcoesEstadoProps) {
  const podeSubmeter = erros.length === 0

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

      {!podeSubmeter && (estado === 'rascunho' || estado === 'devolvido') ? (
        <p className="text-xs text-muted-foreground">
          {textos.estado.submeterBloqueado} ({erros.length}).
        </p>
      ) : null}
    </div>
  )
}
