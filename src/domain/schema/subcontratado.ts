import { z } from 'zod'
import {
  campoBaseRegistoSchema,
  escalaGrandezaSchema,
  respostaCnpdSchema,
  respostaSimNaoSchema,
} from '@/domain/schema/comum'
import { anexoSchema } from '@/domain/schema/anexo'

/**
 * RAT — a organização é SUBCONTRATANTE (art. 30.º/2 do RGPD): trata dados
 * por conta de um responsável.
 *
 * Segue a mesma lista de campos e os mesmos tipos de resposta do
 * responsável ("replica para o registo enquanto subcontratante"), com as
 * diferenças próprias desta qualidade: o nome do responsável por conta de
 * quem se atua, o responsável conjunto, os destinatários, as
 * transferências do art. 44.º e os outros subcontratantes do art. 28.º.
 */
export const registoSubcontratadoSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('subcontratado'),

  /** Por conta de quem a organização trata os dados. */
  nomeResponsavelTratamento: z.string().optional(),
  /** "identificar ou N/A", conforme a especificação. */
  responsavelConjunto: z.string().optional(),

  // Caracterização
  finalidade: z.string().optional(),
  operacoesTratamento: z.string().optional(),
  recolhaDados: z.string().optional(),
  dadosPessoais: z.string().optional(),
  dadosNecessariosParaFinalidade: respostaSimNaoSchema.optional(),
  categoriasDados: z.string().optional(),
  categoriasEspeciais: respostaSimNaoSchema.optional(),
  categoriasEspeciaisNecessarias: respostaSimNaoSchema.optional(),
  categoriasTitulares: z.string().optional(),
  entidadesQueEnviamDados: z.string().optional(),
  destinatarios: z.string().optional(),
  suportesFisicos: z.string().optional(),
  localizacaoSuportesFisicos: z.string().optional(),

  // Ferramentas
  ferramentasAplicacoes: z.string().optional(),
  numeroCamposComDadosPessoais: escalaGrandezaSchema.optional(),
  volumeDadosPessoais: escalaGrandezaSchema.optional(),
  numeroUtilizadoresComAcesso: escalaGrandezaSchema.optional(),

  // Outros subcontratantes (art. 28.º)
  entidadesSubcontratadas: z.string().optional(),
  operacoesTratamentoSubcontratadas: z.string().optional(),
  existeContrato: respostaSimNaoSchema.optional(),
  contratoComClausulasProtecaoDados: respostaSimNaoSchema.optional(),
  anexosContrato: z.array(anexoSchema).optional(),
  auditoriasAoSubcontratado: respostaSimNaoSchema.optional(),
  pedidoAutorizacaoCnpd: respostaCnpdSchema.optional(),

  // Transferências internacionais (art. 44.º)
  transferenciasPaisesTerceiros: respostaSimNaoSchema.optional(),
  paisesTerceiros: z.string().optional(),

  // Base legal e conservação
  baseLegal: z.string().optional(),
  consentimentoMecanismosDemonstracao: z.string().optional(),
  consentimentoResponsabilidadeParental: respostaSimNaoSchema.optional(),
  prazoConservacao: z.string().optional(),
  criterioRetencao: z.string().optional(),
  retencaoPorNormativosLegais: z.string().optional(),

  // Direitos dos titulares
  deverInformar: z.string().optional(),
  direitoAcesso: z.string().optional(),
  direitoRetificacao: z.string().optional(),
  direitoApagamento: z.string().optional(),
  direitoPortabilidade: z.string().optional(),
  direitoLimitacao: z.string().optional(),
  direitoDecisoesAutomatizadas: z.string().optional(),
  direitoOposicao: z.string().optional(),
  detecaoNotificacaoViolacoes: z.string().optional(),

  // Controlos operacionais
  procedimentosAcessosDocumentados: respostaSimNaoSchema.optional(),
  procedimentosAcessosImplementados: respostaSimNaoSchema.optional(),
  acessosFormalmenteAutorizados: respostaSimNaoSchema.optional(),
  controlosAcessosPrivilegiados: respostaSimNaoSchema.optional(),
  revisaoPeriodicaAcessos: respostaSimNaoSchema.optional(),
  remocaoAcessosASaida: respostaSimNaoSchema.optional(),
})
export type RegistoSubcontratado = z.infer<typeof registoSubcontratadoSchema>
