import { z } from 'zod'
import { campoBaseRegistoSchema } from '@/domain/schema/comum'

/**
 * RAT — Subcontratado (art. 30.º/2 do RGPD).
 * Não inclui base de licitude, categorias de titulares/dados, nem prazo de
 * conservação — esses campos são do responsável pelo tratamento, não do
 * subcontratado (ver CLAUDE.md §3).
 */

export const responsavelPorContaSchema = z.object({
  nome: z.string().min(1, 'Indica o nome do responsável pelo tratamento.'),
  contacto: z.string().optional(),
  categoriasTratamento: z
    .string()
    .min(1, 'Indica as categorias de tratamento efetuadas por conta deste responsável.'),
})
export type ResponsavelPorConta = z.infer<typeof responsavelPorContaSchema>

export const registoSubcontratadoSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('subcontratado'),
  responsaveis: z
    .array(responsavelPorContaSchema)
    .min(1, 'Indica pelo menos um responsável por conta de quem a organização atua.'),
})
export type RegistoSubcontratado = z.infer<typeof registoSubcontratadoSchema>
