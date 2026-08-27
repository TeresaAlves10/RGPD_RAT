import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { descarregarFicheiro } from '@/io/descarregar'
import { nomeBaseFicheiro } from '@/io/nome-ficheiro'
import { rotuloEscala, rotuloResposta, rotuloUnidade } from '@/io/excel/rotulos'
import { tamanhoTotal, formatarTamanho } from '@/domain/schema/anexo'
import { textos } from '@/i18n/pt'
import { NOME_ORGANIZACAO, UNIDADES_COORDENACAO } from '@/config/organizacao'

export const NOME_FOLHA_RESPONSAVEL = 'Responsável'
export const NOME_FOLHA_SUBCONTRATANTE = 'Subcontratante'
export const NOME_FOLHA_LISTAS = 'Listas'
export const NOME_FOLHA_DADOS = '_dados'

/** Limite de célula do Excel é 32767; parte-se o JSON em fragmentos menores. */
const TAMANHO_FRAGMENTO_DADOS = 30000

const c = textos.campos

/**
 * Uma coluna da folha legível: cabeçalho e como se lê o valor do registo.
 * As colunas seguem a ordem das secções da especificação, para a folha se
 * ler como o formulário.
 */
interface Coluna<T> {
  cabecalho: string
  ler: (registo: T) => string
}

/** Colunas do responsável, na ordem das sete secções do formulário. */
const COLUNAS_RESPONSAVEL: Coluna<RegistoResponsavel>[] = [
  { cabecalho: c.numero, ler: (r) => String(r.numero) },
  { cabecalho: textos.estado.etiqueta, ler: (r) => textos.estado[r.estado] },
  { cabecalho: c.direcao, ler: (r) => r.direcao ?? '' },
  { cabecalho: c.unidadeCoordenacao, ler: (r) => rotuloUnidade(r.unidadeCoordenacao) },
  { cabecalho: c.nomeTratamento, ler: (r) => r.nomeTratamento },
  { cabecalho: c.descricao, ler: (r) => r.descricao ?? '' },
  { cabecalho: c.finalidade, ler: (r) => r.finalidade ?? '' },
  { cabecalho: c.operacoesTratamento, ler: (r) => r.operacoesTratamento ?? '' },
  { cabecalho: c.dadosPessoais, ler: (r) => r.dadosPessoais ?? '' },
  {
    cabecalho: c.dadosNecessariosParaFinalidade,
    ler: (r) => rotuloResposta(r.dadosNecessariosParaFinalidade),
  },
  { cabecalho: c.categoriasDados, ler: (r) => r.categoriasDados ?? '' },
  { cabecalho: c.categoriasEspeciais, ler: (r) => rotuloResposta(r.categoriasEspeciais) },
  {
    cabecalho: c.categoriasEspeciaisNecessarias,
    ler: (r) => rotuloResposta(r.categoriasEspeciaisNecessarias),
  },
  { cabecalho: c.categoriasTitulares, ler: (r) => r.categoriasTitulares ?? '' },
  { cabecalho: c.entidadesQueEnviamDados, ler: (r) => r.entidadesQueEnviamDados ?? '' },
  { cabecalho: c.entidadesParaQuemEnvioDados, ler: (r) => r.entidadesParaQuemEnvioDados ?? '' },
  { cabecalho: c.suportesFisicos, ler: (r) => r.suportesFisicos ?? '' },
  { cabecalho: c.localizacaoSuportesFisicos, ler: (r) => r.localizacaoSuportesFisicos ?? '' },
  { cabecalho: c.ferramentasAplicacoes, ler: (r) => r.ferramentasAplicacoes ?? '' },
  {
    cabecalho: c.numeroCamposComDadosPessoais,
    ler: (r) => rotuloEscala(r.numeroCamposComDadosPessoais),
  },
  { cabecalho: c.volumeDadosPessoais, ler: (r) => rotuloEscala(r.volumeDadosPessoais) },
  {
    cabecalho: c.numeroUtilizadoresComAcesso,
    ler: (r) => rotuloEscala(r.numeroUtilizadoresComAcesso),
  },
  { cabecalho: c.entidadesSubcontratadas, ler: (r) => r.entidadesSubcontratadas ?? '' },
  {
    cabecalho: c.operacoesTratamentoSubcontratadas,
    ler: (r) => r.operacoesTratamentoSubcontratadas ?? '',
  },
  { cabecalho: c.existeContrato, ler: (r) => rotuloResposta(r.existeContrato) },
  {
    cabecalho: c.contratoComClausulasProtecaoDados,
    ler: (r) => rotuloResposta(r.contratoComClausulasProtecaoDados),
  },
  { cabecalho: c.anexosContrato, ler: (r) => (r.anexosContrato ?? []).map((a) => a.nome).join('\n') },
  {
    cabecalho: c.transferenciasPaisesTerceiros,
    ler: (r) => rotuloResposta(r.transferenciasPaisesTerceiros),
  },
  { cabecalho: c.paisesTerceiros, ler: (r) => r.paisesTerceiros ?? '' },
  { cabecalho: c.auditoriasAoSubcontratado, ler: (r) => rotuloResposta(r.auditoriasAoSubcontratado) },
  { cabecalho: c.pedidoAutorizacaoCnpd, ler: (r) => rotuloResposta(r.pedidoAutorizacaoCnpd) },
  { cabecalho: c.baseLicitude, ler: (r) => r.baseLicitude ?? '' },
  {
    cabecalho: c.consentimentoMecanismosDemonstracao,
    ler: (r) => r.consentimentoMecanismosDemonstracao ?? '',
  },
  {
    cabecalho: c.consentimentoResponsabilidadeParental,
    ler: (r) => rotuloResposta(r.consentimentoResponsabilidadeParental),
  },
  {
    cabecalho: c.retencaoDefinidaPelaOrganizacao(NOME_ORGANIZACAO),
    ler: (r) => r.retencaoDefinidaPelaOrganizacao ?? '',
  },
  { cabecalho: c.criterioRetencao(NOME_ORGANIZACAO), ler: (r) => r.criterioRetencao ?? '' },
  { cabecalho: c.retencaoPorNormativosLegais, ler: (r) => r.retencaoPorNormativosLegais ?? '' },
  { cabecalho: c.deverInformar, ler: (r) => r.deverInformar ?? '' },
  { cabecalho: c.direitoAcesso, ler: (r) => r.direitoAcesso ?? '' },
  { cabecalho: c.direitoRetificacao, ler: (r) => r.direitoRetificacao ?? '' },
  { cabecalho: c.direitoApagamento, ler: (r) => r.direitoApagamento ?? '' },
  { cabecalho: c.direitoPortabilidade, ler: (r) => r.direitoPortabilidade ?? '' },
  { cabecalho: c.direitoLimitacao, ler: (r) => r.direitoLimitacao ?? '' },
  { cabecalho: c.direitoDecisoesAutomatizadas, ler: (r) => r.direitoDecisoesAutomatizadas ?? '' },
  { cabecalho: c.direitoOposicao, ler: (r) => r.direitoOposicao ?? '' },
  {
    cabecalho: c.procedimentosAcessosDocumentados,
    ler: (r) => rotuloResposta(r.procedimentosAcessosDocumentados),
  },
  {
    cabecalho: c.procedimentosAcessosImplementados,
    ler: (r) => rotuloResposta(r.procedimentosAcessosImplementados),
  },
  {
    cabecalho: c.acessosFormalmenteAutorizados,
    ler: (r) => rotuloResposta(r.acessosFormalmenteAutorizados),
  },
  {
    cabecalho: c.controlosAcessosPrivilegiados,
    ler: (r) => rotuloResposta(r.controlosAcessosPrivilegiados),
  },
  { cabecalho: c.revisaoPeriodicaAcessos, ler: (r) => rotuloResposta(r.revisaoPeriodicaAcessos) },
  { cabecalho: c.remocaoAcessosASaida, ler: (r) => rotuloResposta(r.remocaoAcessosASaida) },
  { cabecalho: c.detecaoNotificacaoViolacoes, ler: (r) => r.detecaoNotificacaoViolacoes ?? '' },
  { cabecalho: c.medidasTecnicasOrganizativas, ler: (r) => r.medidasTecnicasOrganizativas ?? '' },
  { cabecalho: c.normativosAplicaveis, ler: (r) => r.normativosAplicaveis ?? '' },
  {
    cabecalho: c.anexos,
    ler: (r) =>
      (r.anexos ?? []).length === 0
        ? ''
        : `${(r.anexos ?? []).map((a) => a.nome).join('\n')}\n(${formatarTamanho(tamanhoTotal(r.anexos))})`,
  },
  { cabecalho: c.aipdRealizada, ler: (r) => rotuloResposta(r.aipdRealizada) },
  { cabecalho: c['gestorProjeto.nome'], ler: (r) => r.gestorProjeto.nome },
  { cabecalho: c['gestorProjeto.contacto'], ler: (r) => r.gestorProjeto.contacto ?? '' },
  { cabecalho: c.observacoes, ler: (r) => r.observacoes ?? '' },
]

/**
 * Colunas do subcontratante, na ordem das cinco secções do formulário —
 * mais curtas do que as do responsável (art. 30.º/2 exige menos).
 */
const COLUNAS_SUBCONTRATANTE: Coluna<RegistoSubcontratado>[] = [
  { cabecalho: c.numero, ler: (r) => String(r.numero) },
  { cabecalho: textos.estado.etiqueta, ler: (r) => textos.estado[r.estado] },
  { cabecalho: c.nomeResponsavelTratamento, ler: (r) => r.nomeResponsavelTratamento ?? '' },
  { cabecalho: c.direcao, ler: (r) => r.direcao ?? '' },
  { cabecalho: c.unidadeCoordenacao, ler: (r) => rotuloUnidade(r.unidadeCoordenacao) },
  { cabecalho: c.nomeTratamento, ler: (r) => r.nomeTratamento },
  { cabecalho: c.descricao, ler: (r) => r.descricao ?? '' },
  { cabecalho: c.finalidade, ler: (r) => r.finalidade ?? '' },
  { cabecalho: c.baseLegal, ler: (r) => r.baseLegal ?? '' },
  { cabecalho: c.recolhaDados, ler: (r) => r.recolhaDados ?? '' },
  { cabecalho: c.categoriasTitulares, ler: (r) => r.categoriasTitulares ?? '' },
  { cabecalho: c.categoriasDados, ler: (r) => r.categoriasDados ?? '' },
  { cabecalho: c.dadosPessoais, ler: (r) => r.dadosPessoais ?? '' },
  { cabecalho: c.categoriasEspeciais, ler: (r) => rotuloResposta(r.categoriasEspeciais) },
  {
    cabecalho: c.transferenciasPaisesTerceiros,
    ler: (r) => rotuloResposta(r.transferenciasPaisesTerceiros),
  },
  { cabecalho: c.paisesTerceiros, ler: (r) => r.paisesTerceiros ?? '' },
  { cabecalho: c.prazoConservacao, ler: (r) => r.prazoConservacao ?? '' },
  { cabecalho: c.criterioRetencao(NOME_ORGANIZACAO), ler: (r) => r.criterioRetencao ?? '' },
  { cabecalho: c.medidasTecnicasOrganizativas, ler: (r) => r.medidasTecnicasOrganizativas ?? '' },
  {
    cabecalho: c.existemOutrosSubcontratantes,
    ler: (r) => rotuloResposta(r.existemOutrosSubcontratantes),
  },
  { cabecalho: c.entidadesSubcontratadas, ler: (r) => r.entidadesSubcontratadas ?? '' },
  { cabecalho: c.observacoes, ler: (r) => r.observacoes ?? '' },
  {
    cabecalho: c.anexos,
    ler: (r) =>
      (r.anexos ?? []).length === 0
        ? ''
        : `${(r.anexos ?? []).map((a) => a.nome).join('\n')}\n(${formatarTamanho(tamanhoTotal(r.anexos))})`,
  },
  { cabecalho: c.aipdRealizada, ler: (r) => rotuloResposta(r.aipdRealizada) },
  { cabecalho: c['gestorProjeto.nome'], ler: (r) => r.gestorProjeto.nome },
  { cabecalho: c['gestorProjeto.contacto'], ler: (r) => r.gestorProjeto.contacto ?? '' },
]

function escreverFolhaLegivel<T>(
  workbook: import('exceljs').Workbook,
  nome: string,
  colunas: Coluna<T>[],
  registos: T[],
) {
  const folha = workbook.addWorksheet(nome)
  folha.addRow(colunas.map((coluna) => coluna.cabecalho))
  folha.getRow(1).font = { bold: true }
  folha.getRow(1).alignment = { wrapText: true, vertical: 'top' }
  for (const registo of registos) {
    folha.addRow(colunas.map((coluna) => coluna.ler(registo)))
  }
  folha.columns.forEach((coluna) => {
    coluna.width = 30
    coluna.alignment = { wrapText: true, vertical: 'top' }
  })
  folha.views = [{ state: 'frozen', ySplit: 1 }]
  return folha
}

function escreverTabelaVocabulario(
  folha: import('exceljs').Worksheet,
  titulo: string,
  cabecalhos: string[],
  linhas: (string | number)[][],
) {
  folha.addRow([titulo])
  folha.addRow(cabecalhos)
  linhas.forEach((linha) => folha.addRow(linha))
  folha.addRow([])
}

export async function gerarExcel(ficheiro: FicheiroRat): Promise<Blob> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'RAT — Registo de Atividades de Tratamento'
  workbook.created = new Date()

  // Uma folha por qualidade: as duas listas de campos são diferentes, e
  // uma folha única obrigaria metade das colunas a ficar sempre vazia.
  escreverFolhaLegivel(
    workbook,
    NOME_FOLHA_RESPONSAVEL,
    COLUNAS_RESPONSAVEL,
    ficheiro.registos.filter((r): r is RegistoResponsavel => r.tipoRegisto === 'responsavel'),
  )
  escreverFolhaLegivel(
    workbook,
    NOME_FOLHA_SUBCONTRATANTE,
    COLUNAS_SUBCONTRATANTE,
    ficheiro.registos.filter((r): r is RegistoSubcontratado => r.tipoRegisto === 'subcontratado'),
  )

  const folhaListas = workbook.addWorksheet(NOME_FOLHA_LISTAS)
  escreverTabelaVocabulario(
    folhaListas,
    'Escala de grandeza (contagens)',
    ['valor', 'significado'],
    [
      [textos.escala.baixo, 'Ordem das dezenas'],
      [textos.escala.medio, 'Ordem das centenas'],
      [textos.escala.elevado, 'Ordem dos milhares'],
    ],
  )
  escreverTabelaVocabulario(
    folhaListas,
    'Estados do registo',
    ['valor', 'significado'],
    [
      [textos.estado.rascunho, textos.estado.rascunhoDescricao],
      [textos.estado.submetido, textos.estado.submetidoDescricao],
      [textos.estado.devolvido, textos.estado.devolvidoDescricao],
      [textos.estado.validado, textos.estado.validadoDescricao],
    ],
  )
  escreverTabelaVocabulario(
    folhaListas,
    'Unidades de Coordenação',
    ['sigla', 'nome'],
    UNIDADES_COORDENACAO.map((u) => [u.sigla, u.nome]),
  )
  folhaListas.columns.forEach((coluna) => {
    coluna.width = 40
  })

  // Folha oculta com o JSON completo: é o que permite reimportar e
  // continuar a editar sem perder nada (CLAUDE.md §7).
  const folhaDados = workbook.addWorksheet(NOME_FOLHA_DADOS)
  const json = JSON.stringify(ficheiro)
  for (let inicio = 0; inicio < json.length; inicio += TAMANHO_FRAGMENTO_DADOS) {
    folhaDados.addRow([json.slice(inicio, inicio + TAMANHO_FRAGMENTO_DADOS)])
  }
  folhaDados.state = 'veryHidden'

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function nomeFicheiroExcel(ficheiro: FicheiroRat): string {
  return `${nomeBaseFicheiro(ficheiro)}.xlsx`
}

export async function exportarExcel(ficheiro: FicheiroRat): Promise<void> {
  const blob = await gerarExcel(ficheiro)
  descarregarFicheiro(nomeFicheiroExcel(ficheiro), blob)
}
