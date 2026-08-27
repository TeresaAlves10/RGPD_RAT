import { z } from 'zod'
import {
  campoBaseRegistoSchema,
  categoriaDadosSchema,
  categoriasEspeciaisSchema,
  respostaSimNaoSchema,
} from '@/domain/schema/comum'
import { idsBaseLicitude, idsCategoriasTitulares } from '@/domain/schema/vocabularios'

/**
 * RAT — a organização é SUBCONTRATANTE (art. 30.º/2 do RGPD): trata dados
 * por conta de um responsável.
 *
 * Segue a lista de campos indicada pelo utilizador para esta qualidade.
 * Sobre `optional()`, ver a nota de obrigatoriedade em comum.ts.
 */

/** Outro subcontratante contratado pela organização (art. 28.º/2 e /4). */
export const outroSubcontratanteSchema = z.object({
  nome: z.string().optional(),
  contacto: z.string().optional(),
  dataContrato: z.string().optional(),
})
export type OutroSubcontratante = z.infer<typeof outroSubcontratanteSchema>

/** Transferências para países terceiros ou organizações internacionais (art. 44.º). */
export const transferenciasSchema = z.object({
  existem: respostaSimNaoSchema.optional(),
  identificar: z.string().optional(),
})
export type Transferencias = z.infer<typeof transferenciasSchema>

export const registoSubcontratadoSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('subcontratado'),

  /** Por conta de quem a organização trata os dados. */
  nomeResponsavelTratamento: z.string().optional(),
  finalidade: z.string().optional(),
  /** "identificar ou N/A", conforme a especificação. */
  responsavelConjunto: z.string().optional(),
  baseLegal: z.enum(idsBaseLicitude).optional(),
  recolhaDados: z.string().optional(),
  categoriasTitulares: z.array(z.enum(idsCategoriasTitulares)).optional(),
  categoriasTitularesOutra: z.string().optional(),
  /** Categorias de dados e, dentro de cada uma, os tipos de dados. */
  categoriasDados: z.array(categoriaDadosSchema).optional(),
  categoriasEspeciais: categoriasEspeciaisSchema.optional(),
  destinatarios: z.string().optional(),
  transferencias: transferenciasSchema.optional(),
  prazoConservacao: z.string().optional(),
  // medidasTecnicasOrganizativas e aipdRealizada vêm de campoBaseRegisto.
  outrosSubcontratantes: z.array(outroSubcontratanteSchema).optional(),
  observacoes: z.string().optional(),
  diagramaEcosistema: z.string().optional(),
})
export type RegistoSubcontratado = z.infer<typeof registoSubcontratadoSchema>
