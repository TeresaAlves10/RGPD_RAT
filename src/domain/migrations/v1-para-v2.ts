import type { Migrador } from '@/domain/migrations/types'

/**
 * v1 -> v2: adiciona `anotacoes` (anotações do DPO por campo, modo
 * validador — CLAUDE.md §11 fase 6) a cada registo. Ficheiros v1 não têm
 * este campo; passam a ter um array vazio.
 */
export const migradorV1ParaV2: Migrador = {
  de: 1,
  migrar(dados) {
    const registos = Array.isArray(dados.registos) ? dados.registos : []
    return {
      ...dados,
      schemaVersion: 2,
      registos: registos.map((registo) =>
        registo && typeof registo === 'object' && !('anotacoes' in registo)
          ? { ...registo, anotacoes: [] }
          : registo,
      ),
    }
  },
}
