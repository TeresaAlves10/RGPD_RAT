/**
 * Um migrador transforma um ficheiro da versão `de` para a versão `de + 1`.
 * Ver CLAUDE.md §2.5: nenhuma alteração ao formato do JSON sem incrementar
 * `schemaVersion` e escrever aqui o migrador correspondente.
 */
export interface Migrador {
  de: number
  migrar(dados: Record<string, unknown>): Record<string, unknown>
}
