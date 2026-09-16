import type { FicheiroRat } from '@/domain/schema/ficheiro'

/**
 * Restringe o ficheiro a exportar a um único registo, para a opção
 * "registo específico" da barra de exportação. Com `registoId` a
 * `null`/omisso devolve o ficheiro completo, sem cópia — é o caminho
 * "todos os registos".
 */
export function filtrarParaExportacao(
  ficheiro: FicheiroRat,
  registoId?: string | null,
): FicheiroRat {
  if (!registoId) return ficheiro
  return { ...ficheiro, registos: ficheiro.registos.filter((r) => r.id === registoId) }
}
