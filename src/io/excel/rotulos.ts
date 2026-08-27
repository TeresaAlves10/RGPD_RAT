import { rotuloUnidade } from '@/config/organizacao'
import { textos } from '@/i18n/pt'

/** Conversão de valores fechados para o texto que aparece no Excel e no PDF. */

/** Sim / Não / Não aplicável / Não sei — vazio quando por responder. */
export function rotuloResposta(valor: string | undefined): string {
  if (!valor) return ''
  const respostas = textos.respostas as Record<string, string>
  return respostas[valor] ?? valor
}

/** Baixo (dezenas) / Médio (centenas) / Elevado (milhares). */
export function rotuloEscala(valor: string | undefined): string {
  if (!valor) return ''
  const escala = textos.escala as Record<string, string>
  return escala[valor] ?? valor
}

export { rotuloUnidade }
