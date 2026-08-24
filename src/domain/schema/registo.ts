import { z } from 'zod'
import { registoResponsavelSchema } from '@/domain/schema/responsavel'
import { registoSubcontratadoSchema } from '@/domain/schema/subcontratado'

export const registoSchema = z.discriminatedUnion('tipoRegisto', [
  registoResponsavelSchema,
  registoSubcontratadoSchema,
])
export type Registo = z.infer<typeof registoSchema>

export { registoResponsavelSchema, registoSubcontratadoSchema }
export type { RegistoResponsavel } from '@/domain/schema/responsavel'
export type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
