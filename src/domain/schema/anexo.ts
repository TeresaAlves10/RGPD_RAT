import { z } from 'zod'

/**
 * Anexo de um registo (imagem, diagrama, Word, PDF).
 *
 * Como não há servidor (CLAUDE.md §2.2), o conteúdo viaja embebido no
 * próprio ficheiro, em base64. Isso obriga a limites: um ficheiro grande
 * torna o JSON/Excel pesado e estoira a quota do rascunho local. Os
 * limites são verificados na UI, no momento de anexar.
 */

/** Tamanho máximo de um anexo, em bytes (2 MB). */
export const TAMANHO_MAXIMO_ANEXO = 2 * 1024 * 1024

/** Tamanho máximo do conjunto de anexos de um registo, em bytes (6 MB). */
export const TAMANHO_MAXIMO_ANEXOS_REGISTO = 6 * 1024 * 1024

export const TIPOS_ANEXO_ACEITES =
  '.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.svg,.odt,.txt'

export const anexoSchema = z.object({
  id: z.uuid(),
  nome: z.string().min(1),
  /** MIME type comunicado pelo browser. */
  tipo: z.string().optional(),
  /** Tamanho em bytes do ficheiro original. */
  tamanho: z.number().int().nonnegative(),
  /** Conteúdo em base64, sem o prefixo `data:`. */
  conteudo: z.string(),
})
export type Anexo = z.infer<typeof anexoSchema>

export function tamanhoTotal(anexos: Anexo[] | undefined): number {
  return (anexos ?? []).reduce((total, anexo) => total + anexo.tamanho, 0)
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
