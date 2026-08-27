import { describe, expect, it } from 'vitest'
import { gerarExcel, NOME_FOLHA_LISTAS, NOME_FOLHA_REGISTOS } from '@/io/excel/exportar'
import { ErroExcelSemDados, importarExcelNativo } from '@/io/excel/importar'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoSubcontratadoCompleto,
} from '@/domain/fixtures/registos'

async function blobParaArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer()
}

describe('Excel — round-trip', () => {
  it('faz round-trip sem perdas: ficheiro -> Excel -> ficheiro', async () => {
    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const buffer = await blobParaArrayBuffer(blob)
    const resultado = await importarExcelNativo(buffer)
    expect(resultado).toEqual(ficheiroRatFixtureValido)
  })

  it('gera as três folhas esperadas, com _dados oculta', async () => {
    const ExcelJS = await import('exceljs')
    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(await blobParaArrayBuffer(blob))

    const nomes = workbook.worksheets.map((f) => f.name)
    expect(nomes).toEqual([NOME_FOLHA_REGISTOS, NOME_FOLHA_LISTAS, '_dados'])

    const folhaDados = workbook.getWorksheet('_dados')
    expect(folhaDados?.state).toBe('veryHidden')
  })

  it('a folha Registos tem uma linha por registo, além do cabeçalho', async () => {
    const ExcelJS = await import('exceljs')
    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(await blobParaArrayBuffer(blob))

    const folha = workbook.getWorksheet(NOME_FOLHA_REGISTOS)
    expect(folha?.rowCount).toBe(ficheiroRatFixtureValido.registos.length + 1)
  })

  it('rejeita um .xlsx sem a folha _dados', async () => {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    workbook.addWorksheet('Outra folha')
    const buffer = await workbook.xlsx.writeBuffer()
    await expect(importarExcelNativo(buffer as ArrayBuffer)).rejects.toThrow(ErroExcelSemDados)
  })

  it('a folha legível traz a matriz do responsável e os campos do subcontratante', async () => {
    const ExcelJS = await import('exceljs')
    const blob = await gerarExcel(ficheiroRatFixtureValido)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(await blobParaArrayBuffer(blob))

    const folha = workbook.getWorksheet(NOME_FOLHA_REGISTOS)
    const textoDaFolha = (nomeTratamento: string): string => {
      let linha: string[] = []
      folha?.eachRow((row) => {
        const valores = (row.values as unknown[]).map((v) => String(v ?? ''))
        if (valores.includes(nomeTratamento)) linha = valores
      })
      return linha.join(' | ')
    }

    const responsavel = textoDaFolha(registoResponsavelCompleto.nomeTratamento)
    expect(responsavel).toContain(
      registoResponsavelCompleto.matriz?.caracterizacao?.operacoesTratamento,
    )
    expect(responsavel).toContain(registoResponsavelCompleto.criterioPrazoConservacao)

    const subcontratado = textoDaFolha(registoSubcontratadoCompleto.nomeTratamento)
    expect(subcontratado).toContain(registoSubcontratadoCompleto.finalidades)
    expect(subcontratado).toContain(registoSubcontratadoCompleto.prazoConservacao)
    // A matriz é do responsável: no subcontratado as colunas ficam vazias.
    expect(subcontratado).not.toContain(
      registoResponsavelCompleto.matriz?.caracterizacao?.operacoesTratamento,
    )
  })
})
