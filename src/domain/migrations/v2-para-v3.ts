import type { Migrador } from '@/domain/migrations/types'

/**
 * v2 -> v3: adiciona `estado` a cada registo (marcador local de rascunho /
 * pronto a enviar / validado pelo DPO). Registos v2 não têm estado; entram
 * como "rascunho", que é o estado mais conservador — nunca dá por
 * concluído o que ninguém deu.
 *
 * O campo `avaliacao` (módulo de controlos) é opcional e não precisa de
 * ser preenchido na migração: a sua ausência significa "módulo não
 * ativado", que é exatamente o estado de um ficheiro v2.
 */
export const migradorV2ParaV3: Migrador = {
  de: 2,
  migrar(dados) {
    const registos = Array.isArray(dados.registos) ? dados.registos : []
    return {
      ...dados,
      schemaVersion: 3,
      registos: registos.map((registo) =>
        registo && typeof registo === 'object' && !('estado' in registo)
          ? { ...registo, estado: 'rascunho' }
          : registo,
      ),
    }
  },
}
