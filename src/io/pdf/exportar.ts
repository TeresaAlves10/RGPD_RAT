import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { Registo } from '@/domain/schema/registo'
import type { AvaliacaoControlos } from '@/domain/schema/avaliacao'
import { avaliarFicheiro } from '@/domain/rules/motor'
import type { Ocorrencia } from '@/domain/rules/types'
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

const FUNDAMENTACAO_RODAPE =
  'Regulamento (UE) 2016/679 (RGPD) — Registo de Atividades de Tratamento nos termos do art. 30.º'

function campo(label: string, valor: string | undefined): Content[] {
  if (!valor) return []
  return [{ text: [{ text: `${label}: `, bold: true }, valor], margin: [0, 0, 0, 4] }]
}

/** Respostas preenchidas do módulo de avaliação, agrupadas por secção. */
function linhasAvaliacao(avaliacao: AvaliacaoControlos): Content[] {
  const rotulos = textos.avaliacao.campos as Record<string, string>
  const respostas = textos.avaliacao.respostas as Record<string, string>

  const grupos: [string, Record<string, unknown> | undefined][] = [
    [textos.avaliacao.seccoes.requisitosFuncionais, avaliacao.requisitosFuncionais],
    [textos.avaliacao.seccoes.controlosOperacionais, avaliacao.controlosOperacionais],
    [textos.avaliacao.seccoes.ferramentasSistemas, avaliacao.ferramentasSistemas],
    [textos.avaliacao.seccoes.governoSubcontratacao, avaliacao.governoSubcontratacao],
    [textos.avaliacao.seccoes.governoConsentimento, avaliacao.governoConsentimento],
  ]

  const conteudo: Content[] = []

  for (const [titulo, grupo] of grupos) {
    if (!grupo) continue
    const itens = Object.entries(grupo)
      .filter(([, valor]) => typeof valor === 'string' && valor !== '')
      .map(([chave, valor]) => {
        const rotulo = rotulos[chave] ?? chave
        const texto = respostas[valor as string] ?? String(valor)
        return `${rotulo}: ${texto}`
      })
    if (itens.length === 0) continue
    conteudo.push({ text: titulo, bold: true, margin: [0, 6, 0, 2] })
    conteudo.push({ ul: itens })
  }

  conteudo.push(...campo(textos.avaliacao.campos.normativosAplicaveis, avaliacao.normativosAplicaveis))
  conteudo.push(...campo(textos.avaliacao.campos.diagramaProcesso, avaliacao.diagramaProcesso))

  return conteudo
}

function seccaoRegisto(registo: Registo, ocorrencias: Ocorrencia[]): Content {
  const identificacao: Content[] = [
    { text: registo.nomeTratamento, style: 'tituloRegisto' },
    {
      text: registo.tipoRegisto === 'responsavel' ? textos.lista.tipoResponsavel : textos.lista.tipoSubcontratado,
      style: 'subtituloRegisto',
    },
    ...campo(textos.estado.etiqueta, textos.estado[registo.estado]),
    ...campo(textos.campos.direcao, registo.direcao),
    ...campo(textos.campos.unidadeCoordenacao, registo.unidadeCoordenacao),
    ...campo(textos.campos.descricao, registo.descricao),
    ...campo(textos.campos['gestorProjeto.nome'], registo.gestorProjeto.nome),
    ...campo(textos.campos['gestorProjeto.contacto'], registo.gestorProjeto.contacto),
  ]

  const especifico: Content[] =
    registo.tipoRegisto === 'responsavel'
      ? [
          ...campo(textos.campos.finalidades, registo.finalidades),
          ...campo(textos.campos.responsavelConjunto, registo.responsavelConjunto),
          ...campo(textos.campos.representante, registo.representante),
          ...campo(textos.campos.baseLicitude, rotuloBaseLicitude(registo.baseLicitude)),
          ...campo(textos.campos.recolhaDados, registo.recolhaDados),
          ...campo(
            textos.campos.categoriasTitulares,
            rotulosCategoriasTitulares(registo.categoriasTitulares, registo.categoriasTitularesOutra),
          ),
          ...campo(textos.campos.categoriasDados, rotuloCategoriasDados(registo.categoriasDados)),
          ...campo(
            textos.campos['categoriasEspeciais.aplicavel'],
            rotuloSimNao(registo.categoriasEspeciais.aplicavel),
          ),
          ...(registo.categoriasEspeciais.aplicavel
            ? [
                ...campo(
                  textos.campos['categoriasEspeciais.condicoesArt9'],
                  rotulosCondicaoArt9(registo.categoriasEspeciais.condicoesArt9),
                ),
                ...campo(
                  textos.campos['categoriasEspeciais.identificar'],
                  registo.categoriasEspeciais.identificar,
                ),
              ]
            : []),
          ...campo(textos.campos.destinatarios, registo.destinatarios),
          ...campo(textos.campos.prazoConservacao, registo.prazoConservacao),
          ...campo(
            textos.campos.subcontratantesContratados,
            (registo.subcontratantesContratados ?? []).map((s) => s.nome).join('; '),
          ),
        ]
      : [
          ...campo(
            textos.campos.responsaveis,
            registo.responsaveis
              .map((r) => `${r.nome}${r.contacto ? ` (${r.contacto})` : ''}: ${r.categoriasTratamento}`)
              .join('; '),
          ),
        ]

  const cauda: Content[] = [
    ...campo(
      textos.campos['transferenciasInternacionais.existem'],
      rotuloSimNao(registo.transferenciasInternacionais.existem),
    ),
    ...(registo.transferenciasInternacionais.existem
      ? [
          ...campo(
            textos.campos['transferenciasInternacionais.paisesOuOrganizacoes'],
            (registo.transferenciasInternacionais.paisesOuOrganizacoes ?? []).join('; '),
          ),
          ...campo(
            textos.campos['transferenciasInternacionais.mecanismo'],
            rotuloMecanismoTransferencia(registo.transferenciasInternacionais),
          ),
        ]
      : []),
    ...campo(textos.campos.medidasTecnicasOrganizativas, rotuloMedidas(registo.medidasTecnicasOrganizativas)),
    ...campo(textos.campos.aipdRealizada, rotuloAipd(registo.aipdRealizada)),
    ...campo(textos.campos.observacoes, registo.observacoes),
  ]

  // Módulo de avaliação de controlos — opcional e à parte do RAT
  // (CLAUDE.md §3). Só entra no PDF quando a equipa o ativou, e sempre
  // numa secção própria, nunca misturado com o registo do art. 30.º.
  const avaliacao: Content[] = registo.avaliacao
    ? [
        {
          text: textos.avaliacao.titulo,
          style: 'subtituloRegisto',
          margin: [0, 10, 0, 2],
        },
        ...linhasAvaliacao(registo.avaliacao),
      ]
    : []

  const sumarioValidacao: Content[] =
    ocorrencias.length > 0
      ? [
          { text: textos.formulario.avisosTitulo, style: 'subtituloRegisto', margin: [0, 8, 0, 2] },
          {
            ul: ocorrencias.map((o) => ({
              text: `[${o.severidade === 'erro' ? 'ERRO' : 'AVISO'}] ${o.mensagem}`,
              color: o.severidade === 'erro' ? '#b91c1c' : '#57534e',
            })),
          },
        ]
      : []

  return {
    stack: [...identificacao, ...especifico, ...cauda, ...avaliacao, ...sumarioValidacao],
    margin: [0, 0, 0, 16],
  }
}

export function gerarDocDefinition(ficheiro: FicheiroRat): TDocumentDefinitions {
  const ocorrencias = avaliarFicheiro(ficheiro)
  const ocorrenciasPorRegisto = new Map<string, Ocorrencia[]>()
  for (const ocorrencia of ocorrencias) {
    if (!ocorrencia.registoId) continue
    const lista = ocorrenciasPorRegisto.get(ocorrencia.registoId) ?? []
    lista.push(ocorrencia)
    ocorrenciasPorRegisto.set(ocorrencia.registoId, lista)
  }

  const conteudo: Content[] = [
    { text: textos.app.titulo, style: 'titulo' },
    {
      text: `${textos.lista.campoEquipa}: ${ficheiro.metadados.equipa}`,
      margin: [0, 0, 0, 2],
    },
    ...(ficheiro.metadados.contacto
      ? [{ text: `${textos.lista.campoContactoEquipa}: ${ficheiro.metadados.contacto}`, margin: [0, 0, 0, 2] as [number, number, number, number] }]
      : []),
    { text: `Exportado em: ${new Date(ficheiro.metadados.dataUltimaEdicao).toLocaleString('pt-PT')}`, margin: [0, 0, 0, 16] },
    ...ficheiro.registos.map((registo) =>
      seccaoRegisto(registo, ocorrenciasPorRegisto.get(registo.id) ?? []),
    ),
  ]

  return {
    content: conteudo,
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    styles: {
      titulo: { fontSize: 16, bold: true, margin: [0, 0, 0, 8] },
      tituloRegisto: { fontSize: 13, bold: true, margin: [0, 12, 0, 2] },
      subtituloRegisto: { fontSize: 10, italics: true, margin: [0, 0, 0, 6] },
    },
    footer: (paginaAtual: number, totalPaginas: number) => ({
      columns: [
        { text: FUNDAMENTACAO_RODAPE, fontSize: 7, margin: [40, 0, 0, 0] },
        { text: `${paginaAtual} / ${totalPaginas}`, alignment: 'right', fontSize: 7, margin: [0, 0, 40, 0] },
      ],
    }),
    pageMargins: [40, 40, 40, 40],
  }
}

interface DocumentoPdf {
  getBuffer: () => Promise<Uint8Array>
  getBlob: () => Promise<Blob>
}

interface PdfMakeInstancia {
  addVirtualFileSystem: (vfs: Record<string, string>) => void
  createPdf: (doc: TDocumentDefinitions) => DocumentoPdf
  setUrlAccessPolicy: (callback: (url: string) => boolean) => void
}

/**
 * pdfmake usa Roboto (fonte embebida no próprio pacote, servida a partir de
 * build/vfs_fonts.js em base64 — nunca de uma CDN) por omissão, o que
 * garante que os acentos de PT-PT saem corretos no PDF gerado.
 *
 * A biblioteca suporta, em geral, referenciar imagens remotas por URL num
 * documento — capacidade que esta aplicação nunca usa (só texto).
 * Desativa-se aqui explicitamente (CLAUDE.md §2.1: "zero rede em runtime"),
 * como reforço complementar à CSP com connect-src 'none' já aplicada no
 * bundle de produção. Ver também src/test/zero-rede.test.ts.
 */
async function criarPdfMake(): Promise<PdfMakeInstancia> {
  const pdfMakeModulo = await import('pdfmake/build/pdfmake')
  const vfsFontsModulo = await import('pdfmake/build/vfs_fonts')
  const pdfMake = (pdfMakeModulo as { default: PdfMakeInstancia }).default
  const vfs = (vfsFontsModulo as { default: Record<string, string> }).default
  pdfMake.addVirtualFileSystem(vfs)
  pdfMake.setUrlAccessPolicy(() => false)
  return pdfMake
}

export async function gerarPdfBlob(ficheiro: FicheiroRat): Promise<Blob> {
  const pdfMake = await criarPdfMake()
  const docDefinition = gerarDocDefinition(ficheiro)
  return pdfMake.createPdf(docDefinition).getBlob()
}

export async function gerarPdfBuffer(ficheiro: FicheiroRat): Promise<Uint8Array> {
  const pdfMake = await criarPdfMake()
  const docDefinition = gerarDocDefinition(ficheiro)
  return pdfMake.createPdf(docDefinition).getBuffer()
}

export function nomeFicheiroPdf(ficheiro: FicheiroRat): string {
  return `${nomeBaseFicheiro(ficheiro)}.pdf`
}

export async function exportarPdf(ficheiro: FicheiroRat): Promise<void> {
  const blob = await gerarPdfBlob(ficheiro)
  descarregarFicheiro(nomeFicheiroPdf(ficheiro), blob)
}
