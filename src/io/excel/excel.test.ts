import { describe, expect, it } from 'vitest'
import { gerarExcel, NOME_FOLHA_LISTAS, NOME_FOLHA_REGISTOS } from '@/io/excel/exportar'
import { ErroExcelSemDados, importarExcelNativo } from '@/io/excel/importar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'

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
})
