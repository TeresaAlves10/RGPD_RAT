import { z } from 'zod'
import { campoBaseRegistoSchema, respostaSimNaoSchema } from '@/domain/schema/comum'

/**
 * RAT — a organização é SUBCONTRATANTE (art. 30.º/2 do RGPD): trata dados
 * por conta de um responsável.
 *
 * A lista é deliberadamente mais curta do que a do responsável. O
 * art. 30.º/2 exige menos do subcontratante, e o que não consta aqui —
 * ferramentas e volumes, direitos dos titulares, controlos de acesso,
 * auditorias, CNPD — são obrigações de quem determina as finalidades e os
 * meios, não de quem executa por conta de outrem.
 *
 * Sobre `optional()`: ver a nota de obrigatoriedade em comum.ts.
 */
export const registoSubcontratadoSchema = campoBaseRegistoSchema.extend({
  tipoRegisto: z.literal('subcontratado'),

  // ── Identificação ──────────────────────────────────────────────────
  /** Por conta de quem a organização trata os dados. */
  nomeResponsavelTratamento: z.string().optional(),

  // ── Tratamento e base legal ────────────────────────────────────────
  finalidade: z.string().optional(),
  baseLegal: z.string().optional(),
  recolhaDados: z.string().optional(),

  // ── Titulares e dados ──────────────────────────────────────────────
  categoriasTitulares: z.string().optional(),
  categoriasDados: z.string().optional(),
  dadosPessoais: z.string().optional(),
  categoriasEspeciais: respostaSimNaoSchema.optional(),

  // ── Transferências e conservação ───────────────────────────────────
  transferenciasPaisesTerceiros: respostaSimNaoSchema.optional(),
  paisesTerceiros: z.string().optional(),
  prazoConservacao: z.string().optional(),
  criterioRetencao: z.string().optional(),

  // ── Segurança e observações ────────────────────────────────────────
  // medidasTecnicasOrganizativas, anexos, observacoes, aipdRealizada e
  // gestorProjeto vêm de campoBaseRegisto.
  /** Outros subcontratantes contratados pela organização (art. 28.º). */
  existemOutrosSubcontratantes: respostaSimNaoSchema.optional(),
  entidadesSubcontratadas: z.string().optional(),
})
export type RegistoSubcontratado = z.infer<typeof registoSubcontratadoSchema>
