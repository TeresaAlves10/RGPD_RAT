import { describe, expect, it } from 'vitest'
import {
  ErroTemplateLegadoNaoReconhecido,
  importarExcelLegado,
} from '@/io/excel/importador-legado'

/**
 * Gera, só para teste, um .xlsx com a mesma estrutura da folha "limpa" de
 * RAT do template legado (Livro6.xlsx): cabeçalho na linha 11, colunas B a
 * X. Não usa o ficheiro real (que tem o nome de uma organização real) —
 * ver CLAUDE.md §2.7, sem dados/nomes reais no repositório.
 */
async function criarWorkbookLegadoFicticio(linhas: (string | number)[][]): Promise<ArrayBuffer> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const folha = workbook.addWorksheet('Folha1')

  folha.getCell('B6').value = 'Organização Fictícia Data Protection'
  folha.getCell('B7').value = 'Levantamento de informação'
  folha.getCell('B8').value = 'Subcontratante'

  const cabecalhos = [
    'ID',
    'Responsável pelo Tratamento/Subcontratante (em que qualidade atua a organização?)',
    'Direção/Área/Serviço- Identificar',
    'Unidade de Coordenação',
    'Nome Tratamento / Processo',
    'Decrição',
    'Finalidade do Tratamento de dados pessoais (uma por linha, especificada)',
    'Identificação do Responsável conjunto pelo tratamento (identificar ou N/A)',
    'Identificação do Representante do Responsável tratamento (identificar ou N/A)',
    'Base legal do Tratamento (artigo 6º RGPD)',
    'Recolha dos dados (como é efetuada)',
    'Categorias Titulares dos Dados (por ex. colaboradores, fornecedores)',
    'Categorias de Dados Pessoais',
    'Tipos de Dados Pessoais',
    'Categorias especiais de dados pessoais (S/N) Se sim identificar',
    'Destinatários ou Categorias de Destinatários',
    'Transferências para países terceiros -art. 44º RGPD- (S/N)',
    'Prazo de Conservação dos dados pessoais',
    'Medidas Técnicas e Organizativas implementadas',
    'Subcontratante -(artigo 28º do RGPD)',
    'Observações / Diagrama / Ecosistema',
    'Foi realizada AIPD para SI / BD?',
    'GP',
  ]
  folha.getRow(11).values = [undefined, ...cabecalhos]

  linhas.forEach((linha, indice) => {
    folha.getRow(12 + indice).values = [undefined, ...linha]
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as ArrayBuffer
}

describe('importador do Excel legado', () => {
  it('mapeia uma linha de responsável e sinaliza os campos de vocabulário por preencher', async () => {
    const buffer = await criarWorkbookLegadoFicticio([
      [
        '1',
        'Responsável',
        'Direção Fictícia',
        'Unidade Fictícia',
        'Tratamento Fictício',
        'Descrição fictícia.',
        'Finalidade fictícia.',
        'N/A',
        'N/A',
        'Consentimento do titular',
        'Formulário fictício.',
        'Colaboradores',
        'Dados de identificação civil',
        'Nome, email',
        'Não',
        'Destinatários fictícios.',
        'Não',
        '5 anos.',
        'Cibersegurança, encriptação',
        'Não',
        'Observação fictícia.',
        'Não',
        'Gestor Fictício',
      ],
    ])

    const resultado = await importarExcelLegado(buffer)
    expect(resultado.registos).toHaveLength(1)
    expect(resultado.relatorio).toHaveLength(1)

    const registo = resultado.registos[0]
    expect(registo.tipoRegisto).toBe('responsavel')
    expect(registo.direcao).toBe('Direção Fictícia')
    expect(registo.nomeTratamento).toBe('Tratamento Fictício')

    const linhaRelatorio = resultado.relatorio[0]
    expect(linhaRelatorio.camposMapeados).toContain('direcao')
    expect(linhaRelatorio.camposMapeados).toContain('nomeTratamento')
    expect(linhaRelatorio.camposPorPreencher).toContain('baseLicitude')
    expect(linhaRelatorio.camposPorPreencher).toContain('categoriasTitulares')
    expect(linhaRelatorio.camposPorPreencher).toContain('medidasTecnicasOrganizativas')
  })

  it('reconhece uma linha de subcontratado pela coluna de qualidade', async () => {
    const buffer = await criarWorkbookLegadoFicticio([
      [
        '2',
        'Subcontratante',
        'Direção Fictícia',
        '',
        'Serviço Subcontratado Fictício',
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
        '',
        '',
        '',
        '',
        'Gestor Fictício',
      ],
    ])

    const resultado = await importarExcelLegado(buffer)
    expect(resultado.registos[0].tipoRegisto).toBe('subcontratado')
    expect(resultado.relatorio[0].camposPorPreencher).toContain('responsaveis')
  })

  it('para na primeira linha em branco (nome do tratamento vazio)', async () => {
    const buffer = await criarWorkbookLegadoFicticio([
      ['1', 'Responsável', 'Direção A', '', 'Tratamento A', ...Array(18).fill('')],
      ['2', 'Responsável', '', '', '', ...Array(18).fill('')],
      ['3', 'Responsável', 'Direção C', '', 'Tratamento C', ...Array(18).fill('')],
    ])

    const resultado = await importarExcelLegado(buffer)
    expect(resultado.registos).toHaveLength(1)
    expect(resultado.registos[0].nomeTratamento).toBe('Tratamento A')
  })

  it('preserva o texto original dos campos por preencher nas observações, para não perder informação', async () => {
    const buffer = await criarWorkbookLegadoFicticio([
      [
        '1',
        'Responsável',
        'Direção Fictícia',
        '',
        'Tratamento Fictício',
        '',
        'Finalidade fictícia.',
        '',
        '',
        'Consentimento do titular (texto original da base legal)',
        'Formulário fictício.',
        '',
        '',
        '',
        'Não',
        '',
        'Não',
        '5 anos.',
        '',
        'Não',
        '',
        'Não',
        'Gestor Fictício',
      ],
    ])

    const resultado = await importarExcelLegado(buffer)
    expect(resultado.registos[0].observacoes).toContain('texto original da base legal')
  })

  it('rejeita um .xlsx que não tem a estrutura do template legado', async () => {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    workbook.addWorksheet('Outra folha')
    const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer
    await expect(importarExcelLegado(buffer)).rejects.toThrow(ErroTemplateLegadoNaoReconhecido)
  })
})
