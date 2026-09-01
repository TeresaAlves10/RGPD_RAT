import type { Migrador } from '@/domain/migrations/types'

/**
 * v8 -> v9: dois novos campos comuns às duas qualidades, ambos opcionais —
 * "Acesso ao Produto / Sistema" (texto livre) e "Política de Privacidade"
 * (texto livre, com anexos próprios). Nenhum dado anterior muda de forma;
 * os dois campos ficam por preencher em registos migrados.
 */
export const migradorV8ParaV9: Migrador = {
  de: 8,
  migrar(dados) {
    return { ...dados, schemaVersion: 9 }
  },
}
