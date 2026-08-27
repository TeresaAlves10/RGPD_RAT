import { describe, expect, it } from 'vitest'
import {
  gerarExcel,
  NOME_FOLHA_DADOS,
  NOME_FOLHA_LISTAS,
  NOME_FOLHA_RESPONSAVEL,
  NOME_FOLHA_SUBCONTRATANTE,
} from '@/io/excel/exportar'
import { ErroExcelSemDados, importarExcelNativo } from '@/io/excel/importar'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoSubcontratadoCompleto,
} from '@/domain/fixtures/registos'

async function abrir(blob: Blob) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await blob.arrayBuffer())
  return workbook
}

/** Todo o texto de uma folha, para verificar se um valor lá aparece. */
function textoDaFolha(folha: import('exceljs').Worksheet | undefined): string {
  const partes: string[] = []
  folha?.eachRow((linha) => {
    partes.push((linha.values as unknown[]).map((v) => String(v ?? '')).join(' | '))
  })
  return partes.join('\n')
}

describe('Excel — round-trip', () => {
  it('faz round-trip sem perdas: ficheiro -> Excel -> ficheiro', async () => {
    const resultado = await importarExcelNativo(await (await gerarExcel(ficheiroRatFixtureValido)).arrayBuffer())
    expect(resultado).toEqual(ficheiroRatFixtureValido)
  })

  it('rejeita um .xlsx sem a folha _dados', async () => {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    workbook.addWorksheet('Outra folha')
    const buffer = await workbook.xlsx.writeBuffer()
    await expect(importarExcelNativo(buffer as ArrayBuffer)).rejects.toThrow(ErroExcelSemDados)
  })
})

describe('Excel — folhas legíveis', () => {
  it('gera uma folha por qualidade, mais Listas e _dados oculta', async () => {
    const workbook = await abrir(await gerarExcel(ficheiroRatFixtureValido))
    expect(workbook.worksheets.map((f) => f.name)).toEqual([
      NOME_FOLHA_RESPONSAVEL,
      NOME_FOLHA_SUBCONTRATANTE,
      NOME_FOLHA_LISTAS,
      NOME_FOLHA_DADOS,
    ])
    expect(workbook.getWorksheet(NOME_FOLHA_DADOS)?.state).toBe('veryHidden')
  })

  it('cada folha tem uma linha por registo da sua qualidade, além do cabeçalho', async () => {
    const workbook = await abrir(await gerarExcel(ficheiroRatFixtureValido))
    const responsaveis = ficheiroRatFixtureValido.registos.filter(
      (r) => r.tipoRegisto === 'responsavel',
    ).length
    const subcontratados = ficheiroRatFixtureValido.registos.filter(
      (r) => r.tipoRegisto === 'subcontratado',
    ).length
    expect(workbook.getWorksheet(NOME_FOLHA_RESPONSAVEL)?.rowCount).toBe(responsaveis + 1)
    expect(workbook.getWorksheet(NOME_FOLHA_SUBCONTRATANTE)?.rowCount).toBe(subcontratados + 1)
  })

  it('a folha do responsável traz os campos das sete secções', async () => {
    const workbook = await abrir(await gerarExcel(ficheiroRatFixtureValido))
    const texto = textoDaFolha(workbook.getWorksheet(NOME_FOLHA_RESPONSAVEL))

    expect(texto).toContain(registoResponsavelCompleto.finalidade)
    expect(texto).toContain(registoResponsavelCompleto.operacoesTratamento)
    expect(texto).toContain(registoResponsavelCompleto.ferramentasAplicacoes)
    expect(texto).toContain(registoResponsavelCompleto.subcontratados?.[0].nome)
    expect(texto).toContain(registoResponsavelCompleto.normativosAplicaveis)
    // Respostas fechadas saem legíveis, não como ids.
    expect(texto).toContain('Parcialmente')
  })

  it('a folha do subcontratante traz a lista de campos da sua qualidade', async () => {
    const workbook = await abrir(await gerarExcel(ficheiroRatFixtureValido))
    const texto = textoDaFolha(workbook.getWorksheet(NOME_FOLHA_SUBCONTRATANTE))

    expect(texto).toContain(registoSubcontratadoCompleto.nomeResponsavelTratamento)
    expect(texto).toContain(registoSubcontratadoCompleto.prazoConservacao)
    expect(texto).toContain(registoSubcontratadoCompleto.transferencias?.identificar)
    expect(texto).toContain(registoSubcontratadoCompleto.outrosSubcontratantes?.[0].nome)
  })

  it('não mistura as qualidades entre folhas', async () => {
    const workbook = await abrir(await gerarExcel(ficheiroRatFixtureValido))
    const responsavel = textoDaFolha(workbook.getWorksheet(NOME_FOLHA_RESPONSAVEL))
    const subcontratante = textoDaFolha(workbook.getWorksheet(NOME_FOLHA_SUBCONTRATANTE))

    expect(responsavel).not.toContain(registoSubcontratadoCompleto.nomeTratamento)
    expect(subcontratante).not.toContain(registoResponsavelCompleto.nomeTratamento)
  })
})
