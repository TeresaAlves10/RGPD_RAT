import type { Registo } from '@/domain/schema/registo'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import type { Regra, RegraRegisto } from '@/domain/rules/types'
import { NOME_ORGANIZACAO } from '@/config/organizacao'
import { textos } from '@/i18n/pt'

/**
 * Catálogo declarativo de regras de negócio (CLAUDE.md §2.4).
 *
 *  - `obrigatorio*`: um campo da especificação que tem de estar
 *    preenchido. Severidade `erro` — impede submeter a validação, nunca
 *    impede guardar nem exportar.
 *  - regras condicionais e de coerência: só se aplicam em certos casos
 *    (categorias especiais, transferências) ou comparam campos entre si.
 *
 * Nenhuma regra vive dentro de um componente de UI.
 */

function preenchido(valor: unknown): boolean {
  if (valor === undefined || valor === null) return false
  if (typeof valor === 'string') return valor.trim() !== ''
  if (Array.isArray(valor)) return valor.length > 0
  return true
}

function ehResponsavel(registo: Registo): registo is RegistoResponsavel {
  return registo.tipoRegisto === 'responsavel'
}

function ehSubcontratado(registo: Registo): registo is RegistoSubcontratado {
  return registo.tipoRegisto === 'subcontratado'
}

const c = textos.campos

/** Constrói a regra "este campo é obrigatório". */
function obrigatorio(prefixo: string, campo: string, rotulo: string): RegraRegisto {
  return {
    id: `${prefixo}.obrigatorio.${campo}`,
    escopo: 'registo',
    severidade: 'erro',
    campo,
    descricao: `${rotulo} tem de estar preenchido.`,
    verificar: (registo) => preenchido((registo as unknown as Record<string, unknown>)[campo]),
    mensagem: `${rotulo} — por preencher.`,
  }
}

/** Só se aplica à qualidade indicada. */
function obrigatorioDe(
  prefixo: string,
  qualidade: (registo: Registo) => boolean,
  campo: string,
  rotulo: string,
): RegraRegisto {
  const base = obrigatorio(prefixo, campo, rotulo)
  return { ...base, verificar: (registo) => !qualidade(registo) || base.verificar(registo) }
}

/**
 * Campos com o mesmo nome e o mesmo significado nas duas qualidades. O
 * utilizador pediu que a lista do responsável se replicasse no
 * subcontratante, por isso a maior parte das regras é comum.
 */
const CAMPOS_COMUNS: [string, string][] = [
  ['direcao', c.direcao],
  ['unidadeCoordenacao', c.unidadeCoordenacao],
  ['descricao', c.descricao],
  ['finalidade', c.finalidade],
  ['operacoesTratamento', c.operacoesTratamento],
  ['dadosPessoais', c.dadosPessoais],
  ['dadosNecessariosParaFinalidade', c.dadosNecessariosParaFinalidade],
  ['categoriasDados', c.categoriasDados],
  ['categoriasEspeciais', c.categoriasEspeciais],
  ['categoriasTitulares', c.categoriasTitulares],
  ['entidadesQueEnviamDados', c.entidadesQueEnviamDados],
  ['suportesFisicos', c.suportesFisicos],
  ['localizacaoSuportesFisicos', c.localizacaoSuportesFisicos],
  ['ferramentasAplicacoes', c.ferramentasAplicacoes],
  ['numeroCamposComDadosPessoais', c.numeroCamposComDadosPessoais],
  ['volumeDadosPessoais', c.volumeDadosPessoais],
  ['numeroUtilizadoresComAcesso', c.numeroUtilizadoresComAcesso],
  ['entidadesSubcontratadas', c.entidadesSubcontratadas],
  ['operacoesTratamentoSubcontratadas', c.operacoesTratamentoSubcontratadas],
  ['existeContrato', c.existeContrato],
  ['contratoComClausulasProtecaoDados', c.contratoComClausulasProtecaoDados],
  ['transferenciasPaisesTerceiros', c.transferenciasPaisesTerceiros],
  ['auditoriasAoSubcontratado', c.auditoriasAoSubcontratado],
  ['pedidoAutorizacaoCnpd', c.pedidoAutorizacaoCnpd],
  ['criterioRetencao', c.criterioRetencao(NOME_ORGANIZACAO)],
  ['retencaoPorNormativosLegais', c.retencaoPorNormativosLegais],
  ['deverInformar', c.deverInformar],
  ['direitoAcesso', c.direitoAcesso],
  ['direitoRetificacao', c.direitoRetificacao],
  ['direitoApagamento', c.direitoApagamento],
  ['direitoPortabilidade', c.direitoPortabilidade],
  ['direitoLimitacao', c.direitoLimitacao],
  ['direitoDecisoesAutomatizadas', c.direitoDecisoesAutomatizadas],
  ['direitoOposicao', c.direitoOposicao],
  ['detecaoNotificacaoViolacoes', c.detecaoNotificacaoViolacoes],
  ['procedimentosAcessosDocumentados', c.procedimentosAcessosDocumentados],
  ['procedimentosAcessosImplementados', c.procedimentosAcessosImplementados],
  ['acessosFormalmenteAutorizados', c.acessosFormalmenteAutorizados],
  ['controlosAcessosPrivilegiados', c.controlosAcessosPrivilegiados],
  ['revisaoPeriodicaAcessos', c.revisaoPeriodicaAcessos],
  ['remocaoAcessosASaida', c.remocaoAcessosASaida],
  ['medidasTecnicasOrganizativas', c.medidasTecnicasOrganizativas],
  ['normativosAplicaveis', c.normativosAplicaveis],
  ['aipdRealizada', c.aipdRealizada],
]

const regrasComuns: RegraRegisto[] = [
  ...CAMPOS_COMUNS.map(([campo, rotulo]) => obrigatorio('comum', campo, rotulo)),
  {
    id: 'comum.obrigatorio.gestorProjeto.nome',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'gestorProjeto.nome',
    descricao: 'O nome do Gestor de Projeto tem de estar preenchido.',
    verificar: (registo) => preenchido(registo.gestorProjeto?.nome),
    mensagem: `${c['gestorProjeto.nome']} — por preencher.`,
  },
  {
    id: 'comum.categoriasEspeciaisNecessidadePorResponder',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasEspeciaisNecessarias',
    descricao:
      'Havendo categorias especiais, tem de estar respondido se todas são necessárias.',
    verificar: (registo) =>
      registo.categoriasEspeciais !== 'sim' || preenchido(registo.categoriasEspeciaisNecessarias),
    mensagem: `${c.categoriasEspeciaisNecessarias} — por responder.`,
  },
  {
    id: 'comum.paisesTerceirosPorIdentificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'paisesTerceiros',
    descricao:
      'Havendo transferências para países terceiros, é preciso identificar o destino (art. 44.º).',
    verificar: (registo) =>
      registo.transferenciasPaisesTerceiros !== 'sim' || preenchido(registo.paisesTerceiros),
    mensagem:
      'Indicaste que há transferências para fora da União Europeia — identifica para que país ou países (art. 44.º).',
  },
  {
    id: 'comum.dadosDesnecessarios',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'dadosNecessariosParaFinalidade',
    descricao: 'Princípio da minimização dos dados (art. 5.º/1 c)).',
    verificar: (registo) => registo.dadosNecessariosParaFinalidade !== 'nao',
    mensagem:
      'Indicaste que nem todos os dados recolhidos são necessários para a finalidade — o princípio da minimização (art. 5.º/1 c)) obriga a reduzir a recolha ao necessário.',
  },
  {
    id: 'comum.subcontratadoSemContrato',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'existeContrato',
    descricao: 'O art. 28.º/3 exige contrato escrito com o subcontratante.',
    verificar: (registo) => registo.existeContrato !== 'nao',
    mensagem:
      'Não há contrato com a entidade subcontratada — o art. 28.º/3 exige que a subcontratação seja regulada por contrato escrito.',
  },
  {
    id: 'comum.subcontratadoSemClausulas',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'contratoComClausulasProtecaoDados',
    descricao: 'O contrato de subcontratação tem de conter as matérias do art. 28.º/3.',
    verificar: (registo) => registo.contratoComClausulasProtecaoDados !== 'nao',
    mensagem:
      'O contrato de subcontratação não tem cláusulas de proteção de dados — o art. 28.º/3 enumera o que tem de constar do contrato.',
  },
  {
    id: 'comum.acessosSemRemocaoASaida',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'remocaoAcessosASaida',
    descricao: 'Acessos por remover após a saída são um risco de segurança (art. 32.º).',
    verificar: (registo) => registo.remocaoAcessosASaida !== 'nao',
    mensagem:
      'Os acessos não são removidos quando um colaborador sai — o art. 32.º/1 b) exige assegurar a confidencialidade dos sistemas de forma continuada.',
  },
]

/** Campos que só existem numa das qualidades. */
const regrasResponsavel: RegraRegisto[] = [
  obrigatorioDe('resp', ehResponsavel, 'entidadesParaQuemEnvioDados', c.entidadesParaQuemEnvioDados),
  obrigatorioDe('resp', ehResponsavel, 'baseLicitude', c.baseLicitude),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'retencaoDefinidaPelaOrganizacao',
    c.retencaoDefinidaPelaOrganizacao(NOME_ORGANIZACAO),
  ),
]

const regrasSubcontratado: RegraRegisto[] = [
  obrigatorioDe('sub', ehSubcontratado, 'nomeResponsavelTratamento', c.nomeResponsavelTratamento),
  obrigatorioDe('sub', ehSubcontratado, 'responsavelConjunto', c.responsavelConjunto),
  obrigatorioDe('sub', ehSubcontratado, 'baseLegal', c.baseLegal),
  obrigatorioDe('sub', ehSubcontratado, 'recolhaDados', c.recolhaDados),
  obrigatorioDe('sub', ehSubcontratado, 'destinatarios', c.destinatarios),
  obrigatorioDe('sub', ehSubcontratado, 'prazoConservacao', c.prazoConservacao),
]

/** Regras de âmbito ficheiro. */
const regrasFicheiro: Regra[] = [
  {
    id: 'ficheiro.nomesDuplicados',
    escopo: 'ficheiro',
    severidade: 'aviso',
    campo: 'nomeTratamento',
    descricao: 'Dois registos com o mesmo nome de tratamento são difíceis de distinguir.',
    avaliar: (ficheiro) => {
      const contagem = new Map<string, number>()
      for (const registo of ficheiro.registos) {
        const chave = registo.nomeTratamento.trim().toLowerCase()
        contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
      }
      return ficheiro.registos
        .filter((registo) => (contagem.get(registo.nomeTratamento.trim().toLowerCase()) ?? 0) > 1)
        .map((registo) => ({
          registoId: registo.id,
          mensagem: `Existe mais do que um registo com o nome "${registo.nomeTratamento}".`,
        }))
    },
  },
  {
    id: 'ficheiro.numerosDuplicados',
    escopo: 'ficheiro',
    severidade: 'aviso',
    campo: 'numero',
    descricao: 'A numeração automática deve ser única dentro do ficheiro.',
    avaliar: (ficheiro) => {
      const contagem = new Map<number, number>()
      for (const registo of ficheiro.registos) {
        contagem.set(registo.numero, (contagem.get(registo.numero) ?? 0) + 1)
      }
      return ficheiro.registos
        .filter((registo) => (contagem.get(registo.numero) ?? 0) > 1)
        .map((registo) => ({
          registoId: registo.id,
          mensagem: `Há mais do que um registo com o ID ${registo.numero}.`,
        }))
    },
  },
]

export const catalogoRegras: Regra[] = [
  ...regrasComuns,
  ...regrasResponsavel,
  ...regrasSubcontratado,
  ...regrasFicheiro,
]
