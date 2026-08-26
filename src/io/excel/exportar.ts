import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { Registo } from '@/domain/schema/registo'
import {
  baseLicitude,
  categoriasDados,
  categoriasTitulares,
  condicaoArt9,
  mecanismoTransferencia,
  medidasTecnicasOrganizativas,
  type ItemVocabulario,
} from '@/domain/schema/vocabularios'
import { descarregarFicheiro } from '@/io/descarregar'
import { nomeBaseFicheiro } from '@/io/nome-ficheiro'
import {
  rotuloAipd,
  rotuloBaseLicitude,
  rotuloCategoriasDados,
  rotuloMecanismoTransferencia,
  rotuloMedidas,
  rotuloSimNao,
  rotulosCategoriasTitulares,
  rotulosCondicaoArt9,
} from '@/io/excel/rotulos'
import { textos } from '@/i18n/pt'

export const NOME_FOLHA_REGISTOS = 'Registos'
export const NOME_FOLHA_LISTAS = 'Listas'
export const NOME_FOLHA_DADOS = '_dados'

/** Tamanho máximo de cada fragmento de JSON escrito na folha _dados (limite de célula do Excel é 32767). */
const TAMANHO_FRAGMENTO_DADOS = 30000

const CABECALHOS_REGISTOS = [
  'ID',
  'Tipo de registo',
  'Estado',
  'Direção / Área / Serviço',
  'Unidade de Coordenação',
  'Nome do tratamento',
  'Descrição',
  'Nome do GP',
  'Contacto do GP',
  'Finalidades',
  'Responsável conjunto',
  'Representante',
  'Base de licitude',
  'Recolha de dados',
  'Categorias de titulares',
  'Categorias e tipos de dados',
  'Categorias especiais aplicável',
  'Condição art. 9.º/2',
  'Identificação categorias especiais',
  'Destinatários',
  'Prazo de conservação',
  'Subcontratantes contratados',
  'Responsáveis (subcontratado)',
  'Transferências internacionais',
  'Países/organizações de destino',
  'Mecanismo de transferência',
  'Medidas técnicas e organizativas',
  'AIPD realizada',
  'Observações',
  'Avaliação de controlos preenchida',
] as const

function linhaRegisto(registo: Registo): (string | number)[] {
  const comum = [
    registo.id,
    registo.tipoRegisto === 'responsavel' ? 'Responsável' : 'Subcontratado',
    textos.estado[registo.estado],
    registo.direcao,
    registo.unidadeCoordenacao ?? '',
    registo.nomeTratamento,
    registo.descricao ?? '',
    registo.gestorProjeto.nome,
    registo.gestorProjeto.contacto,
  ]

  const especifico =
    registo.tipoRegisto === 'responsavel'
      ? [
          registo.finalidades,
          registo.responsavelConjunto ?? '',
          registo.representante ?? '',
          rotuloBaseLicitude(registo.baseLicitude),
          registo.recolhaDados,
          rotulosCategoriasTitulares(registo.categoriasTitulares, registo.categoriasTitularesOutra),
          rotuloCategoriasDados(registo.categoriasDados),
          rotuloSimNao(registo.categoriasEspeciais.aplicavel),
          rotulosCondicaoArt9(registo.categoriasEspeciais.condicoesArt9),
          registo.categoriasEspeciais.identificar ?? '',
          registo.destinatarios ?? '',
          registo.prazoConservacao,
          (registo.subcontratantesContratados ?? [])
            .map((s) => `${s.nome}${s.contacto ? ` (${s.contacto})` : ''}${s.dataContrato ? ` — ${s.dataContrato}` : ''}`)
            .join('; '),
          '',
        ]
      : [
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          registo.responsaveis
            .map((r) => `${r.nome}${r.contacto ? ` (${r.contacto})` : ''}: ${r.categoriasTratamento}`)
            .join('; '),
        ]

  const cauda = [
    rotuloSimNao(registo.transferenciasInternacionais.existem),
    (registo.transferenciasInternacionais.paisesOuOrganizacoes ?? []).join('; '),
    registo.transferenciasInternacionais.existem ? rotuloMecanismoTransferencia(registo.transferenciasInternacionais) : '',
    rotuloMedidas(registo.medidasTecnicasOrganizativas),
    rotuloAipd(registo.aipdRealizada),
    registo.observacoes ?? '',
    rotuloSimNao(Boolean(registo.avaliacao)),
  ]

  return [...comum, ...especifico, ...cauda]
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

  const folhaRegistos = workbook.addWorksheet(NOME_FOLHA_REGISTOS)
  folhaRegistos.addRow([...CABECALHOS_REGISTOS])
  folhaRegistos.getRow(1).font = { bold: true }
  for (const registo of ficheiro.registos) {
    folhaRegistos.addRow(linhaRegisto(registo))
  }
  folhaRegistos.columns.forEach((coluna) => {
    coluna.width = 28
  })

  const folhaListas = workbook.addWorksheet(NOME_FOLHA_LISTAS)
  escreverTabelaVocabulario(folhaListas, 'Base de licitude (art. 6.º/1)', ['id', 'label', 'artigo'], linhasVocabulario(baseLicitude))
  escreverTabelaVocabulario(folhaListas, 'Condição do art. 9.º/2', ['id', 'label', 'artigo'], linhasVocabulario(condicaoArt9))
  escreverTabelaVocabulario(folhaListas, 'Categorias de titulares', ['id', 'label'], categoriasTitulares.map((i) => [i.id, i.label]))
  escreverTabelaVocabulario(
    folhaListas,
    'Categorias e tipos de dados',
    ['id', 'label', 'tipos (exemplos)'],
    categoriasDados.map((i) => [i.id, i.label, i.tipos.join(', ')]),
  )
  escreverTabelaVocabulario(
    folhaListas,
    'Mecanismo de transferência internacional',
    ['id', 'label', 'artigo'],
    linhasVocabulario(mecanismoTransferencia),
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
