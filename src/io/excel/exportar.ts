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
  'Critério do prazo de conservação',
  'Subcontratantes contratados',
  'Responsáveis (subcontratado)',
  'Transferências internacionais',
  'Países/organizações de destino',
  'Mecanismo de transferência',
  'Medidas técnicas e organizativas',
  'AIPD realizada',
  'Observações',
  'Avaliação de controlos preenchida',
  // Matriz de levantamento (folha "Responsavél de Tratamento" do template
  // antigo). Só o responsável a preenche; no subcontratado sai vazia.
  'Operações de tratamento',
  'Trata dados pessoais',
  'Dados necessários para a finalidade',
  'Categorias especiais necessárias',
  'Entidades que nos enviam dados',
  'Entidades para quem enviamos dados',
  'Suportes físicos',
  'Localização dos suportes físicos',
  'Ferramentas / aplicações',
  'N.º de campos com dados pessoais',
  'Volume de dados pessoais',
  'N.º de utilizadores com acesso',
  'Subcontratados (matriz)',
  'Consentimento: mecanismos de demonstração',
  'Consentimento: responsabilidade parental',
  'Retenção definida pela organização',
  'Retenção por normativos legais',
  'Normativos aplicáveis',
  'Diagrama do processo',
  'Comentários',
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
          registo.criterioPrazoConservacao ?? '',
          (registo.subcontratantesContratados ?? [])
            .map((s) => `${s.nome}${s.contacto ? ` (${s.contacto})` : ''}${s.dataContrato ? ` — ${s.dataContrato}` : ''}`)
            .join('; '),
          '',
        ]
      : [
          registo.finalidades ?? '',
          registo.responsavelConjunto ?? '',
          registo.representante ?? '',
          registo.baseLicitude ? rotuloBaseLicitude(registo.baseLicitude) : '',
          registo.recolhaDados ?? '',
          registo.categoriasTitulares
            ? rotulosCategoriasTitulares(registo.categoriasTitulares, registo.categoriasTitularesOutra)
            : '',
          registo.categoriasDados ? rotuloCategoriasDados(registo.categoriasDados) : '',
          registo.categoriasEspeciais ? rotuloSimNao(registo.categoriasEspeciais.aplicavel) : '',
          rotulosCondicaoArt9(registo.categoriasEspeciais?.condicoesArt9),
          registo.categoriasEspeciais?.identificar ?? '',
          registo.destinatarios ?? '',
          registo.prazoConservacao ?? '',
          registo.criterioPrazoConservacao ?? '',
          (registo.subcontratantesContratados ?? [])
            .map((s) => `${s.nome}${s.contacto ? ` (${s.contacto})` : ''}${s.dataContrato ? ` — ${s.dataContrato}` : ''}`)
            .join('; '),
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

  return [...comum, ...especifico, ...cauda, ...colunasMatriz(registo)]
}

/** Rótulo legível de uma resposta da matriz; vazio quando por responder. */
function rotuloMatriz(valor: string | undefined): string {
  if (!valor) return ''
  const respostas = textos.matriz.respostas as Record<string, string>
  return respostas[valor] ?? valor
}

/** As colunas da matriz de levantamento, vazias para o subcontratado. */
function colunasMatriz(registo: Registo): string[] {
  const matriz = registo.tipoRegisto === 'responsavel' ? registo.matriz : undefined
  const caracterizacao = matriz?.caracterizacao
  const ferramentas = matriz?.ferramentas
  const licitude = matriz?.licitudeRetencao

  return [
    caracterizacao?.operacoesTratamento ?? '',
    rotuloMatriz(caracterizacao?.temDadosPessoais),
    rotuloMatriz(caracterizacao?.dadosNecessariosParaFinalidade),
    rotuloMatriz(caracterizacao?.categoriasEspeciaisNecessarias),
    caracterizacao?.entidadesQueEnviamDados ?? '',
    caracterizacao?.entidadesParaQuemEnvioDados ?? '',
    caracterizacao?.suportesFisicos ?? '',
    caracterizacao?.localizacaoSuportesFisicos ?? '',
    ferramentas?.ferramentasAplicacoes ?? '',
    ferramentas?.numeroCamposComDadosPessoais ?? '',
    ferramentas?.volumeDadosPessoais ?? '',
    ferramentas?.numeroUtilizadoresComAcesso ?? '',
    (matriz?.subcontratados ?? [])
      .map((s) => {
        const detalhes = [
          s.operacoesTratamento,
          s.existeContrato ? `contrato: ${rotuloMatriz(s.existeContrato)}` : undefined,
          s.contratoComClausulasProtecaoDados
            ? `cláusulas RGPD: ${rotuloMatriz(s.contratoComClausulasProtecaoDados)}`
            : undefined,
          s.transferenciasPaisesTerceiros
            ? `países terceiros: ${rotuloMatriz(s.transferenciasPaisesTerceiros)}`
            : undefined,
          s.auditoriasAoSubcontratado
            ? `auditorias: ${rotuloMatriz(s.auditoriasAoSubcontratado)}`
            : undefined,
          s.pedidoAutorizacaoCnpd ? `CNPD: ${rotuloMatriz(s.pedidoAutorizacaoCnpd)}` : undefined,
        ].filter(Boolean)
        return `${s.nome ?? ''}${detalhes.length > 0 ? ` (${detalhes.join(', ')})` : ''}`
      })
      .join('; '),
    rotuloMatriz(licitude?.mecanismosDemonstracaoConsentimento),
    rotuloMatriz(licitude?.consentimentoResponsabilidadeParental),
    rotuloMatriz(licitude?.retencaoDefinidaPelaOrganizacao),
    rotuloMatriz(licitude?.retencaoPorNormativosLegais),
    matriz?.normativosAplicaveis ?? '',
    matriz?.diagramaProcesso ?? '',
    matriz?.comentarios ?? '',
  ]
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
