import { rotuloUnidade } from '@/config/organizacao'
import { textos } from '@/i18n/pt'
import type { Contagem } from '@/domain/schema/comum'

/** Conversão de valores fechados para o texto que aparece no Excel e no PDF. */

/** Sim / Não / Não aplicável / Não sei — vazio quando por responder. */
export function rotuloResposta(valor: string | undefined): string {
  if (!valor) return ''
  const respostas = textos.respostas as Record<string, string>
  return respostas[valor] ?? valor
}

/**
 * Contagem: ordem de grandeza e, se existir, o número ou nota exata —
 * "Médio (centenas) — 240".
 */
export function rotuloEscala(contagem: Contagem | undefined): string {
  if (!contagem) return ''
  const escala = textos.escala as Record<string, string>
  const partes = [
    contagem.escala ? (escala[contagem.escala] ?? contagem.escala) : '',
    contagem.valor ?? '',
  ].filter(Boolean)
  return partes.join(' — ')
}

export { rotuloUnidade }
