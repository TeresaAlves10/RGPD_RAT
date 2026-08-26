import { z } from 'zod'

/**
 * Módulo de avaliação de controlos — OPCIONAL e separado do RAT
 * (CLAUDE.md §3). O RAT é o registo do art. 30.º; isto é a avaliação de
 * maturidade/controlos que o template Excel original misturava nas mesmas
 * colunas (secções "Requisitos Funcionais" e "Controlos Operacionais",
 * além de ferramentas, suportes e auditorias a subcontratantes).
 *
 * Nada aqui é obrigatório: o módulo só é preenchido se a equipa o ativar,
 * e a sua ausência nunca torna um RAT inválido.
 */

/** Resposta tripla usada em quase todas as perguntas de controlo. */
export const respostaControloSchema = z.enum(['sim', 'parcial', 'nao', 'nao_aplicavel'])
export type RespostaControlo = z.infer<typeof respostaControloSchema>

/**
 * Capacidade de dar resposta a cada direito do titular (arts. 15.º a 22.º)
 * e ao dever de informar (arts. 13.º e 14.º).
 */
export const requisitosFuncionaisSchema = z.object({
  deverInformar: respostaControloSchema.optional(),
  direitoAcesso: respostaControloSchema.optional(),
  direitoRetificacao: respostaControloSchema.optional(),
  direitoApagamento: respostaControloSchema.optional(),
  direitoPortabilidade: respostaControloSchema.optional(),
  direitoLimitacao: respostaControloSchema.optional(),
  direitoNaoDecisoesAutomatizadas: respostaControloSchema.optional(),
  direitoOposicao: respostaControloSchema.optional(),
  detecaoNotificacaoViolacoes: respostaControloSchema.optional(),
  notas: z.string().optional(),
})
export type RequisitosFuncionais = z.infer<typeof requisitosFuncionaisSchema>

/** Gestão de acessos (art. 32.º — segurança do tratamento). */
export const controlosOperacionaisSchema = z.object({
  procedimentosAcessosDocumentados: respostaControloSchema.optional(),
  procedimentosAcessosImplementados: respostaControloSchema.optional(),
  acessosFormalmenteAutorizados: respostaControloSchema.optional(),
  controlosAcessosPrivilegiados: respostaControloSchema.optional(),
  revisaoPeriodicaAcessos: respostaControloSchema.optional(),
  remocaoAcessosASaida: respostaControloSchema.optional(),
  notas: z.string().optional(),
})
export type ControlosOperacionais = z.infer<typeof controlosOperacionaisSchema>

/** Sistemas onde os dados vivem, e volumetria. */
export const ferramentasSistemasSchema = z.object({
  ferramentasAplicacoes: z.string().optional(),
  numeroCamposComDadosPessoais: z.string().optional(),
  volumeDadosPessoais: z.string().optional(),
  numeroUtilizadoresComAcesso: z.string().optional(),
  suportesFisicos: z.string().optional(),
  localizacaoSuportesFisicos: z.string().optional(),
})
export type FerramentasSistemas = z.infer<typeof ferramentasSistemasSchema>

/** Relação contratual com subcontratantes (art. 28.º) e CNPD. */
export const governoSubcontratacaoSchema = z.object({
  existeContrato: respostaControloSchema.optional(),
  contratoComClausulasProtecaoDados: respostaControloSchema.optional(),
  auditoriasAoSubcontratado: respostaControloSchema.optional(),
  pedidoAutorizacaoCnpd: respostaControloSchema.optional(),
  notas: z.string().optional(),
})
export type GovernoSubcontratacao = z.infer<typeof governoSubcontratacaoSchema>

/** Perguntas específicas sobre consentimento (art. 7.º e art. 8.º). */
export const governoConsentimentoSchema = z.object({
  mecanismosDemonstracaoConsentimento: respostaControloSchema.optional(),
  consentimentoResponsabilidadeParental: respostaControloSchema.optional(),
  notas: z.string().optional(),
})
export type GovernoConsentimento = z.infer<typeof governoConsentimentoSchema>

export const avaliacaoControlosSchema = z.object({
  requisitosFuncionais: requisitosFuncionaisSchema.optional(),
  controlosOperacionais: controlosOperacionaisSchema.optional(),
  ferramentasSistemas: ferramentasSistemasSchema.optional(),
  governoSubcontratacao: governoSubcontratacaoSchema.optional(),
  governoConsentimento: governoConsentimentoSchema.optional(),
  normativosAplicaveis: z.string().optional(),
  diagramaProcesso: z.string().optional(),
})
export type AvaliacaoControlos = z.infer<typeof avaliacaoControlosSchema>
