import { z } from 'zod'
import {
  campoBaseRegistoSchema,
  categoriaDadosSchema,
  categoriasEspeciaisSchema,
  respostaControloSchema,
  respostaSimNaoSchema,
} from '@/domain/schema/comum'
import { idsBaseLicitude, idsCategoriasTitulares } from '@/domain/schema/vocabularios'

/**
 * RAT — a organização é RESPONSÁVEL PELO TRATAMENTO (art. 30.º/1 do RGPD).
 *
 * A ordem e o agrupamento dos campos seguem exatamente as sete secções
 * indicadas pelo utilizador:
 *   1. Descrição do Processo / Caracterização
 *   2. Ferramentas / Aplicações utilizadas
 *   3. Subcontratados
 *   4. Base de Licitude
 *   5. Requisitos Funcionais / Direitos dos Titulares
 *   6. Controlos Operacionais
 *   7. Observações Gerais
 *
 * Sobre `optional()`: ver a nota de obrigatoriedade em comum.ts. Todos
 * estes campos são obrigatórios para submeter o registo a validação; o
 * que os torna obrigatórios é o catálogo de regras, não o schema.
 */

/** Uma entidade subcontratada e as perguntas do art. 28.º sobre ela. */
export const subcontratadoSchema = z.object({
  nome: z.string().optional(),
  operacoesTratamento: z.string().optional(),
  existeContrato: respostaSimNaoSchema.optional(),
  contratoComClausulasProtecaoDados: respostaSimNaoSchema.optional(),
  transferenciasPaisesTerceiros: respostaSimNaoSchema.optional(),
  auditoriasAoSubcontratado: respostaSimNaoSchema.optional(),
  pedidoAutorizacaoCnpd: respostaSimNaoSchema.optional(),
})
export type Subcontratado = z.infer<typeof subcontratadoSchema>

export const registoResponsavelSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('responsavel'),

  // ── 1. Descrição do Processo / Caracterização ──────────────────────
  finalidade: z.string().optional(),
  operacoesTratamento: z.string().optional(),
  trataDadosPessoais: respostaSimNaoSchema.optional(),
  dadosNecessariosParaFinalidade: respostaSimNaoSchema.optional(),
  categoriasEspeciais: categoriasEspeciaisSchema.optional(),
  categoriasEspeciaisNecessarias: respostaSimNaoSchema.optional(),
  categoriasTitulares: z.array(z.enum(idsCategoriasTitulares)).optional(),
  categoriasTitularesOutra: z.string().optional(),
  entidadesQueEnviamDados: z.string().optional(),
  entidadesParaQuemEnvioDados: z.string().optional(),
  suportesFisicos: z.string().optional(),
  localizacaoSuportesFisicos: z.string().optional(),

  // ── 2. Ferramentas / Aplicações utilizadas ─────────────────────────
  ferramentasAplicacoes: z.string().optional(),
  numeroCamposComDadosPessoais: z.string().optional(),
  volumeDadosPessoais: z.string().optional(),
  numeroUtilizadoresComAcesso: z.string().optional(),

  // ── 3. Subcontratados ──────────────────────────────────────────────
  subcontratados: z.array(subcontratadoSchema).optional(),

  // ── 4. Base de Licitude ────────────────────────────────────────────
  baseLicitude: z.enum(idsBaseLicitude).optional(),
  /** Só se aplica quando a base de licitude é o consentimento (art. 7.º). */
  consentimentoMecanismosDemonstracao: respostaSimNaoSchema.optional(),
  /** Consentimento de menores (art. 8.º). */
  consentimentoResponsabilidadeParental: respostaSimNaoSchema.optional(),
  retencaoDefinidaPelaOrganizacao: respostaSimNaoSchema.optional(),
  retencaoPorNormativosLegais: respostaSimNaoSchema.optional(),

  // ── 5. Requisitos Funcionais / Direitos dos Titulares ──────────────
  deverInformar: respostaControloSchema.optional(),
  direitoAcesso: respostaControloSchema.optional(),
  direitoRetificacao: respostaControloSchema.optional(),
  direitoApagamento: respostaControloSchema.optional(),
  direitoPortabilidade: respostaControloSchema.optional(),
  direitoLimitacao: respostaControloSchema.optional(),
  direitoDecisoesAutomatizadas: respostaControloSchema.optional(),
  direitoOposicao: respostaControloSchema.optional(),
  detecaoNotificacaoViolacoes: respostaControloSchema.optional(),

  // ── 6. Controlos Operacionais ──────────────────────────────────────
  procedimentosAcessosDocumentados: respostaControloSchema.optional(),
  procedimentosAcessosImplementados: respostaControloSchema.optional(),
  acessosFormalmenteAutorizados: respostaControloSchema.optional(),
  controlosAcessosPrivilegiados: respostaControloSchema.optional(),
  revisaoPeriodicaAcessos: respostaControloSchema.optional(),
  remocaoAcessosASaida: respostaControloSchema.optional(),

  // ── 7. Observações Gerais ──────────────────────────────────────────
  // medidasTecnicasOrganizativas e aipdRealizada vêm de campoBaseRegisto.
  normativosAplicaveis: z.string().optional(),
  diagramaProcesso: z.string().optional(),
  observacoes: z.string().optional(),

  // Categorias/tipos de dados: a especificação do responsável não os
  // separa da caracterização, mas sem eles o art. 30.º/1/c fica por
  // cumprir, por isso entram na secção 1 do formulário.
  categoriasDados: z.array(categoriaDadosSchema).optional(),
})
export type RegistoResponsavel = z.infer<typeof registoResponsavelSchema>
