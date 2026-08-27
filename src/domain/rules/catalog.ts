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
 * Campos com o mesmo nome, o mesmo significado e a mesma obrigatoriedade
 * nas duas qualidades. A lista do subcontratante é mais curta do que a do
 * responsável (art. 30.º/2 exige menos do que o art. 30.º/1) — só entram
 * aqui os campos que o subcontratante também tem no schema.
 */
const CAMPOS_COMUNS: [string, string][] = [
  ['direcao', c.direcao],
  ['unidadeCoordenacao', c.unidadeCoordenacao],
  ['descricao', c.descricao],
  ['finalidade', c.finalidade],
  ['dadosPessoais', c.dadosPessoais],
  ['categoriasDados', c.categoriasDados],
  ['categoriasEspeciais', c.categoriasEspeciais],
  ['categoriasTitulares', c.categoriasTitulares],
  ['criterioRetencao', c.criterioRetencao(NOME_ORGANIZACAO)],
  ['medidasTecnicasOrganizativas', c.medidasTecnicasOrganizativas],
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
    id: 'comum.paisesTerceirosPorIdentificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'paisesTerceiros',
    descricao:
      'Havendo transferências para países terceiros, é preciso identificar o destino (art. 44.º).',
    verificar: (registo) =>
      (ehResponsavel(registo) || ehSubcontratado(registo)) &&
      (registo.transferenciasPaisesTerceiros !== 'sim' || preenchido(registo.paisesTerceiros)),
    mensagem:
      'Indicaste que há transferências para fora da União Europeia — identifica para que país ou países (art. 44.º).',
  },
]

/** Campos que só existem no registo do responsável. */
const regrasResponsavel: RegraRegisto[] = [
  obrigatorioDe('resp', ehResponsavel, 'operacoesTratamento', c.operacoesTratamento),
  obrigatorioDe('resp', ehResponsavel, 'dadosNecessariosParaFinalidade', c.dadosNecessariosParaFinalidade),
  obrigatorioDe('resp', ehResponsavel, 'entidadesQueEnviamDados', c.entidadesQueEnviamDados),
  obrigatorioDe('resp', ehResponsavel, 'entidadesParaQuemEnvioDados', c.entidadesParaQuemEnvioDados),
  obrigatorioDe('resp', ehResponsavel, 'suportesFisicos', c.suportesFisicos),
  obrigatorioDe('resp', ehResponsavel, 'localizacaoSuportesFisicos', c.localizacaoSuportesFisicos),
  obrigatorioDe('resp', ehResponsavel, 'ferramentasAplicacoes', c.ferramentasAplicacoes),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'numeroCamposComDadosPessoais',
    c.numeroCamposComDadosPessoais,
  ),
  obrigatorioDe('resp', ehResponsavel, 'volumeDadosPessoais', c.volumeDadosPessoais),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'numeroUtilizadoresComAcesso',
    c.numeroUtilizadoresComAcesso,
  ),
  obrigatorioDe('resp', ehResponsavel, 'entidadesSubcontratadas', c.entidadesSubcontratadas),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'operacoesTratamentoSubcontratadas',
    c.operacoesTratamentoSubcontratadas,
  ),
  obrigatorioDe('resp', ehResponsavel, 'existeContrato', c.existeContrato),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'contratoComClausulasProtecaoDados',
    c.contratoComClausulasProtecaoDados,
  ),
  obrigatorioDe('resp', ehResponsavel, 'auditoriasAoSubcontratado', c.auditoriasAoSubcontratado),
  obrigatorioDe('resp', ehResponsavel, 'pedidoAutorizacaoCnpd', c.pedidoAutorizacaoCnpd),
  obrigatorioDe('resp', ehResponsavel, 'baseLicitude', c.baseLicitude),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'retencaoDefinidaPelaOrganizacao',
    c.retencaoDefinidaPelaOrganizacao(NOME_ORGANIZACAO),
  ),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'retencaoPorNormativosLegais',
    c.retencaoPorNormativosLegais,
  ),
  obrigatorioDe('resp', ehResponsavel, 'deverInformar', c.deverInformar),
  obrigatorioDe('resp', ehResponsavel, 'direitoAcesso', c.direitoAcesso),
  obrigatorioDe('resp', ehResponsavel, 'direitoRetificacao', c.direitoRetificacao),
  obrigatorioDe('resp', ehResponsavel, 'direitoApagamento', c.direitoApagamento),
  obrigatorioDe('resp', ehResponsavel, 'direitoPortabilidade', c.direitoPortabilidade),
  obrigatorioDe('resp', ehResponsavel, 'direitoLimitacao', c.direitoLimitacao),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'direitoDecisoesAutomatizadas',
    c.direitoDecisoesAutomatizadas,
  ),
  obrigatorioDe('resp', ehResponsavel, 'direitoOposicao', c.direitoOposicao),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'detecaoNotificacaoViolacoes',
    c.detecaoNotificacaoViolacoes,
  ),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'procedimentosAcessosDocumentados',
    c.procedimentosAcessosDocumentados,
  ),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'procedimentosAcessosImplementados',
    c.procedimentosAcessosImplementados,
  ),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'acessosFormalmenteAutorizados',
    c.acessosFormalmenteAutorizados,
  ),
  obrigatorioDe(
    'resp',
    ehResponsavel,
    'controlosAcessosPrivilegiados',
    c.controlosAcessosPrivilegiados,
  ),
  obrigatorioDe('resp', ehResponsavel, 'revisaoPeriodicaAcessos', c.revisaoPeriodicaAcessos),
  obrigatorioDe('resp', ehResponsavel, 'remocaoAcessosASaida', c.remocaoAcessosASaida),
  obrigatorioDe('resp', ehResponsavel, 'normativosAplicaveis', c.normativosAplicaveis),
  {
    id: 'resp.categoriasEspeciaisNecessidadePorResponder',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasEspeciaisNecessarias',
    descricao:
      'Havendo categorias especiais, tem de estar respondido se todas são necessárias.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.categoriasEspeciais !== 'sim' ||
      preenchido(registo.categoriasEspeciaisNecessarias),
    mensagem: `${c.categoriasEspeciaisNecessarias} — por responder.`,
  },
  {
    id: 'resp.dadosDesnecessarios',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'dadosNecessariosParaFinalidade',
    descricao: 'Princípio da minimização dos dados (art. 5.º/1 c)).',
    verificar: (registo) => !ehResponsavel(registo) || registo.dadosNecessariosParaFinalidade !== 'nao',
    mensagem:
      'Indicaste que nem todos os dados recolhidos são necessários para a finalidade — o princípio da minimização (art. 5.º/1 c)) obriga a reduzir a recolha ao necessário.',
  },
  {
    id: 'resp.subcontratadoSemContrato',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'existeContrato',
    descricao: 'O art. 28.º/3 exige contrato escrito com o subcontratante.',
    verificar: (registo) => !ehResponsavel(registo) || registo.existeContrato !== 'nao',
    mensagem:
      'Não há contrato com a entidade subcontratada — o art. 28.º/3 exige que a subcontratação seja regulada por contrato escrito.',
  },
  {
    id: 'resp.subcontratadoSemClausulas',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'contratoComClausulasProtecaoDados',
    descricao: 'O contrato de subcontratação tem de conter as matérias do art. 28.º/3.',
    verificar: (registo) =>
      !ehResponsavel(registo) || registo.contratoComClausulasProtecaoDados !== 'nao',
    mensagem:
      'O contrato de subcontratação não tem cláusulas de proteção de dados — o art. 28.º/3 enumera o que tem de constar do contrato.',
  },
  {
    id: 'resp.acessosSemRemocaoASaida',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'remocaoAcessosASaida',
    descricao: 'Acessos por remover após a saída são um risco de segurança (art. 32.º).',
    verificar: (registo) => !ehResponsavel(registo) || registo.remocaoAcessosASaida !== 'nao',
    mensagem:
      'Os acessos não são removidos quando um colaborador sai — o art. 32.º/1 b) exige assegurar a confidencialidade dos sistemas de forma continuada.',
  },
]

/** Campos que só existem no registo do subcontratante. */
const regrasSubcontratado: RegraRegisto[] = [
  obrigatorioDe('sub', ehSubcontratado, 'nomeResponsavelTratamento', c.nomeResponsavelTratamento),
  obrigatorioDe('sub', ehSubcontratado, 'baseLegal', c.baseLegal),
  obrigatorioDe('sub', ehSubcontratado, 'recolhaDados', c.recolhaDados),
  obrigatorioDe('sub', ehSubcontratado, 'prazoConservacao', c.prazoConservacao),
  obrigatorioDe(
    'sub',
    ehSubcontratado,
    'existemOutrosSubcontratantes',
    c.existemOutrosSubcontratantes,
  ),
  {
    id: 'sub.outrosSubcontratantesPorIdentificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'entidadesSubcontratadas',
    descricao:
      'Havendo outros subcontratantes (art. 28.º), é preciso identificá-los pelo nome.',
    verificar: (registo) =>
      !ehSubcontratado(registo) ||
      registo.existemOutrosSubcontratantes !== 'sim' ||
      preenchido(registo.entidadesSubcontratadas),
    mensagem:
      'Indicaste que há outros subcontratantes — identifica-os pelo nome (art. 28.º).',
  },
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
