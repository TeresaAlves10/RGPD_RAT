import { z } from 'zod'
import {
  idsCategoriasDados,
  idsMedidasTecnicasOrganizativas,
} from '@/domain/schema/vocabularios'

/**
 * Peças partilhadas pelos dois tipos de registo.
 *
 * Regra geral de obrigatoriedade: o utilizador indicou os dois conjuntos
 * de campos como "obrigatórios". Aqui só são obrigatórios no schema os
 * campos sem os quais um registo não consegue sequer existir na lista
 * (id, tipo, direção, nome do tratamento, GP). Todos os outros são
 * `optional()` no schema e obrigatórios no catálogo de regras
 * (src/domain/rules/catalog.ts).
 *
 * Isto não é um abrandamento do requisito: é o que permite (a) guardar um
 * rascunho a meio, (b) exportar sempre — o download nunca é bloqueado por
 * erros (CLAUDE.md §7) — e (c) impedir a submissão para validação
 * enquanto faltar um campo obrigatório, que é onde o requisito ganha
 * dentes. Ver `podeSubmeter()` em src/domain/rules/motor.ts.
 */

/** Resposta a uma pergunta factual (existe / não existe / não se aplica). */
export const respostaSimNaoSchema = z.enum(['sim', 'nao', 'nao_aplicavel'])
export type RespostaSimNao = z.infer<typeof respostaSimNaoSchema>

/**
 * Resposta a uma pergunta de capacidade ou controlo. Tem "parcial" porque
 * um controlo raramente está totalmente implementado ou totalmente
 * ausente, e essa nuance é precisamente o que interessa ao validador.
 */
export const respostaControloSchema = z.enum(['sim', 'parcial', 'nao', 'nao_aplicavel'])
export type RespostaControlo = z.infer<typeof respostaControloSchema>

export const gestorProjetoSchema = z.object({
  nome: z.string().min(1, 'Indica o nome do gestor de projeto (GP).'),
  contacto: z.string().optional(),
})
export type GestorProjeto = z.infer<typeof gestorProjetoSchema>

/**
 * Taxonomia de dois níveis pedida pela especificação: "Categorias de
 * Dados Pessoais" e, para cada uma, "Tipos de Dados Pessoais".
 */
export const categoriaDadosSchema = z.object({
  categoria: z.enum(idsCategoriasDados),
  categoriaOutra: z.string().optional(),
  tipos: z.array(z.string().min(1)),
})
export type CategoriaDados = z.infer<typeof categoriaDadosSchema>

export const medidaTecnicaOrganizativaSchema = z.object({
  medida: z.enum(idsMedidasTecnicasOrganizativas),
  medidaOutra: z.string().optional(),
})
export type MedidaTecnicaOrganizativa = z.infer<typeof medidaTecnicaOrganizativaSchema>

/** Categorias especiais de dados (art. 9.º): se existem, têm de ser identificadas. */
export const categoriasEspeciaisSchema = z.object({
  aplicavel: respostaSimNaoSchema.optional(),
  identificar: z.string().optional(),
})
export type CategoriasEspeciais = z.infer<typeof categoriasEspeciaisSchema>

/**
 * Estado do registo no circuito GP -> validador. É apenas um marcador que
 * viaja dentro do ficheiro exportado: não há contas, servidor nem
 * submissão em rede (CLAUDE.md §2). "Submeter" é marcar o registo e
 * enviar o ficheiro; "devolvido" é o caminho de volta quando o validador
 * quer que o GP corrija em vez de corrigir ele próprio.
 */
export const estadoRegistoSchema = z.enum(['rascunho', 'submetido', 'devolvido', 'validado'])
export type EstadoRegisto = z.infer<typeof estadoRegistoSchema>

/**
 * Anotação do validador sobre um campo. `campo: 'geral'` é uma anotação
 * sobre o registo como um todo.
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

/** Quem validou e quando — preenchido quando o registo passa a `validado`. */
export const validacaoSchema = z.object({
  validadoPor: z.string().optional(),
  data: z.iso.datetime(),
  observacoes: z.string().optional(),
})
export type Validacao = z.infer<typeof validacaoSchema>

/** Campos comuns às duas qualidades. */
export const campoBaseRegistoSchema = z.object({
  id: z.uuid(),
  estado: estadoRegistoSchema,
  direcao: z.string().min(1, 'Indica a Direção.'),
  unidadeCoordenacao: z.string().optional(),
  nomeTratamento: z.string().min(1, 'Indica o nome do tratamento/processo.'),
  descricao: z.string().optional(),
  gestorProjeto: gestorProjetoSchema,
  medidasTecnicasOrganizativas: z.array(medidaTecnicaOrganizativaSchema).optional(),
  aipdRealizada: respostaSimNaoSchema.optional(),
  anotacoes: z.array(anotacaoCampoSchema).optional(),
  validacao: validacaoSchema.optional(),
})
export type CampoBaseRegisto = z.infer<typeof campoBaseRegistoSchema>
