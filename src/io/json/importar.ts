import { migrarParaVersaoAtual } from '@/domain/migrations'
import type { FicheiroRat } from '@/domain/schema/ficheiro'

/** Lê e migra (se necessário) o texto de um ficheiro JSON canónico. */
export function interpretarJson(texto: string): FicheiroRat {
  const dados: unknown = JSON.parse(texto)
  return migrarParaVersaoAtual(dados)
}
