import { Badge } from '@/components/ui/badge'
import { textos } from '@/i18n/pt'
import type { EstadoRegisto } from '@/domain/schema/comum'

const VARIANTE: Record<EstadoRegisto, 'outline' | 'warning' | 'secondary'> = {
  rascunho: 'outline',
  pronto: 'warning',
  validado: 'secondary',
}

export function etiquetaEstado(estado: EstadoRegisto): string {
  return textos.estado[estado]
}

/** Chip do estado do registo, com a mesma leitura em toda a aplicação. */
export function EstadoRegistoBadge({ estado }: { estado: EstadoRegisto }) {
  return <Badge variant={VARIANTE[estado]}>{etiquetaEstado(estado)}</Badge>
}
