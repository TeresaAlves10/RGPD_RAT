import { z } from 'zod'
import { registoSchema } from '@/domain/schema/registo'

export const SCHEMA_VERSION_ATUAL = 2

export const metadadosEquipaSchema = z.object({
  equipa: z.string().min(1, 'Indica o nome da equipa/direção responsável pelo ficheiro.'),
  contacto: z.string().optional(),
  dataCriacao: z.iso.datetime(),
  dataUltimaEdicao: z.iso.datetime(),
})
export type MetadadosEquipa = z.infer<typeof metadadosEquipaSchema>

export const ficheiroRatSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION_ATUAL),
  metadados: metadadosEquipaSchema,
  registos: z.array(registoSchema),
})
export type FicheiroRat = z.infer<typeof ficheiroRatSchema>

/**
 * Schema "aberto" para ler o `schemaVersion` de um ficheiro de proveniência
 * desconhecida antes de decidir se é preciso migrar (ver
 * src/domain/migrations/). Nunca usar para validar dados finais.
 */
export const schemaVersionSchema = z.object({
  schemaVersion: z.number().int().positive(),
})
