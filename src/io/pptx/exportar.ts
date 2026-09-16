import type PptxGenJS from 'pptxgenjs'
import type { Registo } from '@/domain/schema/registo'
import { descarregarFicheiro } from '@/io/descarregar'
import { rotuloUnidade } from '@/config/organizacao'
import { textos } from '@/i18n/pt'

const AZUL_CABECALHO = '1E3A5F'
const CINZENTO_CLARO = 'F3F4F6'
const BRANCO = 'FFFFFF'

export interface TotaisRat {
  total: number
  responsavel: number
  subcontratante: number
  emValidacao: number
  validados: number
  comAipd: number
}

/**
 * As seis contagens do painel de totais (src/components/painel-totais.tsx),
 * reaproveitadas aqui para o resumo em PowerPoint — mesma definição de
 * "em validação" (submetido ou devolvido) e "com AIPD".
 */
export function calcularTotaisRat(registos: Registo[]): TotaisRat {
  return {
    total: registos.length,
    responsavel: registos.filter((r) => r.tipoRegisto === 'responsavel').length,
    subcontratante: registos.filter((r) => r.tipoRegisto === 'subcontratado').length,
    emValidacao: registos.filter((r) => r.estado === 'submetido' || r.estado === 'devolvido').length,
    validados: registos.filter((r) => r.estado === 'validado').length,
    comAipd: registos.filter((r) => r.aipdRealizada === 'sim').length,
  }
}

export interface GrupoTotais {
  chave: string
  totais: TotaisRat
}

/** Agrupa os registos por uma chave (Direção, Unidade) e soma os totais de cada grupo, por ordem alfabética da chave. */
function agruparTotais(registos: Registo[], chave: (registo: Registo) => string): GrupoTotais[] {
  const porChave = new Map<string, Registo[]>()
  for (const registo of registos) {
    const k = chave(registo)
    const lista = porChave.get(k) ?? []
    lista.push(registo)
    porChave.set(k, lista)
  }
  return [...porChave.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt'))
    .map(([chave, lista]) => ({ chave, totais: calcularTotaisRat(lista) }))
}

export function agruparPorDirecao(registos: Registo[]): GrupoTotais[] {
  return agruparTotais(registos, (r) => r.direcao || '—')
}

export function agruparPorUnidade(registos: Registo[]): GrupoTotais[] {
  return agruparTotais(registos, (r) => rotuloUnidade(r.unidadeCoordenacao) || textos.relatorioResumo.semUnidade)
}

const COLUNAS_TOTAIS: { chave: keyof TotaisRat; rotulo: string }[] = [
  { chave: 'total', rotulo: textos.totais.total },
  { chave: 'responsavel', rotulo: textos.totais.responsavel },
  { chave: 'subcontratante', rotulo: textos.totais.subcontratante },
  { chave: 'emValidacao', rotulo: textos.totais.emValidacao },
  { chave: 'validados', rotulo: textos.totais.validados },
  { chave: 'comAipd', rotulo: textos.totais.comAipd },
]

function celaCabecalho(texto: string): PptxGenJS.TableCell {
  return {
    text: texto,
    options: { bold: true, color: BRANCO, fill: { color: AZUL_CABECALHO }, fontSize: 11 },
  }
}

function celaValor(texto: string, linhaPar: boolean): PptxGenJS.TableCell {
  return {
    text: texto,
    options: { fill: { color: linhaPar ? BRANCO : CINZENTO_CLARO }, fontSize: 10 },
  }
}

/** Slide de título com os seis totais gerais, em duas colunas (rótulo | valor). */
function slideTotaisGerais(pptx: PptxGenJS, totais: TotaisRat) {
  const slide = pptx.addSlide()
  slide.addText(textos.relatorioResumo.tituloApresentacao, {
    x: 0.4,
    y: 0.3,
    w: 9.2,
    fontSize: 24,
    bold: true,
    color: AZUL_CABECALHO,
  })
  slide.addText(textos.relatorioResumo.geradoEm(new Date().toLocaleDateString('pt-PT')), {
    x: 0.4,
    y: 0.9,
    w: 9.2,
    fontSize: 11,
    color: '6B7280',
  })

  const linhas: PptxGenJS.TableRow[] = COLUNAS_TOTAIS.map(({ chave, rotulo }, indice) => [
    { text: rotulo, options: { bold: true, fontSize: 14, fill: { color: indice % 2 === 0 ? BRANCO : CINZENTO_CLARO } } },
    {
      text: String(totais[chave]),
      options: {
        fontSize: 14,
        align: 'right',
        color: AZUL_CABECALHO,
        bold: true,
        fill: { color: indice % 2 === 0 ? BRANCO : CINZENTO_CLARO },
      },
    },
  ])

  slide.addTable(linhas, { x: 0.4, y: 1.6, w: 6, colW: [4.2, 1.8], border: { type: 'solid', color: 'D1D5DB', pt: 0.5 } })
}

/** Slide de tabela com uma linha por grupo (Direção ou Unidade) e uma coluna por total. */
function slideGrupos(pptx: PptxGenJS, titulo: string, colunaChave: string, grupos: GrupoTotais[]) {
  const slide = pptx.addSlide()
  slide.addText(titulo, { x: 0.4, y: 0.3, w: 9.2, fontSize: 20, bold: true, color: AZUL_CABECALHO })

  const cabecalho: PptxGenJS.TableRow = [
    celaCabecalho(colunaChave),
    ...COLUNAS_TOTAIS.map(({ rotulo }) => celaCabecalho(rotulo)),
  ]
  const linhas: PptxGenJS.TableRow[] = grupos.map((grupo, indice) => [
    { text: grupo.chave, options: { fill: { color: indice % 2 === 0 ? BRANCO : CINZENTO_CLARO }, fontSize: 10, bold: true } },
    ...COLUNAS_TOTAIS.map(({ chave }) => celaValor(String(grupo.totais[chave]), indice % 2 === 0)),
  ])

  slide.addTable([cabecalho, ...linhas], {
    x: 0.3,
    y: 1.1,
    w: 9.4,
    colW: [2.2, 1.44, 1.44, 1.44, 1.44, 1.44, 1.44],
    border: { type: 'solid', color: 'D1D5DB', pt: 0.5 },
    autoPage: true,
  })
}

export async function gerarApresentacao(registos: Registo[]): Promise<PptxGenJS> {
  const { default: PptxGenJSCtor } = await import('pptxgenjs')
  const pptx = new PptxGenJSCtor()
  pptx.defineLayout({ name: 'RAT_16x9', width: 10, height: 5.63 })
  pptx.layout = 'RAT_16x9'

  slideTotaisGerais(pptx, calcularTotaisRat(registos))
  slideGrupos(
    pptx,
    textos.relatorioResumo.tituloPorDirecao,
    textos.relatorioResumo.colunaDirecao,
    agruparPorDirecao(registos),
  )
  slideGrupos(
    pptx,
    textos.relatorioResumo.tituloPorUnidade,
    textos.relatorioResumo.colunaUnidade,
    agruparPorUnidade(registos),
  )

  return pptx
}

export async function gerarPptxBlob(registos: Registo[]): Promise<Blob> {
  const pptx = await gerarApresentacao(registos)
  const saida = await pptx.write({ outputType: 'blob' })
  return saida as Blob
}

export function nomeFicheiroPptx(): string {
  const data = new Date().toISOString().slice(0, 10)
  return `rat-resumo-${data}.pptx`
}

export async function exportarPptx(registos: Registo[]): Promise<void> {
  const blob = await gerarPptxBlob(registos)
  descarregarFicheiro(nomeFicheiroPptx(), blob)
}
