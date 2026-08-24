import type { Registo } from '@/domain/schema/registo'
import type { FicheiroRat } from '@/domain/schema/ficheiro'

export type Severidade = 'erro' | 'aviso'

export interface Ocorrencia {
  regraId: string
  severidade: Severidade
  /** null só é possível para regras de âmbito "ficheiro" sem registo associado. */
  registoId: string | null
  campo: string
  mensagem: string
}

interface RegraComum {
  id: string
  severidade: Severidade
  /** Id do campo do schema a que a violação desta regra deve ser ancorada na UI. */
  campo: string
  descricao: string
}

/**
 * Regra avaliada isoladamente sobre um registo. `verificar` deve devolver
 * `true` quando a regra não se aplica ao registo (ex.: tipoRegisto errado)
 * ou quando se aplica e é cumprida — só `false` quando se aplica e falha.
 */
export interface RegraRegisto extends RegraComum {
  escopo: 'registo'
  verificar: (registo: Registo) => boolean
  mensagem: string | ((registo: Registo) => string)
}

/**
 * Regra avaliada sobre o ficheiro inteiro (ex.: duplicados entre registos).
 * `avaliar` devolve uma ocorrência por cada violação encontrada.
 */
export interface RegraFicheiro extends RegraComum {
  escopo: 'ficheiro'
  avaliar: (ficheiro: FicheiroRat) => Array<{ registoId: string | null; mensagem: string }>
}

export type Regra = RegraRegisto | RegraFicheiro
