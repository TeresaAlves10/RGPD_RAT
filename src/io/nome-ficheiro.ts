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

/** Nome de ficheiro comum aos três formatos de exportação (JSON/Excel/PDF). */
export function nomeBaseFicheiro(ficheiro: FicheiroRat): string {
  const data = ficheiro.metadados.dataUltimaEdicao.slice(0, 10)
  const equipa = slug(ficheiro.metadados.equipa) || 'rat'
  return `rat-${equipa}-${data}`
}
