import { z } from 'zod'
import { campoBaseRegistoSchema, categoriaDadosSchema } from '@/domain/schema/comum'
import {
  idsBaseLicitude,
  idsCategoriasTitulares,
  idsCondicaoArt9,
} from '@/domain/schema/vocabularios'

/**
 * RAT — Responsável de Tratamento (art. 30.º/1 do RGPD).
 * Não inclui campos exclusivos do subcontratado (ver subcontratado.ts).
 */

export const categoriasEspeciaisSchema = z.object({
  aplicavel: z.boolean(),
  condicoesArt9: z.array(z.enum(idsCondicaoArt9)).optional(),
  identificar: z.string().optional(),
})
export type CategoriasEspeciais = z.infer<typeof categoriasEspeciaisSchema>

export const subcontratanteContratadoSchema = z.object({
  nome: z.string().min(1, 'Indica o nome do subcontratante.'),
  contacto: z.string().optional(),
  dataContrato: z.string().optional(),
})
export type SubcontratanteContratado = z.infer<typeof subcontratanteContratadoSchema>

export const registoResponsavelSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('responsavel'),
  finalidades: z.string().min(1, 'Indica a(s) finalidade(s) do tratamento.'),
  responsavelConjunto: z.string().optional(),
  representante: z.string().optional(),
  baseLicitude: z.enum(idsBaseLicitude),
  recolhaDados: z.string().min(1, 'Indica como é efetuada a recolha dos dados.'),
  categoriasTitulares: z
    .array(z.enum(idsCategoriasTitulares))
    .min(1, 'Indica pelo menos uma categoria de titulares dos dados.'),
  categoriasTitularesOutra: z.string().optional(),
  categoriasDados: z
    .array(categoriaDadosSchema)
    .min(1, 'Indica pelo menos uma categoria de dados pessoais.'),
  categoriasEspeciais: categoriasEspeciaisSchema,
  destinatarios: z.string().optional(),
  prazoConservacao: z.string().min(1, 'Indica o prazo de conservação dos dados pessoais.'),
  subcontratantesContratados: z.array(subcontratanteContratadoSchema).optional(),
})
export type RegistoResponsavel = z.infer<typeof registoResponsavelSchema>
