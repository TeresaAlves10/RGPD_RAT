import { z } from 'zod'
import {
  campoBaseRegistoSchema,
  contagemSchema,
  respostaCnpdSchema,
  respostaSimNaoSchema,
} from '@/domain/schema/comum'
import { anexoSchema } from '@/domain/schema/anexo'

/**
 * RAT — a organização é RESPONSÁVEL PELO TRATAMENTO (art. 30.º/1 do RGPD).
 *
 * Sete secções, pela ordem da especificação:
 *   1. Descrição do Processo / Caracterização
 *   2. Ferramentas / Aplicações utilizadas
 *   3. Subcontratados
 *   4. Base de Licitude
 *   5. Requisitos Funcionais / Direitos dos Titulares
 *   6. Controlos Operacionais
 *   7. Observações Gerais
 *
 * Quase tudo é texto livre: o utilizador preferiu descrição aberta com
 * orientação de preenchimento (ver src/domain/help/) a listas fechadas,
 * porque a realidade de cada processo raramente cabe numa taxonomia. As
 * poucas listas que restam são as que têm respostas genuinamente
 * enumeráveis (sim/não, escalas de grandeza).
 *
 * Sobre `optional()`: ver a nota de obrigatoriedade em comum.ts.
 */
export const registoResponsavelSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('responsavel'),

  // ── 1. Descrição do Processo / Caracterização ──────────────────────
  finalidade: z.string().optional(),
  operacoesTratamento: z.string().optional(),
  dadosPessoais: z.string().optional(),
  dadosNecessariosParaFinalidade: respostaSimNaoSchema.optional(),
  categoriasDados: z.string().optional(),
  categoriasEspeciais: respostaSimNaoSchema.optional(),
  categoriasEspeciaisNecessarias: respostaSimNaoSchema.optional(),
  categoriasTitulares: z.string().optional(),
  entidadesQueEnviamDados: z.string().optional(),
  entidadesParaQuemEnvioDados: z.string().optional(),
  suportesFisicos: z.string().optional(),
  localizacaoSuportesFisicos: z.string().optional(),

  // ── 2. Ferramentas / Aplicações utilizadas ─────────────────────────
  ferramentasAplicacoes: z.string().optional(),
  numeroCamposComDadosPessoais: contagemSchema.optional(),
  volumeDadosPessoais: contagemSchema.optional(),
  numeroUtilizadoresComAcesso: contagemSchema.optional(),

  // ── 3. Subcontratados ──────────────────────────────────────────────
  entidadesSubcontratadas: z.string().optional(),
  operacoesTratamentoSubcontratadas: z.string().optional(),
  existeContrato: respostaSimNaoSchema.optional(),
  contratoComClausulasProtecaoDados: respostaSimNaoSchema.optional(),
  /** Anexo do contrato ou das cláusulas de proteção de dados. */
  anexosContrato: z.array(anexoSchema).optional(),
  transferenciasPaisesTerceiros: respostaSimNaoSchema.optional(),
  paisesTerceiros: z.string().optional(),
  auditoriasAoSubcontratado: respostaSimNaoSchema.optional(),
  pedidoAutorizacaoCnpd: respostaCnpdSchema.optional(),

  // ── 4. Base de Licitude ────────────────────────────────────────────
  baseLicitude: z.string().optional(),
  consentimentoMecanismosDemonstracao: z.string().optional(),
  consentimentoResponsabilidadeParental: respostaSimNaoSchema.optional(),
  retencaoDefinidaPelaOrganizacao: z.string().optional(),
  criterioRetencao: z.string().optional(),
  retencaoPorNormativosLegais: z.string().optional(),

  // ── 5. Requisitos Funcionais / Direitos dos Titulares ──────────────
  deverInformar: z.string().optional(),
  direitoAcesso: z.string().optional(),
  direitoRetificacao: z.string().optional(),
  direitoApagamento: z.string().optional(),
  direitoPortabilidade: z.string().optional(),
  direitoLimitacao: z.string().optional(),
  direitoDecisoesAutomatizadas: z.string().optional(),
  direitoOposicao: z.string().optional(),

  // ── 6. Controlos Operacionais ──────────────────────────────────────
  procedimentosAcessosDocumentados: respostaSimNaoSchema.optional(),
  procedimentosAcessosImplementados: respostaSimNaoSchema.optional(),
  acessosFormalmenteAutorizados: respostaSimNaoSchema.optional(),
  controlosAcessosPrivilegiados: respostaSimNaoSchema.optional(),
  revisaoPeriodicaAcessos: respostaSimNaoSchema.optional(),
  remocaoAcessosASaida: respostaSimNaoSchema.optional(),
  /** Movida dos direitos dos titulares para aqui, a pedido do utilizador. */
  detecaoNotificacaoViolacoes: z.string().optional(),

  // ── 7. Observações Gerais ──────────────────────────────────────────
  // medidasTecnicasOrganizativas, normativosAplicaveis, anexos,
  // aipdRealizada, gestorProjeto e observacoes vêm de campoBaseRegisto.
})
export type RegistoResponsavel = z.infer<typeof registoResponsavelSchema>
