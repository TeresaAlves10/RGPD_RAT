import type { Migrador } from '@/domain/migrations/types'

/**
 * v3 -> v4: acrescenta os campos da matriz completa do levantamento
 * (`matriz` no responsável) e os campos da folha "Subcontratante" ao
 * registo de subcontratado.
 *
 * Não há nada a preencher: todos os campos novos são opcionais e a sua
 * ausência significa "por responder", que é exatamente o estado de um
 * ficheiro v3. A migração limita-se a marcar a versão.
 */
export const migradorV3ParaV4: Migrador = {
  de: 3,
  migrar(dados) {
    return { ...dados, schemaVersion: 4 }
  },
}
