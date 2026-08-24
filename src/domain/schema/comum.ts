import { z } from 'zod'
import {
  idsCategoriasDados,
  idsMecanismoTransferencia,
  idsMedidasTecnicasOrganizativas,
} from '@/domain/schema/vocabularios'

/**
 * Peças de schema partilhadas pelos dois tipos de registo (responsável e
 * subcontratado). Ver CLAUDE.md §3: campos comuns a ambas as qualidades.
 */

export const gestorProjetoSchema = z.object({
  nome: z.string().min(1, 'Indica o nome do gestor de projeto (GP).'),
  contacto: z.string().min(1, 'Indica o contacto do gestor de projeto (GP).'),
})
export type GestorProjeto = z.infer<typeof gestorProjetoSchema>

export const categoriaDadosSchema = z.object({
  categoria: z.enum(idsCategoriasDados),
  categoriaOutra: z.string().optional(),
  tipos: z.array(z.string().min(1)).min(1, 'Indica pelo menos um tipo de dados.'),
})
export type CategoriaDados = z.infer<typeof categoriaDadosSchema>

export const medidaTecnicaOrganizativaSchema = z.object({
  medida: z.enum(idsMedidasTecnicasOrganizativas),
  medidaOutra: z.string().optional(),
})
export type MedidaTecnicaOrganizativa = z.infer<typeof medidaTecnicaOrganizativaSchema>

export const transferenciaInternacionalSchema = z.object({
  existem: z.boolean(),
  paisesOuOrganizacoes: z.array(z.string().min(1)).optional(),
  mecanismo: z.enum(idsMecanismoTransferencia).optional(),
  mecanismoOutro: z.string().optional(),
})
export type TransferenciaInternacional = z.infer<typeof transferenciaInternacionalSchema>

export const aipdSchema = z.enum(['sim', 'nao', 'nao_aplicavel'])
export type Aipd = z.infer<typeof aipdSchema>

/** Campos comuns aos dois tipos de registo. */
export const campoBaseRegistoSchema = z.object({
  id: z.uuid(),
  direcao: z.string().min(1, 'Indica a Direção/Área/Serviço.'),
  unidadeCoordenacao: z.string().optional(),
  nomeTratamento: z.string().min(1, 'Indica o nome do tratamento/processo.'),
  descricao: z.string().optional(),
  observacoes: z.string().optional(),
  medidasTecnicasOrganizativas: z
    .array(medidaTecnicaOrganizativaSchema)
    .min(1, 'Indica pelo menos uma medida técnica ou organizativa.'),
  transferenciasInternacionais: transferenciaInternacionalSchema,
  aipdRealizada: aipdSchema,
  gestorProjeto: gestorProjetoSchema,
})
export type CampoBaseRegisto = z.infer<typeof campoBaseRegistoSchema>
