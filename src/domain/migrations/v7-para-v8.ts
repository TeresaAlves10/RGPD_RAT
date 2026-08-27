import type { Migrador } from '@/domain/migrations/types'
import { textos } from '@/i18n/pt'

/**
 * v7 -> v8: a lista de campos do subcontratante encolhe.
 *
 * Saem os campos que são obrigações do responsável pelo tratamento e não
 * do subcontratante: ferramentas e volumes, direitos dos titulares,
 * controlos de gestão de acessos, auditorias e CNPD, entre outros. O
 * registo do responsável não muda.
 *
 * Nada do que uma equipa escreveu se perde: o conteúdo dos campos que
 * deixaram de existir é anexado às observações, com o rótulo que tinha.
 */

type Obj = Record<string, unknown>

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : undefined
}

/** Campos que saem do subcontratante, com o rótulo que tinham. */
const CAMPOS_REMOVIDOS: [string, string][] = [
  ['responsavelConjunto', 'Identificação do responsável conjunto pelo tratamento'],
  ['operacoesTratamento', textos.campos.operacoesTratamento],
  ['dadosNecessariosParaFinalidade', textos.campos.dadosNecessariosParaFinalidade],
  ['categoriasEspeciaisNecessarias', textos.campos.categoriasEspeciaisNecessarias],
  ['entidadesQueEnviamDados', textos.campos.entidadesQueEnviamDados],
  ['destinatarios', 'Destinatários ou categorias de destinatários'],
  ['suportesFisicos', textos.campos.suportesFisicos],
  ['localizacaoSuportesFisicos', textos.campos.localizacaoSuportesFisicos],
  ['ferramentasAplicacoes', textos.campos.ferramentasAplicacoes],
  ['operacoesTratamentoSubcontratadas', textos.campos.operacoesTratamentoSubcontratadas],
  ['existeContrato', textos.campos.existeContrato],
  ['contratoComClausulasProtecaoDados', textos.campos.contratoComClausulasProtecaoDados],
  ['auditoriasAoSubcontratado', textos.campos.auditoriasAoSubcontratado],
  ['pedidoAutorizacaoCnpd', textos.campos.pedidoAutorizacaoCnpd],
  ['consentimentoMecanismosDemonstracao', textos.campos.consentimentoMecanismosDemonstracao],
  ['consentimentoResponsabilidadeParental', textos.campos.consentimentoResponsabilidadeParental],
  ['retencaoPorNormativosLegais', textos.campos.retencaoPorNormativosLegais],
  ['normativosAplicaveis', textos.campos.normativosAplicaveis],
  ['deverInformar', textos.campos.deverInformar],
  ['direitoAcesso', textos.campos.direitoAcesso],
  ['direitoRetificacao', textos.campos.direitoRetificacao],
  ['direitoApagamento', textos.campos.direitoApagamento],
  ['direitoPortabilidade', textos.campos.direitoPortabilidade],
  ['direitoLimitacao', textos.campos.direitoLimitacao],
  ['direitoDecisoesAutomatizadas', textos.campos.direitoDecisoesAutomatizadas],
  ['direitoOposicao', textos.campos.direitoOposicao],
  ['detecaoNotificacaoViolacoes', textos.campos.detecaoNotificacaoViolacoes],
  ['procedimentosAcessosDocumentados', textos.campos.procedimentosAcessosDocumentados],
  ['procedimentosAcessosImplementados', textos.campos.procedimentosAcessosImplementados],
  ['acessosFormalmenteAutorizados', textos.campos.acessosFormalmenteAutorizados],
  ['controlosAcessosPrivilegiados', textos.campos.controlosAcessosPrivilegiados],
  ['revisaoPeriodicaAcessos', textos.campos.revisaoPeriodicaAcessos],
  ['remocaoAcessosASaida', textos.campos.remocaoAcessosASaida],
]

/** As contagens eram `{ escala, valor }`; lê-se o que lá estiver. */
const CONTAGENS: [string, string][] = [
  ['numeroCamposComDadosPessoais', textos.campos.numeroCamposComDadosPessoais],
  ['volumeDadosPessoais', textos.campos.volumeDadosPessoais],
  ['numeroUtilizadoresComAcesso', textos.campos.numeroUtilizadoresComAcesso],
]

function respostaLegivel(valor: unknown): string | undefined {
  const t = texto(valor)
  if (!t) return undefined
  const respostas = textos.respostas as Record<string, string>
  return respostas[t] ?? t
}

function contagemLegivel(valor: unknown): string | undefined {
  if (!valor || typeof valor !== 'object') return undefined
  const contagem = valor as { escala?: string; valor?: string }
  const escala = textos.escala as Record<string, string>
  const partes = [
    contagem.escala ? (escala[contagem.escala] ?? contagem.escala) : '',
    contagem.valor ?? '',
  ].filter(Boolean)
  return partes.length > 0 ? partes.join(' — ') : undefined
}

function migrarSubcontratado(registo: Obj): Obj {
  const residuos: string[] = []

  for (const [campo, rotulo] of CAMPOS_REMOVIDOS) {
    const valor = respostaLegivel(registo[campo])
    if (valor) residuos.push(`${rotulo}: ${valor}`)
  }
  for (const [campo, rotulo] of CONTAGENS) {
    const valor = contagemLegivel(registo[campo])
    if (valor) residuos.push(`${rotulo}: ${valor}`)
  }

  const observacoesBase = texto(registo.observacoes)
  const nota =
    residuos.length > 0
      ? [
          'Campos que deixaram de existir no registo de subcontratante:',
          ...residuos.map((r) => `- ${r}`),
        ].join('\n')
      : undefined

  return {
    id: registo.id,
    numero: registo.numero,
    tipoRegisto: 'subcontratado',
    estado: registo.estado,
    direcao: registo.direcao,
    unidadeCoordenacao: registo.unidadeCoordenacao,
    nomeTratamento: registo.nomeTratamento,
    descricao: registo.descricao,
    gestorProjeto: registo.gestorProjeto,
    anexos: registo.anexos,
    aipdRealizada: registo.aipdRealizada,
    medidasTecnicasOrganizativas: registo.medidasTecnicasOrganizativas,
    anotacoes: registo.anotacoes,
    validacao: registo.validacao,

    nomeResponsavelTratamento: texto(registo.nomeResponsavelTratamento),
    finalidade: texto(registo.finalidade),
    baseLegal: texto(registo.baseLegal),
    recolhaDados: texto(registo.recolhaDados),
    categoriasTitulares: texto(registo.categoriasTitulares),
    categoriasDados: texto(registo.categoriasDados),
    dadosPessoais: texto(registo.dadosPessoais),
    categoriasEspeciais: texto(registo.categoriasEspeciais),
    transferenciasPaisesTerceiros: texto(registo.transferenciasPaisesTerceiros),
    paisesTerceiros: texto(registo.paisesTerceiros),
    prazoConservacao: texto(registo.prazoConservacao),
    criterioRetencao: texto(registo.criterioRetencao),
    // O campo passou a ser sim/não com o nome à parte: se havia nomes,
    // a resposta é "sim".
    existemOutrosSubcontratantes: texto(registo.entidadesSubcontratadas) ? 'sim' : undefined,
    entidadesSubcontratadas: texto(registo.entidadesSubcontratadas),

    observacoes: [observacoesBase, nota].filter(Boolean).join('\n\n') || undefined,
  }
}

export const migradorV7ParaV8: Migrador = {
  de: 7,
  migrar(dados) {
    const registos = Array.isArray(dados.registos) ? (dados.registos as Obj[]) : []
    return {
      ...dados,
      schemaVersion: 8,
      registos: registos.map((registo) =>
        registo.tipoRegisto === 'subcontratado' ? migrarSubcontratado(registo) : registo,
      ),
    }
  },
}
