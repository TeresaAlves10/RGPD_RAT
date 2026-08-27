import type { Migrador } from '@/domain/migrations/types'
import { UNIDADES_COORDENACAO } from '@/config/organizacao'

/**
 * v5 -> v6: os campos que eram listas fechadas passam a texto livre, com
 * orientação de preenchimento, e aparecem escalas de grandeza, numeração
 * automática e anexos.
 *
 * Converte-se cada lista para o texto legível equivalente, em vez de a
 * deitar fora — quem já tinha escolhido "Colaboradores" fica com
 * "Colaboradores" escrito no campo, e pode reescrever à vontade.
 */

type Obj = Record<string, unknown>

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : undefined
}

function objeto(valor: unknown): Obj {
  return valor && typeof valor === 'object' ? (valor as Obj) : {}
}

/** Rótulos das listas fechadas da v5, para converter ids em texto legível. */
const CATEGORIAS_TITULARES: Record<string, string> = {
  colaboradores: 'Colaboradores',
  candidatos_emprego: 'Candidatos a emprego',
  clientes: 'Clientes',
  fornecedores: 'Fornecedores',
  prestadores_servicos: 'Prestadores de serviços',
  utentes_doentes: 'Utentes/doentes',
  visitantes: 'Visitantes',
  parceiros: 'Parceiros',
  alunos_formandos: 'Alunos/formandos',
  cidadaos: 'Cidadãos',
}

const CATEGORIAS_DADOS: Record<string, string> = {
  identificacao_civil: 'Dados de identificação civil',
  identificacao_fiscal: 'Dados de identificação fiscal',
  identificacao_digital: 'Dados de identificação digital',
  outros_identificativos: 'Outros dados identificativos',
  morada_contacto: 'Dados de morada e contacto',
  profissionais_academicos: 'Dados profissionais e académicos',
  contratuais_patrimoniais: 'Dados contratuais e patrimoniais',
  voz_imagem: 'Dados de voz e imagem',
  saude: 'Dados de saúde',
  situacao_pessoal: 'Dados de situação pessoal',
}

const BASES_LICITUDE: Record<string, string> = {
  consentimento: 'Consentimento (art. 6.º/1 a))',
  execucao_contrato: 'Execução de contrato (art. 6.º/1 b))',
  obrigacao_juridica: 'Cumprimento de obrigação jurídica (art. 6.º/1 c))',
  interesses_vitais: 'Interesses vitais (art. 6.º/1 d))',
  interesse_publico: 'Interesse público ou exercício de autoridade pública (art. 6.º/1 e))',
  interesses_legitimos: 'Interesses legítimos (art. 6.º/1 f))',
}

const MEDIDAS: Record<string, string> = {
  encriptacao: 'Encriptação',
  pseudonimizacao: 'Pseudonimização',
  anonimizacao: 'Anonimização',
  direitos_acesso: 'Gestão de direitos de acesso',
  passwords: 'Política de palavras-passe',
  copias_seguranca: 'Cópias de segurança',
  registo_logs: 'Registo de acessos (logs)',
  ciberseguranca: 'Medidas de cibersegurança',
  politicas_internas: 'Políticas internas de proteção de dados',
  formacao_colaboradores: 'Formação de colaboradores',
  due_diligence: 'Avaliação prévia de subcontratantes',
  controlo_acesso_fisico: 'Controlo de acesso físico',
}

function rotular(dicionario: Record<string, string>, id: unknown): string {
  return typeof id === 'string' ? (dicionario[id] ?? id) : ''
}

function listaParaTexto(
  dicionario: Record<string, string>,
  ids: unknown,
  outra: unknown,
): string | undefined {
  if (!Array.isArray(ids) || ids.length === 0) return undefined
  const partes = ids.map((id) =>
    id === 'outro' && texto(outra) ? String(outra) : rotular(dicionario, id),
  )
  return partes.filter(Boolean).join('; ') || undefined
}

/** As categorias de dados da v5 eram categoria + tipos; junta-se tudo. */
function categoriasDadosParaTexto(valor: unknown): string | undefined {
  if (!Array.isArray(valor) || valor.length === 0) return undefined
  const linhas = valor.map((item) => {
    const obj = objeto(item)
    const categoria =
      obj.categoria === 'outro' && texto(obj.categoriaOutra)
        ? String(obj.categoriaOutra)
        : rotular(CATEGORIAS_DADOS, obj.categoria)
    const tipos = Array.isArray(obj.tipos) ? (obj.tipos as string[]).filter(Boolean).join(', ') : ''
    return tipos ? `${categoria}: ${tipos}` : categoria
  })
  return linhas.filter(Boolean).join('\n') || undefined
}

function medidasParaTexto(valor: unknown): string | undefined {
  if (!Array.isArray(valor) || valor.length === 0) return undefined
  return (
    valor
      .map((item) => {
        const obj = objeto(item)
        return obj.medida === 'outro' && texto(obj.medidaOutra)
          ? String(obj.medidaOutra)
          : rotular(MEDIDAS, obj.medida)
      })
      .filter(Boolean)
      .join('; ') || undefined
  )
}

/**
 * A Unidade de Coordenação era texto livre e passa a lista fechada. Só se
 * converte quando o texto corresponde inequivocamente a uma unidade
 * conhecida; caso contrário fica por escolher e o texto original é
 * preservado nas observações.
 */
function unidadeConhecida(valor: unknown): string | undefined {
  const t = texto(valor)?.toLowerCase()
  if (!t) return undefined
  const unidade = UNIDADES_COORDENACAO.find(
    (u) => t.includes(u.sigla.toLowerCase()) || t.includes(u.nome.toLowerCase()),
  )
  return unidade?.id
}

function observacoesComResiduo(observacoes: unknown, residuos: (string | undefined)[]): string | undefined {
  const linhas = residuos.filter((r): r is string => Boolean(r))
  const base = texto(observacoes)
  if (linhas.length === 0) return base
  const nota = ['Migrado da versão anterior do formulário:', ...linhas.map((l) => `- ${l}`)].join('\n')
  return base ? `${base}\n\n${nota}` : nota
}

/** Campos comuns às duas qualidades, migrados da mesma maneira. */
function migrarComum(registo: Obj, numero: number): Obj {
  const unidade = unidadeConhecida(registo.unidadeCoordenacao)
  return {
    id: registo.id,
    numero,
    estado: registo.estado ?? 'rascunho',
    direcao: registo.direcao,
    unidadeCoordenacao: unidade,
    nomeTratamento: registo.nomeTratamento,
    descricao: registo.descricao,
    gestorProjeto: registo.gestorProjeto,
    aipdRealizada: registo.aipdRealizada,
    medidasTecnicasOrganizativas: medidasParaTexto(registo.medidasTecnicasOrganizativas),
    normativosAplicaveis: texto(registo.normativosAplicaveis),
    anotacoes: registo.anotacoes,
    validacao: registo.validacao,
    residuoUnidade:
      !unidade && texto(registo.unidadeCoordenacao)
        ? `Unidade de Coordenação (texto anterior): ${texto(registo.unidadeCoordenacao)}`
        : undefined,
  }
}

/** As respostas de controlo da v5 tinham "parcial"; agora são texto livre. */
const ROTULO_RESPOSTA: Record<string, string> = {
  sim: 'Sim',
  parcial: 'Parcialmente',
  nao: 'Não',
  nao_aplicavel: 'Não aplicável',
}

function respostaParaTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' ? (ROTULO_RESPOSTA[valor] ?? valor) : undefined
}

/** Uma resposta que era de controlo (com "parcial") e agora é sim/não/NA. */
function respostaParaSimNao(valor: unknown): string | undefined {
  if (valor === 'parcial') return 'sim'
  return typeof valor === 'string' ? valor : undefined
}

const DIREITOS = [
  'deverInformar',
  'direitoAcesso',
  'direitoRetificacao',
  'direitoApagamento',
  'direitoPortabilidade',
  'direitoLimitacao',
  'direitoDecisoesAutomatizadas',
  'direitoOposicao',
  'detecaoNotificacaoViolacoes',
] as const

const CONTROLOS = [
  'procedimentosAcessosDocumentados',
  'procedimentosAcessosImplementados',
  'acessosFormalmenteAutorizados',
  'controlosAcessosPrivilegiados',
  'revisaoPeriodicaAcessos',
  'remocaoAcessosASaida',
] as const

function direitosECOntrolos(registo: Obj): Obj {
  const saida: Obj = {}
  for (const campo of DIREITOS) saida[campo] = respostaParaTexto(registo[campo])
  for (const campo of CONTROLOS) saida[campo] = respostaParaSimNao(registo[campo])
  return saida
}

function migrarResponsavel(registo: Obj, numero: number): Obj {
  const { residuoUnidade, ...comum } = migrarComum(registo, numero)
  const especiais = objeto(registo.categoriasEspeciais)
  const subcontratados = Array.isArray(registo.subcontratados) ? (registo.subcontratados as Obj[]) : []

  return {
    ...comum,
    tipoRegisto: 'responsavel',

    finalidade: texto(registo.finalidade),
    operacoesTratamento: texto(registo.operacoesTratamento),
    dadosPessoais: undefined,
    dadosNecessariosParaFinalidade: registo.dadosNecessariosParaFinalidade,
    categoriasDados: categoriasDadosParaTexto(registo.categoriasDados),
    categoriasEspeciais: texto(especiais.aplicavel),
    categoriasEspeciaisNecessarias: registo.categoriasEspeciaisNecessarias,
    categoriasTitulares: listaParaTexto(
      CATEGORIAS_TITULARES,
      registo.categoriasTitulares,
      registo.categoriasTitularesOutra,
    ),
    entidadesQueEnviamDados: texto(registo.entidadesQueEnviamDados),
    entidadesParaQuemEnvioDados: texto(registo.entidadesParaQuemEnvioDados),
    suportesFisicos: texto(registo.suportesFisicos),
    localizacaoSuportesFisicos: texto(registo.localizacaoSuportesFisicos),

    ferramentasAplicacoes: texto(registo.ferramentasAplicacoes),
    // As contagens eram texto livre e passam a escala: não se adivinha a
    // grandeza a partir do texto, fica por escolher e o valor original
    // segue para as observações.
    numeroCamposComDadosPessoais: undefined,
    volumeDadosPessoais: undefined,
    numeroUtilizadoresComAcesso: undefined,

    // A lista de subcontratados passa a um bloco único de texto.
    entidadesSubcontratadas:
      subcontratados.map((s) => texto(s.nome)).filter(Boolean).join('; ') || undefined,
    operacoesTratamentoSubcontratadas:
      subcontratados.map((s) => texto(s.operacoesTratamento)).filter(Boolean).join('\n') || undefined,
    existeContrato: subcontratados[0] ? respostaParaSimNao(subcontratados[0].existeContrato) : undefined,
    contratoComClausulasProtecaoDados: subcontratados[0]
      ? respostaParaSimNao(subcontratados[0].contratoComClausulasProtecaoDados)
      : undefined,
    transferenciasPaisesTerceiros: subcontratados[0]
      ? respostaParaSimNao(subcontratados[0].transferenciasPaisesTerceiros)
      : undefined,
    auditoriasAoSubcontratado: subcontratados[0]
      ? respostaParaSimNao(subcontratados[0].auditoriasAoSubcontratado)
      : undefined,
    pedidoAutorizacaoCnpd: subcontratados[0]
      ? respostaParaSimNao(subcontratados[0].pedidoAutorizacaoCnpd)
      : undefined,

    baseLicitude: rotular(BASES_LICITUDE, registo.baseLicitude) || undefined,
    consentimentoMecanismosDemonstracao: respostaParaTexto(
      registo.consentimentoMecanismosDemonstracao,
    ),
    consentimentoResponsabilidadeParental: respostaParaSimNao(
      registo.consentimentoResponsabilidadeParental,
    ),
    retencaoDefinidaPelaOrganizacao: respostaParaTexto(registo.retencaoDefinidaPelaOrganizacao),
    retencaoPorNormativosLegais: respostaParaTexto(registo.retencaoPorNormativosLegais),

    ...direitosECOntrolos(registo),

    observacoes: observacoesComResiduo(registo.observacoes, [
      residuoUnidade as string | undefined,
      texto(registo.numeroCamposComDadosPessoais) &&
        `N.º de campos com dados pessoais (valor anterior): ${texto(registo.numeroCamposComDadosPessoais)}`,
      texto(registo.volumeDadosPessoais) &&
        `Volume de dados pessoais (valor anterior): ${texto(registo.volumeDadosPessoais)}`,
      texto(registo.numeroUtilizadoresComAcesso) &&
        `N.º de utilizadores com acesso (valor anterior): ${texto(registo.numeroUtilizadoresComAcesso)}`,
      texto(especiais.identificar) && `Categorias especiais identificadas: ${texto(especiais.identificar)}`,
      texto(registo.diagramaProcesso) && `Diagrama do processo: ${texto(registo.diagramaProcesso)}`,
      subcontratados.length > 1
        ? 'Havia mais do que uma entidade subcontratada; as respostas específicas de cada uma foram juntas nos campos de texto.'
        : undefined,
    ]),
  }
}

function migrarSubcontratado(registo: Obj, numero: number): Obj {
  const { residuoUnidade, ...comum } = migrarComum(registo, numero)
  const especiais = objeto(registo.categoriasEspeciais)
  const transferencias = objeto(registo.transferencias)
  const outros = Array.isArray(registo.outrosSubcontratantes)
    ? (registo.outrosSubcontratantes as Obj[])
    : []

  return {
    ...comum,
    tipoRegisto: 'subcontratado',

    nomeResponsavelTratamento: texto(registo.nomeResponsavelTratamento),
    responsavelConjunto: texto(registo.responsavelConjunto),
    finalidade: texto(registo.finalidade),
    recolhaDados: texto(registo.recolhaDados),
    categoriasDados: categoriasDadosParaTexto(registo.categoriasDados),
    categoriasEspeciais: texto(especiais.aplicavel),
    categoriasTitulares: listaParaTexto(
      CATEGORIAS_TITULARES,
      registo.categoriasTitulares,
      registo.categoriasTitularesOutra,
    ),
    destinatarios: texto(registo.destinatarios),
    transferenciasPaisesTerceiros: texto(transferencias.existem),
    paisesTerceiros: texto(transferencias.identificar),
    baseLegal: rotular(BASES_LICITUDE, registo.baseLegal) || undefined,
    prazoConservacao: texto(registo.prazoConservacao),
    entidadesSubcontratadas:
      outros.map((s) => texto(s.nome)).filter(Boolean).join('; ') || undefined,

    observacoes: observacoesComResiduo(registo.observacoes, [
      residuoUnidade as string | undefined,
      texto(especiais.identificar) && `Categorias especiais identificadas: ${texto(especiais.identificar)}`,
      texto(registo.diagramaEcosistema) && `Diagrama / ecossistema: ${texto(registo.diagramaEcosistema)}`,
      outros.length > 0
        ? `Outros subcontratantes (art. 28.º): ${outros
            .map(
              (s) =>
                `${texto(s.nome) ?? ''}${texto(s.contacto) ? ` (${texto(s.contacto)})` : ''}${
                  texto(s.dataContrato) ? ` — ${texto(s.dataContrato)}` : ''
                }`,
            )
            .filter(Boolean)
            .join('; ')}`
        : undefined,
    ]),
  }
}

export const migradorV5ParaV6: Migrador = {
  de: 5,
  migrar(dados) {
    const registos = Array.isArray(dados.registos) ? (dados.registos as Obj[]) : []
    return {
      ...dados,
      schemaVersion: 6,
      registos: registos.map((registo, indice) =>
        registo.tipoRegisto === 'subcontratado'
          ? migrarSubcontratado(registo, indice + 1)
          : migrarResponsavel(registo, indice + 1),
      ),
    }
  },
}
