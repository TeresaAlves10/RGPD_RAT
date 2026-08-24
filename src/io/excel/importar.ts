import { migrarParaVersaoAtual } from '@/domain/migrations'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import { NOME_FOLHA_DADOS } from '@/io/excel/exportar'

export class ErroExcelSemDados extends Error {
  constructor() {
    super(
      `Este ficheiro Excel não tem a folha "${NOME_FOLHA_DADOS}" — não foi exportado por esta aplicação ` +
        'e não pode ser importado de forma nativa. Usa o importador do Excel legado se for o template antigo.',
    )
    this.name = 'ErroExcelSemDados'
  }
}

/**
 * Lê um `.xlsx` exportado por esta aplicação (com a folha oculta
 * `_dados`) e devolve o `FicheiroRat` original, sem perdas.
 */
export async function importarExcelNativo(ficheiro: ArrayBuffer): Promise<FicheiroRat> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(ficheiro)

  const folhaDados = workbook.getWorksheet(NOME_FOLHA_DADOS)
  if (!folhaDados) {
    throw new ErroExcelSemDados()
  }

  const fragmentos: string[] = []
  folhaDados.eachRow((linha) => {
    const valor = linha.getCell(1).value
    if (typeof valor === 'string') fragmentos.push(valor)
  })

  const dados: unknown = JSON.parse(fragmentos.join(''))
  return migrarParaVersaoAtual(dados)
}
