import { textos } from '@/i18n/pt'
import type { Registo } from '@/domain/schema/registo'

/**
 * Importador do template Excel legado (`Livro6.xlsx` e equivalentes): a
 * folha de RAT "limpa" desse template (cabeçalho com "Base legal do
 * Tratamento", 23 colunas, B a X) — distinta da folha larga de avaliação
 * de controlos/maturidade do mesmo ficheiro, que está fora de âmbito do
 * módulo RAT (CLAUDE.md §3) e não é importada.
 *
 * Os campos de vocabulário controlado (base de licitude, categorias de
 * titulares/dados, condição do art. 9.º, mecanismo de transferência,
 * medidas técnicas/organizativas) nunca são adivinhados a partir do texto
 * livre do template antigo — ficam "por preencher", com o texto original
 * preservado nas observações, para revisão manual (CLAUDE.md: nenhuma
 * regra de validação nem mapeamento deve inventar dados sensíveis do
 * ponto de vista legal).
 */

export interface LinhaRelatorioImportacaoLegado {
  linhaOrigem: number
  nomeTratamento: string
  tipoRegisto: 'responsavel' | 'subcontratado'
  camposMapeados: string[]
  camposPorPreencher: string[]
}

export interface ResultadoImportacaoLegado {
  registos: Registo[]
  relatorio: LinhaRelatorioImportacaoLegado[]
}

export class ErroTemplateLegadoNaoReconhecido extends Error {
  constructor() {
    super(
      'Não foi possível encontrar a folha do RAT no template legado (procurada pelo cabeçalho ' +
        '"Base legal do Tratamento"). Confirma que é o template antigo (Livro6.xlsx) ou uma cópia dele.',
    )
    this.name = 'ErroTemplateLegadoNaoReconhecido'
  }
}

function valorCelula(linha: import('exceljs').Row, coluna: string): string {
  const valor = linha.getCell(coluna).value
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'object' && 'richText' in valor) {
    return (valor.richText as { text: string }[]).map((t) => t.text).join('')
  }
  return String(valor).trim()
}

function comecaPorSim(texto: string): boolean {
  return /^s(im)?\b/i.test(texto.trim())
}

function encontrarLinhaCabecalho(folha: import('exceljs').Worksheet): number | null {
  let linhaEncontrada: number | null = null
  folha.eachRow((linha, indice) => {
    if (linhaEncontrada !== null) return
    const valor = valorCelula(linha, 'K')
    if (/base legal do tratamento/i.test(valor)) {
      linhaEncontrada = indice
    }
  })
  return linhaEncontrada
}

export async function importarExcelLegado(ficheiro: ArrayBuffer): Promise<ResultadoImportacaoLegado> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(ficheiro)

  const folha = workbook.worksheets.find((f) => encontrarLinhaCabecalho(f) !== null)
  if (!folha) {
    throw new ErroTemplateLegadoNaoReconhecido()
  }
  const linhaCabecalho = encontrarLinhaCabecalho(folha)
  if (linhaCabecalho === null) {
    throw new ErroTemplateLegadoNaoReconhecido()
  }

  const registos: Registo[] = []
  const relatorio: LinhaRelatorioImportacaoLegado[] = []

  for (let numeroLinha = linhaCabecalho + 1; numeroLinha <= folha.rowCount; numeroLinha += 1) {
    const linha = folha.getRow(numeroLinha)
    const nomeTratamento = valorCelula(linha, 'F')
    if (!nomeTratamento) break // linha em branco: fim dos dados

    const qualidade = valorCelula(linha, 'C')
    const tipoRegisto: 'responsavel' | 'subcontratado' = /subcontrat/i.test(qualidade)
      ? 'subcontratado'
      : 'responsavel'

    const camposMapeados: string[] = []
    const camposPorPreencher: string[] = []
    const notasImportacao: string[] = []

    function mapeado(campo: string) {
      camposMapeados.push(campo)
    }
    function porPreencher(campo: string, valorOriginal?: string) {
      camposPorPreencher.push(campo)
      if (valorOriginal) {
        notasImportacao.push(`${textos.campos[campo as keyof typeof textos.campos] ?? campo}: ${valorOriginal}`)
      }
    }

    const direcao = valorCelula(linha, 'D')
    mapeado('direcao')
    const unidadeCoordenacao = valorCelula(linha, 'E')
    if (unidadeCoordenacao) mapeado('unidadeCoordenacao')
    mapeado('nomeTratamento')
    const descricao = valorCelula(linha, 'G')
    if (descricao) mapeado('descricao')

    const nomeGp = valorCelula(linha, 'X')
    if (nomeGp) mapeado('gestorProjeto.nome')
    porPreencher('gestorProjeto.contacto')

    const aipdTexto = valorCelula(linha, 'W')
    const aipdRealizada = comecaPorSim(aipdTexto)
      ? 'sim'
      : /^n(ão|ao)?\b/i.test(aipdTexto)
        ? 'nao'
        : 'nao_aplicavel'
    mapeado('aipdRealizada')

    porPreencher('medidasTecnicasOrganizativas', valorCelula(linha, 'T'))

    const observacoesBase = valorCelula(linha, 'V')
    if (observacoesBase) mapeado('observacoes')

    const camposComuns = {
      id: crypto.randomUUID(),
      estado: 'rascunho',
      direcao,
      unidadeCoordenacao: unidadeCoordenacao || undefined,
      nomeTratamento,
      descricao: descricao || undefined,
      gestorProjeto: { nome: nomeGp || 'Por preencher' },
      medidasTecnicasOrganizativas: [] as { medida: string }[],
      aipdRealizada,
      anotacoes: [],
    }

    // Campos que o template antigo tem e que existem nas duas qualidades.
    const finalidade = valorCelula(linha, 'H')
    if (finalidade) mapeado('finalidade')
    const responsavelConjunto = valorCelula(linha, 'I')
    if (responsavelConjunto) mapeado('responsavelConjunto')
    porPreencher('baseLicitude', valorCelula(linha, 'K'))
    const recolhaDados = valorCelula(linha, 'L')
    porPreencher('categoriasTitulares', valorCelula(linha, 'M'))
    porPreencher(
      'categoriasDados',
      [valorCelula(linha, 'N'), valorCelula(linha, 'O')].filter(Boolean).join(' / '),
    )

    const especiaisTexto = valorCelula(linha, 'P')
    const especiaisAplicavel = comecaPorSim(especiaisTexto)
    mapeado('categoriasEspeciais.aplicavel')
    if (especiaisAplicavel) mapeado('categoriasEspeciais.identificar')

    const destinatarios = valorCelula(linha, 'Q')
    if (destinatarios) mapeado('destinatarios')

    const transferenciasTexto = valorCelula(linha, 'R')
    const transferenciasExistem = comecaPorSim(transferenciasTexto)

    const prazoConservacao = valorCelula(linha, 'S')

    const subcontratanteTexto = valorCelula(linha, 'U')
    const outrosSubcontratantes = comecaPorSim(subcontratanteTexto)
      ? [{ nome: subcontratanteTexto }]
      : []

    const categoriasEspeciais = {
      aplicavel: especiaisAplicavel ? 'sim' : 'nao',
      identificar: especiaisAplicavel ? especiaisTexto : undefined,
    }

    let registo: Record<string, unknown>

    if (tipoRegisto === 'responsavel') {
      // O responsável em v5 não tem "destinatários" nem "prazo de
      // conservação" como campos próprios: o equivalente é
      // "entidades a quem envio dados" e as duas perguntas de retenção.
      if (recolhaDados) porPreencher('recolhaDados', recolhaDados)
      if (prazoConservacao) porPreencher('retencaoDefinidaPelaOrganizacao', prazoConservacao)
      if (transferenciasExistem) porPreencher('subcontratados', transferenciasTexto)

      registo = {
        ...camposComuns,
        tipoRegisto: 'responsavel',
        finalidade: finalidade || undefined,
        categoriasTitulares: [],
        categoriasDados: [],
        categoriasEspeciais,
        entidadesParaQuemEnvioDados: destinatarios || undefined,
        subcontratados: outrosSubcontratantes,
      }
    } else {
      if (recolhaDados) mapeado('recolhaDados')
      if (prazoConservacao) mapeado('prazoConservacao')
      mapeado('transferencias.existem')
      if (outrosSubcontratantes.length > 0) mapeado('outrosSubcontratantes')
      porPreencher('nomeResponsavelTratamento', valorCelula(linha, 'B'))

      registo = {
        ...camposComuns,
        tipoRegisto: 'subcontratado',
        nomeResponsavelTratamento: valorCelula(linha, 'B') || undefined,
        finalidade: finalidade || undefined,
        responsavelConjunto: responsavelConjunto || undefined,
        recolhaDados: recolhaDados || undefined,
        categoriasTitulares: [],
        categoriasDados: [],
        categoriasEspeciais,
        destinatarios: destinatarios || undefined,
        transferencias: {
          existem: transferenciasExistem ? 'sim' : 'nao',
          identificar: transferenciasExistem ? transferenciasTexto : undefined,
        },
        prazoConservacao: prazoConservacao || undefined,
        outrosSubcontratantes,
      }
    }

    // "observacoes" só fica completo depois de todos os campos (comuns e
    // específicos do tipo) terem sido processados, para incluir as notas
    // de todos os campos "por preencher" sem perder informação.
    registo.observacoes = [observacoesBase, ...notasImportacao].filter(Boolean).join('\n') || undefined

    // Os campos "por preencher" (vocabulários controlados) ficam com
    // valores vazios/inválidos de propósito — este registo só passa a ser
    // válido depois de revisto e completado no formulário. O relatório de
    // importação (abaixo) sinaliza exatamente que campos precisam de
    // atenção, e o texto original de cada um fica preservado em
    // "observacoes" para não se perder informação.
    registos.push(registo as unknown as Registo)

    relatorio.push({
      linhaOrigem: numeroLinha,
      nomeTratamento,
      tipoRegisto,
      camposMapeados,
      camposPorPreencher,
    })
  }

  return { registos, relatorio }
}
