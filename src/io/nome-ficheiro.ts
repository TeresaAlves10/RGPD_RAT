import type { FicheiroRat } from '@/domain/schema/ficheiro'

/** Marcas diacríticas combinadas (U+0300–U+036F), produzidas por normalize('NFD'). */
const MARCAS_DIACRITICAS = /[̀-ͯ]/g

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(MARCAS_DIACRITICAS, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Nome de ficheiro comum aos formatos de exportação (JSON/Excel/PDF/Word). */
export function nomeBaseFicheiro(ficheiro: FicheiroRat): string {
  const data = ficheiro.metadados.dataUltimaEdicao.slice(0, 10)
  const equipa = slug(ficheiro.metadados.equipa) || 'rat'
  // Um só registo no ficheiro exportado — por seleção de "registo
  // específico" na barra de exportação, ou porque o ficheiro só tinha um —
  // identifica-se no nome, em vez de ficar indistinguível de uma exportação
  // completa.
  const sufixoRegisto =
    ficheiro.registos.length === 1 ? `-registo-${ficheiro.registos[0].numero}` : ''
  return `rat-${equipa}-${data}${sufixoRegisto}`
}
