import type { Migrador } from '@/domain/migrations/types'

/**
 * v4 -> v5: reorganização de fundo do registo, para o formulário passar a
 * seguir as secções que o utilizador especificou.
 *
 * O que muda:
 *  - O responsável deixa de ter a matriz aninhada (`matriz.*`) e o módulo
 *    de avaliação à parte (`avaliacao.*`): os campos passam a estar ao
 *    nível do registo, agrupados nas sete secções da especificação.
 *  - O subcontratado passa a ter `nomeResponsavelTratamento` (texto) em
 *    vez do array `responsaveis`, e `transferencias` em vez de
 *    `transferenciasInternacionais`.
 *  - `estado: 'pronto'` passa a `'submetido'`.
 *
 * Transporta-se tudo o que tem destino inequívoco. O que não tem — as
 * condições do art. 9.º, o mecanismo de transferência, o critério do
 * prazo — é anexado às observações em vez de ser deitado fora, para que
 * uma migração nunca faça perder texto escrito por uma equipa.
 */

type Obj = Record<string, unknown>

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : undefined
}

function objeto(valor: unknown): Obj {
  return valor && typeof valor === 'object' ? (valor as Obj) : {}
}

function simNaoDeBooleano(valor: unknown): string | undefined {
  if (valor === true) return 'sim'
  if (valor === false) return 'nao'
  return typeof valor === 'string' ? valor : undefined
}

/** Junta às observações o texto que não tem campo de destino em v5. */
function observacoesComResiduo(observacoes: unknown, residuos: (string | undefined)[]): string | undefined {
  const linhas = residuos.filter((r): r is string => Boolean(r))
  const base = texto(observacoes)
  if (linhas.length === 0) return base
  const nota = ['Migrado da versão anterior do formulário:', ...linhas.map((l) => `- ${l}`)].join('\n')
  return base ? `${base}\n\n${nota}` : nota
}

function migrarEstado(estado: unknown): string {
  return estado === 'pronto' ? 'submetido' : typeof estado === 'string' ? estado : 'rascunho'
}

function migrarResponsavel(registo: Obj): Obj {
  const matriz = objeto(registo.matriz)
  const caracterizacao = objeto(matriz.caracterizacao)
  const ferramentas = objeto(matriz.ferramentas)
  const licitude = objeto(matriz.licitudeRetencao)
  const avaliacao = objeto(registo.avaliacao)
  const requisitos = objeto(avaliacao.requisitosFuncionais)
  const controlos = objeto(avaliacao.controlosOperacionais)
  const ferramentasAvaliacao = objeto(avaliacao.ferramentasSistemas)
  const governoSubcontratacao = objeto(avaliacao.governoSubcontratacao)
  const governoConsentimento = objeto(avaliacao.governoConsentimento)
  const especiais = objeto(registo.categoriasEspeciais)

  const subcontratadosDaMatriz = Array.isArray(matriz.subcontratados) ? matriz.subcontratados : []
  const subcontratantesAntigos = Array.isArray(registo.subcontratantesContratados)
    ? (registo.subcontratantesContratados as Obj[])
    : []

  // Se a matriz não trazia detalhe, aproveita-se pelo menos o nome dos
  // subcontratantes contratados, mais as respostas do módulo de avaliação.
  const subcontratados =
    subcontratadosDaMatriz.length > 0
      ? subcontratadosDaMatriz
      : subcontratantesAntigos.map((s) => ({
          nome: texto(s.nome),
          existeContrato: texto(governoSubcontratacao.existeContrato),
          contratoComClausulasProtecaoDados: texto(
            governoSubcontratacao.contratoComClausulasProtecaoDados,
          ),
          auditoriasAoSubcontratado: texto(governoSubcontratacao.auditoriasAoSubcontratado),
          pedidoAutorizacaoCnpd: texto(governoSubcontratacao.pedidoAutorizacaoCnpd),
        }))

  const transferencias = objeto(registo.transferenciasInternacionais)
  const paises = Array.isArray(transferencias.paisesOuOrganizacoes)
    ? (transferencias.paisesOuOrganizacoes as string[]).join('; ')
    : undefined

  const migrado: Obj = {
    id: registo.id,
    tipoRegisto: 'responsavel',
    estado: migrarEstado(registo.estado),
    direcao: registo.direcao,
    unidadeCoordenacao: registo.unidadeCoordenacao,
    nomeTratamento: registo.nomeTratamento,
    descricao: registo.descricao,
    gestorProjeto: registo.gestorProjeto,
    anotacoes: registo.anotacoes,

    // 1. Descrição do Processo / Caracterização
    finalidade: texto(registo.finalidades),
    operacoesTratamento: texto(caracterizacao.operacoesTratamento),
    trataDadosPessoais: texto(caracterizacao.temDadosPessoais),
    dadosNecessariosParaFinalidade: texto(caracterizacao.dadosNecessariosParaFinalidade),
    categoriasEspeciais: {
      aplicavel: simNaoDeBooleano(especiais.aplicavel),
      identificar: texto(especiais.identificar),
    },
    categoriasEspeciaisNecessarias: texto(caracterizacao.categoriasEspeciaisNecessarias),
    categoriasTitulares: registo.categoriasTitulares,
    categoriasTitularesOutra: registo.categoriasTitularesOutra,
    categoriasDados: registo.categoriasDados,
    entidadesQueEnviamDados: texto(caracterizacao.entidadesQueEnviamDados),
    entidadesParaQuemEnvioDados:
      texto(caracterizacao.entidadesParaQuemEnvioDados) ?? texto(registo.destinatarios),
    suportesFisicos: texto(caracterizacao.suportesFisicos) ?? texto(ferramentasAvaliacao.suportesFisicos),
    localizacaoSuportesFisicos:
      texto(caracterizacao.localizacaoSuportesFisicos) ??
      texto(ferramentasAvaliacao.localizacaoSuportesFisicos),

    // 2. Ferramentas / Aplicações
    ferramentasAplicacoes:
      texto(ferramentas.ferramentasAplicacoes) ?? texto(ferramentasAvaliacao.ferramentasAplicacoes),
    numeroCamposComDadosPessoais:
      texto(ferramentas.numeroCamposComDadosPessoais) ??
      texto(ferramentasAvaliacao.numeroCamposComDadosPessoais),
    volumeDadosPessoais:
      texto(ferramentas.volumeDadosPessoais) ?? texto(ferramentasAvaliacao.volumeDadosPessoais),
    numeroUtilizadoresComAcesso:
      texto(ferramentas.numeroUtilizadoresComAcesso) ??
      texto(ferramentasAvaliacao.numeroUtilizadoresComAcesso),

    // 3. Subcontratados
    subcontratados: subcontratados.length > 0 ? subcontratados : undefined,

    // 4. Base de Licitude
    baseLicitude: registo.baseLicitude,
    consentimentoMecanismosDemonstracao:
      texto(licitude.mecanismosDemonstracaoConsentimento) ??
      texto(governoConsentimento.mecanismosDemonstracaoConsentimento),
    consentimentoResponsabilidadeParental:
      texto(licitude.consentimentoResponsabilidadeParental) ??
      texto(governoConsentimento.consentimentoResponsabilidadeParental),
    retencaoDefinidaPelaOrganizacao: texto(licitude.retencaoDefinidaPelaOrganizacao),
    retencaoPorNormativosLegais: texto(licitude.retencaoPorNormativosLegais),

    // 5. Requisitos Funcionais / Direitos dos Titulares
    deverInformar: texto(requisitos.deverInformar),
    direitoAcesso: texto(requisitos.direitoAcesso),
    direitoRetificacao: texto(requisitos.direitoRetificacao),
    direitoApagamento: texto(requisitos.direitoApagamento),
    direitoPortabilidade: texto(requisitos.direitoPortabilidade),
    direitoLimitacao: texto(requisitos.direitoLimitacao),
    direitoDecisoesAutomatizadas: texto(requisitos.direitoNaoDecisoesAutomatizadas),
    direitoOposicao: texto(requisitos.direitoOposicao),
    detecaoNotificacaoViolacoes: texto(requisitos.detecaoNotificacaoViolacoes),

    // 6. Controlos Operacionais
    procedimentosAcessosDocumentados: texto(controlos.procedimentosAcessosDocumentados),
    procedimentosAcessosImplementados: texto(controlos.procedimentosAcessosImplementados),
    acessosFormalmenteAutorizados: texto(controlos.acessosFormalmenteAutorizados),
    controlosAcessosPrivilegiados: texto(controlos.controlosAcessosPrivilegiados),
    revisaoPeriodicaAcessos: texto(controlos.revisaoPeriodicaAcessos),
    remocaoAcessosASaida: texto(controlos.remocaoAcessosASaida),

    // 7. Observações Gerais
    medidasTecnicasOrganizativas: registo.medidasTecnicasOrganizativas,
    normativosAplicaveis: texto(matriz.normativosAplicaveis) ?? texto(avaliacao.normativosAplicaveis),
    diagramaProcesso: texto(matriz.diagramaProcesso) ?? texto(avaliacao.diagramaProcesso),
    aipdRealizada: registo.aipdRealizada,
    observacoes: observacoesComResiduo(registo.observacoes, [
      texto(registo.prazoConservacao) && `Prazo de conservação: ${texto(registo.prazoConservacao)}`,
      texto(registo.criterioPrazoConservacao) &&
        `Critério do prazo de conservação: ${texto(registo.criterioPrazoConservacao)}`,
      texto(registo.recolhaDados) && `Recolha dos dados: ${texto(registo.recolhaDados)}`,
      texto(registo.responsavelConjunto) && `Responsável conjunto: ${texto(registo.responsavelConjunto)}`,
      texto(registo.representante) && `Representante: ${texto(registo.representante)}`,
      Array.isArray(especiais.condicoesArt9) && (especiais.condicoesArt9 as string[]).length > 0
        ? `Condições do art. 9.º/2: ${(especiais.condicoesArt9 as string[]).join('; ')}`
        : undefined,
      transferencias.existem === true
        ? `Transferências internacionais: ${paises ?? 'sim'}${
            texto(transferencias.mecanismo) ? ` (mecanismo: ${texto(transferencias.mecanismo)})` : ''
          }`
        : undefined,
      texto(matriz.comentarios) && `Comentários: ${texto(matriz.comentarios)}`,
      texto(controlos.notas) && `Notas dos controlos de acesso: ${texto(controlos.notas)}`,
    ]),
  }

  return migrado
}

function migrarSubcontratado(registo: Obj): Obj {
  const responsaveis = Array.isArray(registo.responsaveis) ? (registo.responsaveis as Obj[]) : []
  const especiais = objeto(registo.categoriasEspeciais)
  const transferenciasAntigas = objeto(registo.transferenciasInternacionais)
  const paises = Array.isArray(transferenciasAntigas.paisesOuOrganizacoes)
    ? (transferenciasAntigas.paisesOuOrganizacoes as string[]).join('; ')
    : undefined

  // v4 permitia vários responsáveis por registo; v5 tem um nome por
  // registo. Junta-se a lista num só campo em vez de perder os restantes.
  const nomeResponsavel = responsaveis.map((r) => texto(r.nome)).filter(Boolean).join('; ')
  const categoriasPorResponsavel = responsaveis
    .map((r) => {
      const nome = texto(r.nome)
      const cats = texto(r.categoriasTratamento)
      return nome && cats ? `${nome}: ${cats}` : (cats ?? undefined)
    })
    .filter((l): l is string => Boolean(l))

  return {
    id: registo.id,
    tipoRegisto: 'subcontratado',
    estado: migrarEstado(registo.estado),
    direcao: registo.direcao,
    unidadeCoordenacao: registo.unidadeCoordenacao,
    nomeTratamento: registo.nomeTratamento,
    descricao: registo.descricao,
    gestorProjeto: registo.gestorProjeto,
    anotacoes: registo.anotacoes,

    nomeResponsavelTratamento: nomeResponsavel || undefined,
    finalidade: texto(registo.finalidades),
    responsavelConjunto: texto(registo.responsavelConjunto),
    baseLegal: registo.baseLicitude,
    recolhaDados: texto(registo.recolhaDados),
    categoriasTitulares: registo.categoriasTitulares,
    categoriasTitularesOutra: registo.categoriasTitularesOutra,
    categoriasDados: registo.categoriasDados,
    categoriasEspeciais: {
      aplicavel: simNaoDeBooleano(especiais.aplicavel),
      identificar: texto(especiais.identificar),
    },
    destinatarios: texto(registo.destinatarios),
    transferencias: {
      existem: simNaoDeBooleano(transferenciasAntigas.existem),
      identificar: paises,
    },
    prazoConservacao: texto(registo.prazoConservacao),
    medidasTecnicasOrganizativas: registo.medidasTecnicasOrganizativas,
    outrosSubcontratantes: registo.subcontratantesContratados,
    aipdRealizada: registo.aipdRealizada,
    observacoes: observacoesComResiduo(registo.observacoes, [
      categoriasPorResponsavel.length > 0
        ? `Categorias de tratamento por responsável — ${categoriasPorResponsavel.join(' | ')}`
        : undefined,
      texto(registo.representante) && `Representante: ${texto(registo.representante)}`,
      texto(registo.criterioPrazoConservacao) &&
        `Critério do prazo de conservação: ${texto(registo.criterioPrazoConservacao)}`,
      texto(transferenciasAntigas.mecanismo) &&
        `Mecanismo de transferência: ${texto(transferenciasAntigas.mecanismo)}`,
    ]),
  }
}

export const migradorV4ParaV5: Migrador = {
  de: 4,
  migrar(dados) {
    const registos = Array.isArray(dados.registos) ? (dados.registos as Obj[]) : []
    return {
      ...dados,
      schemaVersion: 5,
      registos: registos.map((registo) =>
        registo.tipoRegisto === 'subcontratado' ? migrarSubcontratado(registo) : migrarResponsavel(registo),
      ),
    }
  },
}
