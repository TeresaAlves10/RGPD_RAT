import { SCHEMA_VERSION_ATUAL, ficheiroRatSchema, schemaVersionSchema } from '@/domain/schema/ficheiro'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import { migradorV1ParaV2 } from '@/domain/migrations/v1-para-v2'
import { migradorV2ParaV3 } from '@/domain/migrations/v2-para-v3'
import { migradorV3ParaV4 } from '@/domain/migrations/v3-para-v4'
import { migradorV4ParaV5 } from '@/domain/migrations/v4-para-v5'
import { migradorV5ParaV6 } from '@/domain/migrations/v5-para-v6'
import { migradorV6ParaV7 } from '@/domain/migrations/v6-para-v7'
import { migradorV7ParaV8 } from '@/domain/migrations/v7-para-v8'
import type { Migrador } from '@/domain/migrations/types'

export type { Migrador } from '@/domain/migrations/types'

/** Registo de migradores, por ordem crescente de `de`. */
export const migradores: Migrador[] = [
  migradorV1ParaV2,
  migradorV2ParaV3,
  migradorV3ParaV4,
  migradorV4ParaV5,
  migradorV5ParaV6,
  migradorV6ParaV7,
  migradorV7ParaV8,
]

export class ErroVersaoDesconhecida extends Error {
  readonly versaoEncontrada: number

  constructor(versaoEncontrada: number) {
    super(
      `Não existe migrador para a versão ${versaoEncontrada} do ficheiro. ` +
        `Versão suportada mais recente: ${SCHEMA_VERSION_ATUAL}.`,
    )
    this.name = 'ErroVersaoDesconhecida'
    this.versaoEncontrada = versaoEncontrada
  }
}

/**
 * Lê `schemaVersion` de um ficheiro de proveniência desconhecida, aplica os
 * migradores necessários até à versão atual, e valida o resultado final
 * contra `ficheiroRatSchema`. Lança `ZodError` ou `ErroVersaoDesconhecida`
 * se não for possível migrar/validar.
 */
export function migrarParaVersaoAtual(dadosBrutos: unknown): FicheiroRat {
  const { schemaVersion } = schemaVersionSchema.parse(dadosBrutos)

  let dados = dadosBrutos as Record<string, unknown>
  let versaoAtual = schemaVersion

  while (versaoAtual < SCHEMA_VERSION_ATUAL) {
    const migrador = migradores.find((m) => m.de === versaoAtual)
    if (!migrador) {
      throw new ErroVersaoDesconhecida(versaoAtual)
    }
    dados = migrador.migrar(dados)
    versaoAtual += 1
  }

  if (versaoAtual > SCHEMA_VERSION_ATUAL) {
    throw new ErroVersaoDesconhecida(versaoAtual)
  }

  return ficheiroRatSchema.parse(dados)
}
