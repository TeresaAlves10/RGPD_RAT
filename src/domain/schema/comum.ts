import { z } from 'zod'
import {
  idsCategoriasDados,
  idsMecanismoTransferencia,
  idsMedidasTecnicasOrganizativas,
} from '@/domain/schema/vocabularios'
import { avaliacaoControlosSchema } from '@/domain/schema/avaliacao'

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

/**
 * Estado do registo dentro do ficheiro da equipa. É apenas um marcador
 * local: viaja dentro do ficheiro exportado e não implica contas,
 * servidor nem submissão (CLAUDE.md §2.2 e §2.8). A "submissão" continua
 * a ser exportar o ficheiro e enviá-lo ao DPO.
 */
export const estadoRegistoSchema = z.enum(['rascunho', 'pronto', 'validado'])
export type EstadoRegisto = z.infer<typeof estadoRegistoSchema>

/**
 * Anotação do DPO sobre um campo de um registo (modo validador, CLAUDE.md
 * §11 fase 6). `campo: 'geral'` significa uma anotação sobre o registo
 * como um todo, não sobre um campo específico.
 */
export const anotacaoCampoSchema = z.object({
  id: z.uuid(),
  campo: z.string().min(1),
  texto: z.string().min(1, 'A anotação não pode estar vazia.'),
  autor: z.string().optional(),
  data: z.iso.datetime(),
  resolvida: z.boolean().optional(),
})
export type AnotacaoCampo = z.infer<typeof anotacaoCampoSchema>

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
  anotacoes: z.array(anotacaoCampoSchema).optional(),
  estado: estadoRegistoSchema,
  /**
   * Módulo de avaliação de controlos — opcional e à parte do RAT
   * (CLAUDE.md §3). Ausente enquanto a equipa não o ativar.
   */
  avaliacao: avaliacaoControlosSchema.optional(),
})
export type CampoBaseRegisto = z.infer<typeof campoBaseRegistoSchema>
