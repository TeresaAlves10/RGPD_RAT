import type { FicheiroRat } from '@/domain/schema/ficheiro'
import { descarregarFicheiro } from '@/io/descarregar'
import { nomeBaseFicheiro } from '@/io/nome-ficheiro'

/** Serializa o ficheiro RAT para o formato JSON canónico (CLAUDE.md §7). */
export function serializarJson(ficheiro: FicheiroRat): string {
  return JSON.stringify(ficheiro, null, 2)
}

export function nomeFicheiroJson(ficheiro: FicheiroRat): string {
  return `${nomeBaseFicheiro(ficheiro)}.json`
}

export function exportarJson(ficheiro: FicheiroRat): void {
  const blob = new Blob([serializarJson(ficheiro)], { type: 'application/json' })
  descarregarFicheiro(nomeFicheiroJson(ficheiro), blob)
}
