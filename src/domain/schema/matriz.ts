import { z } from 'zod'
import { respostaControloSchema } from '@/domain/schema/avaliacao'

/**
 * Campos da matriz completa do levantamento de informação (folha
 * "Responsavél de Tratamento" do Livro6.xlsx), acrescentados ao registo do
 * responsável a pedido explícito do utilizador.
 *
 * Todos opcionais: o RAT do art. 30.º fica válido sem eles, e ficheiros
 * anteriores à v4 do schema continuam a abrir sem migração de dados.
 */

/** Resposta binária com "não aplicável", para as perguntas de S/N da matriz. */
export const respostaSimNaoSchema = z.enum(['sim', 'nao', 'nao_aplicavel'])
export type RespostaSimNao = z.infer<typeof respostaSimNaoSchema>

/** Secção "Caracterização" da matriz. */
export const caracterizacaoSchema = z.object({
  operacoesTratamento: z.string().optional(),
  temDadosPessoais: respostaSimNaoSchema.optional(),
  dadosNecessariosParaFinalidade: respostaControloSchema.optional(),
  categoriasEspeciaisNecessarias: respostaControloSchema.optional(),
  entidadesQueEnviamDados: z.string().optional(),
  entidadesParaQuemEnvioDados: z.string().optional(),
  suportesFisicos: z.string().optional(),
  localizacaoSuportesFisicos: z.string().optional(),
})
export type Caracterizacao = z.infer<typeof caracterizacaoSchema>

/** Secção "Ferramentas/Aplicações utilizadas" da matriz. */
export const ferramentasAplicacoesSchema = z.object({
  ferramentasAplicacoes: z.string().optional(),
  numeroCamposComDadosPessoais: z.string().optional(),
  volumeDadosPessoais: z.string().optional(),
  numeroUtilizadoresComAcesso: z.string().optional(),
})
export type FerramentasAplicacoes = z.infer<typeof ferramentasAplicacoesSchema>

/**
 * Secção "Subcontratados" da matriz — mais detalhada do que o campo
 * `subcontratantesContratados` (art. 28.º), que continua a existir.
 */
export const subcontratadoMatrizSchema = z.object({
  nome: z.string().optional(),
  operacoesTratamento: z.string().optional(),
  existeContrato: respostaSimNaoSchema.optional(),
  contratoComClausulasProtecaoDados: respostaSimNaoSchema.optional(),
  transferenciasPaisesTerceiros: respostaSimNaoSchema.optional(),
  auditoriasAoSubcontratado: respostaSimNaoSchema.optional(),
  pedidoAutorizacaoCnpd: respostaSimNaoSchema.optional(),
})
export type SubcontratadoMatriz = z.infer<typeof subcontratadoMatrizSchema>

/** Perguntas da secção "Base de Licitude" que vão além da alínea escolhida. */
export const licitudeRetencaoSchema = z.object({
  mecanismosDemonstracaoConsentimento: respostaSimNaoSchema.optional(),
  consentimentoResponsabilidadeParental: respostaSimNaoSchema.optional(),
  retencaoDefinidaPelaOrganizacao: respostaSimNaoSchema.optional(),
  retencaoPorNormativosLegais: respostaSimNaoSchema.optional(),
})
export type LicitudeRetencao = z.infer<typeof licitudeRetencaoSchema>

/** Bloco completo da matriz, pendurado no registo do responsável. */
export const matrizLevantamentoSchema = z.object({
  caracterizacao: caracterizacaoSchema.optional(),
  ferramentas: ferramentasAplicacoesSchema.optional(),
  subcontratados: z.array(subcontratadoMatrizSchema).optional(),
  licitudeRetencao: licitudeRetencaoSchema.optional(),
  normativosAplicaveis: z.string().optional(),
  diagramaProcesso: z.string().optional(),
  comentarios: z.string().optional(),
})
export type MatrizLevantamento = z.infer<typeof matrizLevantamentoSchema>
