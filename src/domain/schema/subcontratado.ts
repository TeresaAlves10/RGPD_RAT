import { z } from 'zod'
import { campoBaseRegistoSchema, categoriaDadosSchema } from '@/domain/schema/comum'
import { categoriasEspeciaisSchema, subcontratanteContratadoSchema } from '@/domain/schema/responsavel'
import { idsBaseLicitude, idsCategoriasTitulares } from '@/domain/schema/vocabularios'

/**
 * RAT — Subcontratante (folha "Subcontratante" do Livro6.xlsx).
 *
 * Obrigatório é apenas o que o art. 30.º/2 exige: identificar cada
 * responsável por conta de quem a organização atua e as categorias de
 * tratamento efetuadas para cada um.
 *
 * Os restantes campos vêm da lista fornecida pelo utilizador para esta
 * folha e ficam OPCIONAIS por uma razão jurídica: base de licitude,
 * categorias de titulares e prazo de conservação são obrigações do
 * responsável pelo tratamento (art. 30.º/1), não do subcontratante. Estão
 * disponíveis para quem os queira registar, sem passarem a requisito.
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

  // Campos da folha "Subcontratante", opcionais (ver nota acima).
  finalidades: z.string().optional(),
  responsavelConjunto: z.string().optional(),
  representante: z.string().optional(),
  baseLicitude: z.enum(idsBaseLicitude).optional(),
  recolhaDados: z.string().optional(),
  categoriasTitulares: z.array(z.enum(idsCategoriasTitulares)).optional(),
  categoriasTitularesOutra: z.string().optional(),
  categoriasDados: z.array(categoriaDadosSchema).optional(),
  categoriasEspeciais: categoriasEspeciaisSchema.optional(),
  destinatarios: z.string().optional(),
  prazoConservacao: z.string().optional(),
  criterioPrazoConservacao: z.string().optional(),
  subcontratantesContratados: z.array(subcontratanteContratadoSchema).optional(),
})
export type RegistoSubcontratado = z.infer<typeof registoSubcontratadoSchema>
