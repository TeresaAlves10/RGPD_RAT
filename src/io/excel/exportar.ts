import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import {
  baseLicitude,
  categoriasDados,
  categoriasTitulares,
  medidasTecnicasOrganizativas,
  type ItemVocabulario,
} from '@/domain/schema/vocabularios'
import { descarregarFicheiro } from '@/io/descarregar'
import { nomeBaseFicheiro } from '@/io/nome-ficheiro'
import {
  rotuloBaseLicitude,
  rotuloCategoriasDados,
  rotuloMedidas,
  rotuloResposta,
  rotulosCategoriasTitulares,
} from '@/io/excel/rotulos'
import { textos } from '@/i18n/pt'

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

const COLUNAS_RESPONSAVEL: Coluna<RegistoResponsavel>[] = [
  { cabecalho: 'ID', ler: (r) => r.id },
  { cabecalho: textos.estado.etiqueta, ler: (r) => textos.estado[r.estado] },

  // 1. Descrição do Processo / Caracterização
  { cabecalho: c.direcao, ler: (r) => r.direcao },
  { cabecalho: c.unidadeCoordenacao, ler: (r) => r.unidadeCoordenacao ?? '' },
  { cabecalho: c.nomeTratamento, ler: (r) => r.nomeTratamento },
  { cabecalho: c.descricao, ler: (r) => r.descricao ?? '' },
  { cabecalho: c.finalidade, ler: (r) => r.finalidade ?? '' },
  { cabecalho: c.operacoesTratamento, ler: (r) => r.operacoesTratamento ?? '' },
  { cabecalho: c.trataDadosPessoais, ler: (r) => rotuloResposta(r.trataDadosPessoais) },
  {
    cabecalho: c.dadosNecessariosParaFinalidade,
    ler: (r) => rotuloResposta(r.dadosNecessariosParaFinalidade),
  },
  {
    cabecalho: c['categoriasEspeciais.aplicavel'],
    ler: (r) => rotuloResposta(r.categoriasEspeciais?.aplicavel),
  },
  {
    cabecalho: c['categoriasEspeciais.identificar'],
    ler: (r) => r.categoriasEspeciais?.identificar ?? '',
  },
  {
    cabecalho: c.categoriasEspeciaisNecessarias,
    ler: (r) => rotuloResposta(r.categoriasEspeciaisNecessarias),
  },
  {
    cabecalho: c.categoriasTitulares,
    ler: (r) => rotulosCategoriasTitulares(r.categoriasTitulares, r.categoriasTitularesOutra),
  },
  { cabecalho: c.categoriasDados, ler: (r) => rotuloCategoriasDados(r.categoriasDados) },
  { cabecalho: c.entidadesQueEnviamDados, ler: (r) => r.entidadesQueEnviamDados ?? '' },
  { cabecalho: c.entidadesParaQuemEnvioDados, ler: (r) => r.entidadesParaQuemEnvioDados ?? '' },
  { cabecalho: c.suportesFisicos, ler: (r) => r.suportesFisicos ?? '' },
  { cabecalho: c.localizacaoSuportesFisicos, ler: (r) => r.localizacaoSuportesFisicos ?? '' },

  // 2. Ferramentas / Aplicações
  { cabecalho: c.ferramentasAplicacoes, ler: (r) => r.ferramentasAplicacoes ?? '' },
  { cabecalho: c.numeroCamposComDadosPessoais, ler: (r) => r.numeroCamposComDadosPessoais ?? '' },
  { cabecalho: c.volumeDadosPessoais, ler: (r) => r.volumeDadosPessoais ?? '' },
  { cabecalho: c.numeroUtilizadoresComAcesso, ler: (r) => r.numeroUtilizadoresComAcesso ?? '' },

  // 3. Subcontratados — uma célula por pergunta, com uma linha por entidade
  {
    cabecalho: c['subcontratado.nome'],
    ler: (r) => (r.subcontratados ?? []).map((s) => s.nome ?? '').join('\n'),
  },
  {
    cabecalho: c['subcontratado.operacoesTratamento'],
    ler: (r) => (r.subcontratados ?? []).map((s) => s.operacoesTratamento ?? '').join('\n'),
  },
  {
    cabecalho: c['subcontratado.existeContrato'],
    ler: (r) => (r.subcontratados ?? []).map((s) => rotuloResposta(s.existeContrato)).join('\n'),
  },
  {
    cabecalho: c['subcontratado.contratoComClausulasProtecaoDados'],
    ler: (r) =>
      (r.subcontratados ?? [])
        .map((s) => rotuloResposta(s.contratoComClausulasProtecaoDados))
        .join('\n'),
  },
  {
    cabecalho: c['subcontratado.transferenciasPaisesTerceiros'],
    ler: (r) =>
      (r.subcontratados ?? []).map((s) => rotuloResposta(s.transferenciasPaisesTerceiros)).join('\n'),
  },
  {
    cabecalho: c['subcontratado.auditoriasAoSubcontratado'],
    ler: (r) =>
      (r.subcontratados ?? []).map((s) => rotuloResposta(s.auditoriasAoSubcontratado)).join('\n'),
  },
  {
    cabecalho: c['subcontratado.pedidoAutorizacaoCnpd'],
    ler: (r) => (r.subcontratados ?? []).map((s) => rotuloResposta(s.pedidoAutorizacaoCnpd)).join('\n'),
  },

  // 4. Base de Licitude
  { cabecalho: c.baseLicitude, ler: (r) => rotuloBaseLicitude(r.baseLicitude) },
  {
    cabecalho: c.consentimentoMecanismosDemonstracao,
    ler: (r) => rotuloResposta(r.consentimentoMecanismosDemonstracao),
  },
  {
    cabecalho: c.consentimentoResponsabilidadeParental,
    ler: (r) => rotuloResposta(r.consentimentoResponsabilidadeParental),
  },
  {
    cabecalho: c.retencaoDefinidaPelaOrganizacao('a organização'),
    ler: (r) => rotuloResposta(r.retencaoDefinidaPelaOrganizacao),
  },
  {
    cabecalho: c.retencaoPorNormativosLegais,
    ler: (r) => rotuloResposta(r.retencaoPorNormativosLegais),
  },

  // 5. Requisitos Funcionais / Direitos dos Titulares
  { cabecalho: c.deverInformar, ler: (r) => rotuloResposta(r.deverInformar) },
  { cabecalho: c.direitoAcesso, ler: (r) => rotuloResposta(r.direitoAcesso) },
  { cabecalho: c.direitoRetificacao, ler: (r) => rotuloResposta(r.direitoRetificacao) },
  { cabecalho: c.direitoApagamento, ler: (r) => rotuloResposta(r.direitoApagamento) },
  { cabecalho: c.direitoPortabilidade, ler: (r) => rotuloResposta(r.direitoPortabilidade) },
  { cabecalho: c.direitoLimitacao, ler: (r) => rotuloResposta(r.direitoLimitacao) },
  {
    cabecalho: c.direitoDecisoesAutomatizadas,
    ler: (r) => rotuloResposta(r.direitoDecisoesAutomatizadas),
  },
  { cabecalho: c.direitoOposicao, ler: (r) => rotuloResposta(r.direitoOposicao) },
  {
    cabecalho: c.detecaoNotificacaoViolacoes,
    ler: (r) => rotuloResposta(r.detecaoNotificacaoViolacoes),
  },

  // 6. Controlos Operacionais
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

  // 7. Observações Gerais
  {
    cabecalho: c.medidasTecnicasOrganizativas,
    ler: (r) => rotuloMedidas(r.medidasTecnicasOrganizativas),
  },
  { cabecalho: c.normativosAplicaveis, ler: (r) => r.normativosAplicaveis ?? '' },
  { cabecalho: c.diagramaProcesso, ler: (r) => r.diagramaProcesso ?? '' },
  { cabecalho: c.aipdRealizada, ler: (r) => rotuloResposta(r.aipdRealizada) },
  { cabecalho: c['gestorProjeto.nome'], ler: (r) => r.gestorProjeto.nome },
  { cabecalho: c['gestorProjeto.contacto'], ler: (r) => r.gestorProjeto.contacto ?? '' },
  { cabecalho: c.observacoes, ler: (r) => r.observacoes ?? '' },
]

const COLUNAS_SUBCONTRATANTE: Coluna<RegistoSubcontratado>[] = [
  { cabecalho: 'ID', ler: (r) => r.id },
  { cabecalho: textos.estado.etiqueta, ler: (r) => textos.estado[r.estado] },
  { cabecalho: c.nomeResponsavelTratamento, ler: (r) => r.nomeResponsavelTratamento ?? '' },
  { cabecalho: c.direcao, ler: (r) => r.direcao },
  { cabecalho: c.unidadeCoordenacao, ler: (r) => r.unidadeCoordenacao ?? '' },
  { cabecalho: c.nomeTratamento, ler: (r) => r.nomeTratamento },
  { cabecalho: c.descricao, ler: (r) => r.descricao ?? '' },
  { cabecalho: c.finalidadeSubcontratado, ler: (r) => r.finalidade ?? '' },
  { cabecalho: c.responsavelConjunto, ler: (r) => r.responsavelConjunto ?? '' },
  { cabecalho: c.baseLegal, ler: (r) => rotuloBaseLicitude(r.baseLegal) },
  { cabecalho: c.recolhaDados, ler: (r) => r.recolhaDados ?? '' },
  {
    cabecalho: c.categoriasTitulares,
    ler: (r) => rotulosCategoriasTitulares(r.categoriasTitulares, r.categoriasTitularesOutra),
  },
  { cabecalho: c.categoriasDados, ler: (r) => rotuloCategoriasDados(r.categoriasDados) },
  {
    cabecalho: c['categoriasEspeciais.aplicavel'],
    ler: (r) => rotuloResposta(r.categoriasEspeciais?.aplicavel),
  },
  {
    cabecalho: c['categoriasEspeciais.identificar'],
    ler: (r) => r.categoriasEspeciais?.identificar ?? '',
  },
  { cabecalho: c.destinatarios, ler: (r) => r.destinatarios ?? '' },
  {
    cabecalho: c['transferencias.existem'],
    ler: (r) => rotuloResposta(r.transferencias?.existem),
  },
  {
    cabecalho: c['transferencias.identificar'],
    ler: (r) => r.transferencias?.identificar ?? '',
  },
  { cabecalho: c.prazoConservacao, ler: (r) => r.prazoConservacao ?? '' },
  {
    cabecalho: c.medidasTecnicasOrganizativas,
    ler: (r) => rotuloMedidas(r.medidasTecnicasOrganizativas),
  },
  {
    cabecalho: c.outrosSubcontratantes,
    ler: (r) =>
      (r.outrosSubcontratantes ?? [])
        .map(
          (s) =>
            `${s.nome ?? ''}${s.contacto ? ` (${s.contacto})` : ''}${
              s.dataContrato ? ` — ${s.dataContrato}` : ''
            }`,
        )
        .join('\n'),
  },
  { cabecalho: c.observacoes, ler: (r) => r.observacoes ?? '' },
  { cabecalho: c.diagramaEcosistema, ler: (r) => r.diagramaEcosistema ?? '' },
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

function linhasVocabulario(vocab: ItemVocabulario[]): (string | number)[][] {
  return vocab.map((item) => [item.id, item.label, item.artigo ?? ''])
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
    'Base de licitude (art. 6.º/1)',
    ['id', 'label', 'artigo'],
    linhasVocabulario(baseLicitude),
  )
  escreverTabelaVocabulario(
    folhaListas,
    'Categorias de titulares',
    ['id', 'label'],
    categoriasTitulares.map((i) => [i.id, i.label]),
  )
  escreverTabelaVocabulario(
    folhaListas,
    'Categorias e tipos de dados',
    ['id', 'label', 'tipos (exemplos)'],
    categoriasDados.map((i) => [i.id, i.label, i.tipos.join(', ')]),
  )
  escreverTabelaVocabulario(
    folhaListas,
    'Medidas técnicas e organizativas',
    ['id', 'label', 'tipo'],
    medidasTecnicasOrganizativas.map((i) => [i.id, i.label, i.tipo]),
  )
  folhaListas.columns.forEach((coluna) => {
    coluna.width = 32
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
