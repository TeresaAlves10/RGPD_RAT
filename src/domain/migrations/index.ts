import { SCHEMA_VERSION_ATUAL, ficheiroRatSchema, schemaVersionSchema } from '@/domain/schema/ficheiro'
import type { FicheiroRat } from '@/domain/schema/ficheiro'

/**
 * Um migrador transforma um ficheiro da versão `de` para a versão `de + 1`.
 * Ver CLAUDE.md §2.5: nenhuma alteração ao formato do JSON sem incrementar
 * `schemaVersion` e escrever aqui o migrador correspondente.
 */
export interface Migrador {
  de: number
  migrar(dados: Record<string, unknown>): Record<string, unknown>
}

/**
 * Registo de migradores, por ordem crescente de `de`. Vazio por agora — só
 * existe a versão 1 do schema. O primeiro migrador real (v1 -> v2) entra
 * aqui quando o formato do JSON mudar pela primeira vez.
 */
export const migradores: Migrador[] = []

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
