import type { Registo } from '@/domain/schema/registo'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import type { Regra, RegraRegisto } from '@/domain/rules/types'
import { textos } from '@/i18n/pt'

/**
 * Catálogo declarativo de regras de negócio (CLAUDE.md §2.4).
 *
 * Duas famílias:
 *  - `obrigatorio*`: um campo da especificação do utilizador que tem de
 *    estar preenchido. Severidade `erro` — impede submeter a validação,
 *    nunca impede guardar nem exportar.
 *  - regras condicionais e de coerência: só se aplicam em certos casos
 *    (consentimento, categorias especiais, transferências) ou comparam
 *    campos entre si.
 *
 * Nenhuma regra vive dentro de um componente de UI.
 */

const ORGANIZACAO_GENERICA = 'a organização'

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

/**
 * Constrói a regra "este campo é obrigatório" para uma das qualidades.
 * `ler` só é chamada para registos da qualidade certa, por isso pode
 * assumir o tipo concreto.
 */
function obrigatorio<T extends Registo>(
  prefixo: string,
  qualidade: (registo: Registo) => registo is T,
  campo: string,
  rotulo: string,
  ler: (registo: T) => unknown = (registo) => (registo as unknown as Record<string, unknown>)[campo],
): RegraRegisto {
  return {
    id: `${prefixo}.obrigatorio.${campo}`,
    escopo: 'registo',
    severidade: 'erro',
    campo,
    descricao: `${rotulo} tem de estar preenchido.`,
    verificar: (registo) => !qualidade(registo) || preenchido(ler(registo)),
    mensagem: `${rotulo} — por preencher.`,
  }
}

function obrigatorioResponsavel(
  campo: string,
  rotulo: string,
  ler?: (registo: RegistoResponsavel) => unknown,
): RegraRegisto {
  return obrigatorio('resp', ehResponsavel, campo, rotulo, ler)
}

function obrigatorioSubcontratado(
  campo: string,
  rotulo: string,
  ler?: (registo: RegistoSubcontratado) => unknown,
): RegraRegisto {
  return obrigatorio('sub', ehSubcontratado, campo, rotulo, ler)
}

const c = textos.campos

/** Campos comuns às duas qualidades, exigidos em ambas. */
const regrasComuns: RegraRegisto[] = [
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
    id: 'comum.obrigatorio.unidadeCoordenacao',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'unidadeCoordenacao',
    descricao: 'A Unidade de Coordenação tem de estar preenchida.',
    verificar: (registo) => preenchido(registo.unidadeCoordenacao),
    mensagem: `${c.unidadeCoordenacao} — por preencher.`,
  },
  {
    id: 'comum.obrigatorio.descricao',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'descricao',
    descricao: 'A descrição do processo tem de estar preenchida.',
    verificar: (registo) => preenchido(registo.descricao),
    mensagem: `${c.descricao} — por preencher.`,
  },
  {
    id: 'comum.obrigatorio.medidasTecnicasOrganizativas',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'medidasTecnicasOrganizativas',
    descricao: 'Tem de estar indicada pelo menos uma medida técnica ou organizativa.',
    verificar: (registo) => preenchido(registo.medidasTecnicasOrganizativas),
    mensagem: `${c.medidasTecnicasOrganizativas} — indica pelo menos uma.`,
  },
  {
    id: 'comum.obrigatorio.aipdRealizada',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'aipdRealizada',
    descricao: 'Tem de estar respondido se foi realizada AIPD.',
    verificar: (registo) => preenchido(registo.aipdRealizada),
    mensagem: `${c.aipdRealizada} — por responder.`,
  },
  {
    id: 'comum.categoriaDadosSemTipos',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasDados',
    descricao:
      'Cada categoria de dados escolhida tem de indicar os tipos de dados tratados.',
    verificar: (registo) =>
      (registo.categoriasDados ?? []).every((cat) => cat.tipos.some((t) => t.trim() !== '')),
    mensagem:
      'Há uma categoria de dados sem tipos indicados — indica que tipos de dados são tratados em cada categoria.',
  },
  {
    id: 'comum.categoriaDadosOutraPorEspecificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasDados',
    descricao: 'Uma categoria de dados "Outro" tem de ser especificada.',
    verificar: (registo) =>
      (registo.categoriasDados ?? []).every(
        (cat) => cat.categoria !== 'outro' || preenchido(cat.categoriaOutra),
      ),
    mensagem: 'Especifica a categoria de dados assinalada como "Outro".',
  },
  {
    id: 'comum.medidaOutraPorEspecificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'medidasTecnicasOrganizativas',
    descricao: 'Uma medida "Outro" tem de ser especificada.',
    verificar: (registo) =>
      (registo.medidasTecnicasOrganizativas ?? []).every(
        (m) => m.medida !== 'outro' || preenchido(m.medidaOutra),
      ),
    mensagem: 'Especifica a medida assinalada como "Outro".',
  },
]

/** Responsável pelo tratamento — as sete secções da especificação. */
const regrasResponsavel: RegraRegisto[] = [
  // 1. Descrição do Processo / Caracterização
  obrigatorioResponsavel('finalidade', c.finalidade),
  obrigatorioResponsavel('operacoesTratamento', c.operacoesTratamento),
  obrigatorioResponsavel('trataDadosPessoais', c.trataDadosPessoais),
  obrigatorioResponsavel('dadosNecessariosParaFinalidade', c.dadosNecessariosParaFinalidade),
  obrigatorioResponsavel(
    'categoriasEspeciais.aplicavel',
    c['categoriasEspeciais.aplicavel'],
    (registo) => registo.categoriasEspeciais?.aplicavel,
  ),
  obrigatorioResponsavel('categoriasTitulares', c.categoriasTitulares),
  obrigatorioResponsavel('categoriasDados', c.categoriasDados),
  obrigatorioResponsavel('entidadesQueEnviamDados', c.entidadesQueEnviamDados),
  obrigatorioResponsavel('entidadesParaQuemEnvioDados', c.entidadesParaQuemEnvioDados),
  obrigatorioResponsavel('suportesFisicos', c.suportesFisicos),
  obrigatorioResponsavel('localizacaoSuportesFisicos', c.localizacaoSuportesFisicos),

  // 2. Ferramentas / Aplicações
  obrigatorioResponsavel('ferramentasAplicacoes', c.ferramentasAplicacoes),
  obrigatorioResponsavel('numeroCamposComDadosPessoais', c.numeroCamposComDadosPessoais),
  obrigatorioResponsavel('volumeDadosPessoais', c.volumeDadosPessoais),
  obrigatorioResponsavel('numeroUtilizadoresComAcesso', c.numeroUtilizadoresComAcesso),

  // 4. Base de Licitude
  obrigatorioResponsavel('baseLicitude', c.baseLicitude),
  obrigatorioResponsavel(
    'retencaoDefinidaPelaOrganizacao',
    c.retencaoDefinidaPelaOrganizacao(ORGANIZACAO_GENERICA),
  ),
  obrigatorioResponsavel('retencaoPorNormativosLegais', c.retencaoPorNormativosLegais),

  // 5. Requisitos Funcionais / Direitos dos Titulares
  obrigatorioResponsavel('deverInformar', c.deverInformar),
  obrigatorioResponsavel('direitoAcesso', c.direitoAcesso),
  obrigatorioResponsavel('direitoRetificacao', c.direitoRetificacao),
  obrigatorioResponsavel('direitoApagamento', c.direitoApagamento),
  obrigatorioResponsavel('direitoPortabilidade', c.direitoPortabilidade),
  obrigatorioResponsavel('direitoLimitacao', c.direitoLimitacao),
  obrigatorioResponsavel('direitoDecisoesAutomatizadas', c.direitoDecisoesAutomatizadas),
  obrigatorioResponsavel('direitoOposicao', c.direitoOposicao),
  obrigatorioResponsavel('detecaoNotificacaoViolacoes', c.detecaoNotificacaoViolacoes),

  // 6. Controlos Operacionais
  obrigatorioResponsavel('procedimentosAcessosDocumentados', c.procedimentosAcessosDocumentados),
  obrigatorioResponsavel('procedimentosAcessosImplementados', c.procedimentosAcessosImplementados),
  obrigatorioResponsavel('acessosFormalmenteAutorizados', c.acessosFormalmenteAutorizados),
  obrigatorioResponsavel('controlosAcessosPrivilegiados', c.controlosAcessosPrivilegiados),
  obrigatorioResponsavel('revisaoPeriodicaAcessos', c.revisaoPeriodicaAcessos),
  obrigatorioResponsavel('remocaoAcessosASaida', c.remocaoAcessosASaida),

  // 7. Observações Gerais
  obrigatorioResponsavel('normativosAplicaveis', c.normativosAplicaveis),

  // ── Condicionais e de coerência ────────────────────────────────────
  {
    id: 'resp.categoriasEspeciaisPorIdentificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasEspeciais.identificar',
    descricao:
      'Se existem categorias especiais de dados (art. 9.º), têm de ser identificadas.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.categoriasEspeciais?.aplicavel !== 'sim' ||
      preenchido(registo.categoriasEspeciais?.identificar),
    mensagem:
      'Indicaste que há categorias especiais de dados — identifica quais (art. 9.º/1).',
  },
  {
    id: 'resp.categoriasEspeciaisNecessidadePorResponder',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasEspeciaisNecessarias',
    descricao:
      'Se existem categorias especiais, tem de estar respondido se todas são necessárias.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.categoriasEspeciais?.aplicavel !== 'sim' ||
      preenchido(registo.categoriasEspeciaisNecessarias),
    mensagem: `${c.categoriasEspeciaisNecessarias} — por responder.`,
  },
  {
    id: 'resp.consentimentoDemonstracaoPorResponder',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'consentimentoMecanismosDemonstracao',
    descricao:
      'Com base no consentimento, tem de haver forma de o demonstrar (art. 7.º/1).',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.baseLicitude !== 'consentimento' ||
      preenchido(registo.consentimentoMecanismosDemonstracao),
    mensagem: `${c.consentimentoMecanismosDemonstracao} — por responder.`,
  },
  {
    id: 'resp.consentimentoParentalPorResponder',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'consentimentoResponsabilidadeParental',
    descricao:
      'Com base no consentimento, tem de estar respondida a questão do consentimento de menores (art. 8.º).',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.baseLicitude !== 'consentimento' ||
      preenchido(registo.consentimentoResponsabilidadeParental),
    mensagem: `${c.consentimentoResponsabilidadeParental} — por responder.`,
  },
  {
    id: 'resp.consentimentoSemDemonstracao',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'consentimentoMecanismosDemonstracao',
    descricao:
      'O art. 7.º/1 exige poder demonstrar o consentimento a qualquer momento.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.baseLicitude !== 'consentimento' ||
      registo.consentimentoMecanismosDemonstracao !== 'nao',
    mensagem:
      'O tratamento assenta no consentimento mas não há forma de o demonstrar — o art. 7.º/1 exige que o responsável o consiga provar a qualquer momento.',
  },
  {
    id: 'resp.semPeriodoDeRetencao',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'retencaoDefinidaPelaOrganizacao',
    descricao:
      'O art. 30.º/1 f) pede o prazo de conservação ou, na sua falta, o critério que o determina.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      registo.retencaoDefinidaPelaOrganizacao !== 'nao' ||
      registo.retencaoPorNormativosLegais !== 'nao',
    mensagem:
      'Não há prazo de retenção definido internamente nem por normativo legal — o art. 30.º/1 f) pede um ou o critério que o determine.',
  },
  {
    id: 'resp.subcontratadoSemNome',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'subcontratados',
    descricao: 'Cada entidade subcontratada tem de ter nome.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      (registo.subcontratados ?? []).every((s) => preenchido(s.nome)),
    mensagem: 'Há uma entidade subcontratada sem nome.',
  },
  {
    id: 'resp.subcontratadoSemContrato',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'subcontratados',
    descricao:
      'O art. 28.º/3 exige contrato escrito com o subcontratante.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      (registo.subcontratados ?? []).every((s) => s.existeContrato !== 'nao'),
    mensagem:
      'Há uma entidade subcontratada sem contrato — o art. 28.º/3 exige que a subcontratação seja regulada por contrato escrito.',
  },
  {
    id: 'resp.subcontratadoSemClausulas',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'subcontratados',
    descricao:
      'O contrato de subcontratação tem de conter as matérias do art. 28.º/3.',
    verificar: (registo) =>
      !ehResponsavel(registo) ||
      (registo.subcontratados ?? []).every(
        (s) => s.contratoComClausulasProtecaoDados !== 'nao',
      ),
    mensagem:
      'Há um contrato de subcontratação sem cláusulas de proteção de dados — o art. 28.º/3 enumera o que tem de constar do contrato.',
  },
  {
    id: 'resp.dadosDesnecessarios',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'dadosNecessariosParaFinalidade',
    descricao: 'Princípio da minimização dos dados (art. 5.º/1 c)).',
    verificar: (registo) =>
      !ehResponsavel(registo) || registo.dadosNecessariosParaFinalidade !== 'nao',
    mensagem:
      'Indicaste que nem todos os dados recolhidos são necessários para a finalidade — o princípio da minimização (art. 5.º/1 c)) obriga a reduzir a recolha ao necessário.',
  },
  {
    id: 'resp.semDeverInformar',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'deverInformar',
    descricao: 'Dever de informar o titular (arts. 13.º e 14.º).',
    verificar: (registo) => !ehResponsavel(registo) || registo.deverInformar !== 'nao',
    mensagem:
      'O dever de informar não foi exercido antes do início do tratamento — os arts. 13.º e 14.º obrigam a informar o titular no momento da recolha.',
  },
  {
    id: 'resp.semDetecaoViolacoes',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'detecaoNotificacaoViolacoes',
    descricao:
      'Notificação de violações de dados à CNPD em 72 horas (art. 33.º).',
    verificar: (registo) =>
      !ehResponsavel(registo) || registo.detecaoNotificacaoViolacoes !== 'nao',
    mensagem:
      'Sem capacidade de detetar e notificar violações de dados, o prazo de 72 horas do art. 33.º/1 não é cumprível.',
  },
]

/** Subcontratante (art. 30.º/2). */
const regrasSubcontratado: RegraRegisto[] = [
  obrigatorioSubcontratado('nomeResponsavelTratamento', c.nomeResponsavelTratamento),
  obrigatorioSubcontratado('finalidade', c.finalidadeSubcontratado),
  obrigatorioSubcontratado('responsavelConjunto', c.responsavelConjunto),
  obrigatorioSubcontratado('baseLegal', c.baseLegal),
  obrigatorioSubcontratado('recolhaDados', c.recolhaDados),
  obrigatorioSubcontratado('categoriasTitulares', c.categoriasTitulares),
  obrigatorioSubcontratado('categoriasDados', c.categoriasDados),
  obrigatorioSubcontratado(
    'categoriasEspeciais.aplicavel',
    c['categoriasEspeciais.aplicavel'],
    (registo) => registo.categoriasEspeciais?.aplicavel,
  ),
  obrigatorioSubcontratado('destinatarios', c.destinatarios),
  obrigatorioSubcontratado(
    'transferencias.existem',
    c['transferencias.existem'],
    (registo) => registo.transferencias?.existem,
  ),
  obrigatorioSubcontratado('prazoConservacao', c.prazoConservacao),

  {
    id: 'sub.categoriasEspeciaisPorIdentificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasEspeciais.identificar',
    descricao: 'Se existem categorias especiais de dados, têm de ser identificadas.',
    verificar: (registo) =>
      !ehSubcontratado(registo) ||
      registo.categoriasEspeciais?.aplicavel !== 'sim' ||
      preenchido(registo.categoriasEspeciais?.identificar),
    mensagem: 'Indicaste que há categorias especiais de dados — identifica quais (art. 9.º/1).',
  },
  {
    id: 'sub.transferenciasPorIdentificar',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'transferencias.identificar',
    descricao:
      'Havendo transferências para países terceiros, é preciso identificar o destino (art. 30.º/2 c)).',
    verificar: (registo) =>
      !ehSubcontratado(registo) ||
      registo.transferencias?.existem !== 'sim' ||
      preenchido(registo.transferencias?.identificar),
    mensagem:
      'Indicaste que há transferências para países terceiros — identifica quais (art. 30.º/2 c) e art. 44.º).',
  },
  {
    id: 'sub.outroSubcontratanteSemNome',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'outrosSubcontratantes',
    descricao: 'Cada subcontratante indicado tem de ter nome.',
    verificar: (registo) =>
      !ehSubcontratado(registo) ||
      (registo.outrosSubcontratantes ?? []).every((s) => preenchido(s.nome)),
    mensagem: 'Há um subcontratante sem nome na lista do art. 28.º.',
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
]

export const catalogoRegras: Regra[] = [
  ...regrasComuns,
  ...regrasResponsavel,
  ...regrasSubcontratado,
  ...regrasFicheiro,
]
