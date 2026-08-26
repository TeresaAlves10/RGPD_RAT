import { Button } from '@/components/ui/button'
import { EstadoRegistoBadge } from '@/components/estado-registo'
import { textos } from '@/i18n/pt'
import type { EstadoRegisto } from '@/domain/schema/comum'

interface AcoesEstadoProps {
  estado: EstadoRegisto
  onMudar: (estado: EstadoRegisto) => void
  /** O modo validador pode dar como validado; a equipa não. */
  permiteValidar?: boolean
}

/**
 * Mudança do estado do registo. Não é uma submissão: o estado é só um
 * marcador guardado dentro do ficheiro (CLAUDE.md §2.2 — sem servidor).
 */
export function AcoesEstado({ estado, onMudar, permiteValidar }: AcoesEstadoProps) {
  return (
    <div className="no-print flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{textos.estado.etiqueta}</span>
        <EstadoRegistoBadge estado={estado} />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{textos.estado.aviso}</p>

      <div className="flex flex-wrap gap-2">
        {estado !== 'pronto' ? (
          <Button type="button" size="sm" variant="outline" onClick={() => onMudar('pronto')}>
            {textos.estado.marcarPronto}
          </Button>
        ) : null}
        {estado !== 'rascunho' ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => onMudar('rascunho')}>
            {textos.estado.marcarRascunho}
          </Button>
        ) : null}
        {permiteValidar && estado !== 'validado' ? (
          <Button type="button" size="sm" variant="subtle" onClick={() => onMudar('validado')}>
            {textos.estado.marcarValidado}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
