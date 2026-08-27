import { z } from 'zod'
import { anexoSchema } from '@/domain/schema/anexo'
import { idsUnidadesCoordenacao } from '@/config/organizacao'

/**
 * Peças partilhadas pelos dois tipos de registo.
 *
 * Regra geral de obrigatoriedade: o utilizador indicou os dois conjuntos
 * de campos como obrigatórios. Aqui só são obrigatórios no schema os
 * campos sem os quais um registo não consegue existir na lista (id,
 * numero, tipo, nome do tratamento, GP). Todos os outros são
 * `optional()` no schema e obrigatórios no catálogo de regras
 * (src/domain/rules/catalog.ts).
 *
 * Isto não abranda o requisito: é o que permite (a) guardar um rascunho a
 * meio, (b) exportar sempre — o download nunca é bloqueado por erros
 * (CLAUDE.md §7) — e (c) impedir a submissão para validação enquanto
 * faltar um campo obrigatório, que é onde o requisito ganha dentes.
 */

/** Resposta a uma pergunta factual. */
export const respostaSimNaoSchema = z.enum(['sim', 'nao', 'nao_aplicavel'])
export type RespostaSimNao = z.infer<typeof respostaSimNaoSchema>

/**
 * A pergunta sobre a CNPD tem uma quarta resposta possível: quem preenche
 * pode genuinamente não saber se o pedido foi feito, e "Não sei" é uma
 * informação diferente de "Não".
 */
export const respostaCnpdSchema = z.enum(['sim', 'nao', 'nao_aplicavel', 'nao_sei'])
export type RespostaCnpd = z.infer<typeof respostaCnpdSchema>

/** Escala de grandeza usada nas contagens da secção "Ferramentas". */
export const escalaGrandezaSchema = z.enum(['baixo', 'medio', 'elevado'])
export type EscalaGrandeza = z.infer<typeof escalaGrandezaSchema>

/**
 * Contagem da secção "Ferramentas": a ordem de grandeza e, opcionalmente,
 * o número ou a nota exata.
 *
 * A escala sozinha envelhece bem mas perde precisão; o número sozinho
 * envelhece no dia seguinte. Guardam-se os dois, e a escala é o que
 * conta para a validação.
 */
export const contagemSchema = z.object({
  escala: escalaGrandezaSchema.optional(),
  valor: z.string().optional(),
})
export type Contagem = z.infer<typeof contagemSchema>

export const gestorProjetoSchema = z.object({
  nome: z.string().min(1, 'Indica o nome do gestor de projeto (GP).'),
  contacto: z.string().optional(),
})
export type GestorProjeto = z.infer<typeof gestorProjetoSchema>

/**
 * Estado do registo no circuito GP -> validador. É apenas um marcador que
 * viaja dentro do ficheiro exportado: não há contas, servidor nem
 * submissão em rede (CLAUDE.md §2).
 */
export const estadoRegistoSchema = z.enum(['rascunho', 'submetido', 'devolvido', 'validado'])
export type EstadoRegisto = z.infer<typeof estadoRegistoSchema>

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
  /** Numeração automática, sequencial dentro do ficheiro. */
  numero: z.number().int().positive(),
  estado: estadoRegistoSchema,
  direcao: z.string().optional(),
  unidadeCoordenacao: z.enum(idsUnidadesCoordenacao).optional(),
  nomeTratamento: z.string().min(1, 'Indica o nome do tratamento/processo.'),
  descricao: z.string().optional(),
  gestorProjeto: gestorProjetoSchema,
  /** Documentos importantes: imagem, diagrama, Word, PDF. Nunca obrigatório. */
  anexos: z.array(anexoSchema).optional(),
  aipdRealizada: respostaSimNaoSchema.optional(),
  medidasTecnicasOrganizativas: z.string().optional(),
  normativosAplicaveis: z.string().optional(),
  observacoes: z.string().optional(),
  anotacoes: z.array(anotacaoCampoSchema).optional(),
  validacao: validacaoSchema.optional(),
})
export type CampoBaseRegisto = z.infer<typeof campoBaseRegistoSchema>
