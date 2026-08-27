import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { Registo } from '@/domain/schema/registo'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { avaliarFicheiro } from '@/domain/rules/motor'
import type { Ocorrencia } from '@/domain/rules/types'
import { descarregarFicheiro } from '@/io/descarregar'
import { nomeBaseFicheiro } from '@/io/nome-ficheiro'
import {
  rotuloBaseLicitude,
  rotuloCategoriasDados,
  rotuloMedidas,
  rotuloResposta,
  rotulosCategoriasTitulares,
} from '@/io/excel/rotulos'
import { textos } from '@/i18n/pt'

const FUNDAMENTACAO_RODAPE =
  'Regulamento (UE) 2016/679 (RGPD) — Registo de Atividades de Tratamento nos termos do art. 30.º'

const c = textos.campos

/** Uma linha "Rótulo: valor". Campos vazios não ocupam espaço no PDF. */
function campo(label: string, valor: string | undefined): Content[] {
  if (!valor) return []
  return [{ text: [{ text: `${label}: `, bold: true }, valor], margin: [0, 0, 0, 4] }]
}

function titulo(texto: string): Content {
  return { text: texto, style: 'tituloSeccao' }
}

/** Uma secção só entra no PDF se tiver conteúdo. */
function seccao(nome: string, linhas: Content[]): Content[] {
  return linhas.length > 0 ? [titulo(nome), ...linhas] : []
}

function seccoesResponsavel(registo: RegistoResponsavel): Content[] {
  const subcontratados = (registo.subcontratados ?? []).flatMap((s, indice) => {
    const linhas = [
      ...campo(c['subcontratado.nome'], s.nome),
      ...campo(c['subcontratado.operacoesTratamento'], s.operacoesTratamento),
      ...campo(c['subcontratado.existeContrato'], rotuloResposta(s.existeContrato)),
      ...campo(
        c['subcontratado.contratoComClausulasProtecaoDados'],
        rotuloResposta(s.contratoComClausulasProtecaoDados),
      ),
      ...campo(
        c['subcontratado.transferenciasPaisesTerceiros'],
        rotuloResposta(s.transferenciasPaisesTerceiros),
      ),
      ...campo(
        c['subcontratado.auditoriasAoSubcontratado'],
        rotuloResposta(s.auditoriasAoSubcontratado),
      ),
      ...campo(c['subcontratado.pedidoAutorizacaoCnpd'], rotuloResposta(s.pedidoAutorizacaoCnpd)),
    ]
    if (linhas.length === 0) return []
    return [
      { text: `${indice + 1}.`, bold: true, margin: [0, 4, 0, 2] } as Content,
      ...linhas,
    ]
  })

  return [
    ...seccao(textos.passos.caracterizacao, [
      ...campo(c.direcao, registo.direcao),
      ...campo(c.unidadeCoordenacao, registo.unidadeCoordenacao),
      ...campo(c.descricao, registo.descricao),
      ...campo(c.finalidade, registo.finalidade),
      ...campo(c.operacoesTratamento, registo.operacoesTratamento),
      ...campo(c.trataDadosPessoais, rotuloResposta(registo.trataDadosPessoais)),
      ...campo(
        c.dadosNecessariosParaFinalidade,
        rotuloResposta(registo.dadosNecessariosParaFinalidade),
      ),
      ...campo(
        c['categoriasEspeciais.aplicavel'],
        rotuloResposta(registo.categoriasEspeciais?.aplicavel),
      ),
      ...campo(c['categoriasEspeciais.identificar'], registo.categoriasEspeciais?.identificar),
      ...campo(
        c.categoriasEspeciaisNecessarias,
        rotuloResposta(registo.categoriasEspeciaisNecessarias),
      ),
      ...campo(
        c.categoriasTitulares,
        rotulosCategoriasTitulares(registo.categoriasTitulares, registo.categoriasTitularesOutra),
      ),
      ...campo(c.categoriasDados, rotuloCategoriasDados(registo.categoriasDados)),
      ...campo(c.entidadesQueEnviamDados, registo.entidadesQueEnviamDados),
      ...campo(c.entidadesParaQuemEnvioDados, registo.entidadesParaQuemEnvioDados),
      ...campo(c.suportesFisicos, registo.suportesFisicos),
      ...campo(c.localizacaoSuportesFisicos, registo.localizacaoSuportesFisicos),
    ]),

    ...seccao(textos.passos.ferramentas, [
      ...campo(c.ferramentasAplicacoes, registo.ferramentasAplicacoes),
      ...campo(c.numeroCamposComDadosPessoais, registo.numeroCamposComDadosPessoais),
      ...campo(c.volumeDadosPessoais, registo.volumeDadosPessoais),
      ...campo(c.numeroUtilizadoresComAcesso, registo.numeroUtilizadoresComAcesso),
    ]),

    ...seccao(textos.passos.subcontratados, subcontratados),

    ...seccao(textos.passos.baseLicitude, [
      ...campo(c.baseLicitude, rotuloBaseLicitude(registo.baseLicitude)),
      ...campo(
        c.consentimentoMecanismosDemonstracao,
        rotuloResposta(registo.consentimentoMecanismosDemonstracao),
      ),
      ...campo(
        c.consentimentoResponsabilidadeParental,
        rotuloResposta(registo.consentimentoResponsabilidadeParental),
      ),
      ...campo(
        c.retencaoDefinidaPelaOrganizacao('a organização'),
        rotuloResposta(registo.retencaoDefinidaPelaOrganizacao),
      ),
      ...campo(c.retencaoPorNormativosLegais, rotuloResposta(registo.retencaoPorNormativosLegais)),
    ]),

    ...seccao(textos.passos.requisitosFuncionais, [
      ...campo(c.deverInformar, rotuloResposta(registo.deverInformar)),
      ...campo(c.direitoAcesso, rotuloResposta(registo.direitoAcesso)),
      ...campo(c.direitoRetificacao, rotuloResposta(registo.direitoRetificacao)),
      ...campo(c.direitoApagamento, rotuloResposta(registo.direitoApagamento)),
      ...campo(c.direitoPortabilidade, rotuloResposta(registo.direitoPortabilidade)),
      ...campo(c.direitoLimitacao, rotuloResposta(registo.direitoLimitacao)),
      ...campo(c.direitoDecisoesAutomatizadas, rotuloResposta(registo.direitoDecisoesAutomatizadas)),
      ...campo(c.direitoOposicao, rotuloResposta(registo.direitoOposicao)),
      ...campo(c.detecaoNotificacaoViolacoes, rotuloResposta(registo.detecaoNotificacaoViolacoes)),
    ]),

    ...seccao(textos.passos.controlosOperacionais, [
      ...campo(
        c.procedimentosAcessosDocumentados,
        rotuloResposta(registo.procedimentosAcessosDocumentados),
      ),
      ...campo(
        c.procedimentosAcessosImplementados,
        rotuloResposta(registo.procedimentosAcessosImplementados),
      ),
      ...campo(c.acessosFormalmenteAutorizados, rotuloResposta(registo.acessosFormalmenteAutorizados)),
      ...campo(c.controlosAcessosPrivilegiados, rotuloResposta(registo.controlosAcessosPrivilegiados)),
      ...campo(c.revisaoPeriodicaAcessos, rotuloResposta(registo.revisaoPeriodicaAcessos)),
      ...campo(c.remocaoAcessosASaida, rotuloResposta(registo.remocaoAcessosASaida)),
    ]),

    ...seccao(textos.passos.observacoesGerais, [
      ...campo(c.medidasTecnicasOrganizativas, rotuloMedidas(registo.medidasTecnicasOrganizativas)),
      ...campo(c.normativosAplicaveis, registo.normativosAplicaveis),
      ...campo(c.diagramaProcesso, registo.diagramaProcesso),
      ...campo(c.aipdRealizada, rotuloResposta(registo.aipdRealizada)),
      ...campo(c['gestorProjeto.nome'], registo.gestorProjeto.nome),
      ...campo(c['gestorProjeto.contacto'], registo.gestorProjeto.contacto),
      ...campo(c.observacoes, registo.observacoes),
    ]),
  ]
}

function seccoesSubcontratado(registo: RegistoSubcontratado): Content[] {
  return [
    ...seccao(textos.passos.identificacaoSubcontratado, [
      ...campo(c.nomeResponsavelTratamento, registo.nomeResponsavelTratamento),
      ...campo(c.direcao, registo.direcao),
      ...campo(c.unidadeCoordenacao, registo.unidadeCoordenacao),
      ...campo(c.descricao, registo.descricao),
    ]),

    ...seccao(textos.passos.tratamentoSubcontratado, [
      ...campo(c.finalidadeSubcontratado, registo.finalidade),
      ...campo(c.responsavelConjunto, registo.responsavelConjunto),
      ...campo(c.baseLegal, rotuloBaseLicitude(registo.baseLegal)),
      ...campo(c.recolhaDados, registo.recolhaDados),
    ]),

    ...seccao(textos.passos.dadosSubcontratado, [
      ...campo(
        c.categoriasTitulares,
        rotulosCategoriasTitulares(registo.categoriasTitulares, registo.categoriasTitularesOutra),
      ),
      ...campo(c.categoriasDados, rotuloCategoriasDados(registo.categoriasDados)),
      ...campo(
        c['categoriasEspeciais.aplicavel'],
        rotuloResposta(registo.categoriasEspeciais?.aplicavel),
      ),
      ...campo(c['categoriasEspeciais.identificar'], registo.categoriasEspeciais?.identificar),
    ]),

    ...seccao(textos.passos.destinatariosSubcontratado, [
      ...campo(c.destinatarios, registo.destinatarios),
      ...campo(c['transferencias.existem'], rotuloResposta(registo.transferencias?.existem)),
      ...campo(c['transferencias.identificar'], registo.transferencias?.identificar),
    ]),

    ...seccao(textos.passos.segurancaSubcontratado, [
      ...campo(c.prazoConservacao, registo.prazoConservacao),
      ...campo(c.medidasTecnicasOrganizativas, rotuloMedidas(registo.medidasTecnicasOrganizativas)),
      ...campo(
        c.outrosSubcontratantes,
        (registo.outrosSubcontratantes ?? [])
          .map(
            (s) =>
              `${s.nome ?? ''}${s.contacto ? ` (${s.contacto})` : ''}${
                s.dataContrato ? ` — ${s.dataContrato}` : ''
              }`,
          )
          .join('; '),
      ),
    ]),

    ...seccao(textos.passos.observacoesSubcontratado, [
      ...campo(c.observacoes, registo.observacoes),
      ...campo(c.diagramaEcosistema, registo.diagramaEcosistema),
      ...campo(c.aipdRealizada, rotuloResposta(registo.aipdRealizada)),
      ...campo(c['gestorProjeto.nome'], registo.gestorProjeto.nome),
      ...campo(c['gestorProjeto.contacto'], registo.gestorProjeto.contacto),
    ]),
  ]
}

function seccaoRegisto(registo: Registo, ocorrencias: Ocorrencia[]): Content {
  const cabecalho: Content[] = [
    { text: registo.nomeTratamento, style: 'tituloRegisto' },
    {
      text:
        registo.tipoRegisto === 'responsavel'
          ? textos.lista.tipoResponsavel
          : textos.lista.tipoSubcontratado,
      style: 'subtituloRegisto',
    },
    ...campo(textos.estado.etiqueta, textos.estado[registo.estado]),
    ...(registo.validacao
      ? campo(
          textos.estado.campoValidadoPor,
          `${registo.validacao.validadoPor ?? '—'} (${new Date(
            registo.validacao.data,
          ).toLocaleDateString('pt-PT')})`,
        )
      : []),
  ]

  const corpo =
    registo.tipoRegisto === 'responsavel'
      ? seccoesResponsavel(registo)
      : seccoesSubcontratado(registo)

  const anotacoes = registo.anotacoes ?? []
  const seccaoAnotacoes: Content[] =
    anotacoes.length > 0
      ? [
          titulo(textos.validador.anotacoesTitulo),
          {
            ul: anotacoes.map(
              (a) => `[${a.campo}] ${a.texto}${a.autor ? ` — ${a.autor}` : ''}`,
            ),
          },
        ]
      : []

  const sumarioValidacao: Content[] =
    ocorrencias.length > 0
      ? [
          titulo(textos.formulario.avisosTitulo),
          {
            ul: ocorrencias.map((o) => ({
              text: `[${o.severidade === 'erro' ? 'ERRO' : 'AVISO'}] ${o.mensagem}`,
              color: o.severidade === 'erro' ? '#b91c1c' : '#57534e',
            })),
          },
        ]
      : []

  return {
    stack: [...cabecalho, ...corpo, ...seccaoAnotacoes, ...sumarioValidacao],
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
    ...(ficheiro.metadados.organizacao
      ? [{ text: ficheiro.metadados.organizacao, margin: [0, 0, 0, 2] as [number, number, number, number] }]
      : []),
    { text: `${textos.lista.campoEquipa}: ${ficheiro.metadados.equipa}`, margin: [0, 0, 0, 2] },
    ...(ficheiro.metadados.contacto
      ? [
          {
            text: `${textos.lista.campoContactoEquipa}: ${ficheiro.metadados.contacto}`,
            margin: [0, 0, 0, 2] as [number, number, number, number],
          },
        ]
      : []),
    {
      text: `Exportado em: ${new Date(ficheiro.metadados.dataUltimaEdicao).toLocaleString('pt-PT')}`,
      margin: [0, 0, 0, 16],
    },
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
      tituloSeccao: { fontSize: 11, bold: true, margin: [0, 8, 0, 3] },
    },
    footer: (paginaAtual: number, totalPaginas: number) => ({
      columns: [
        { text: FUNDAMENTACAO_RODAPE, fontSize: 7, margin: [40, 0, 0, 0] },
        {
          text: `${paginaAtual} / ${totalPaginas}`,
          alignment: 'right',
          fontSize: 7,
          margin: [0, 0, 40, 0],
        },
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
  return pdfMake.createPdf(gerarDocDefinition(ficheiro)).getBlob()
}

export async function gerarPdfBuffer(ficheiro: FicheiroRat): Promise<Uint8Array> {
  const pdfMake = await criarPdfMake()
  return pdfMake.createPdf(gerarDocDefinition(ficheiro)).getBuffer()
}

export function nomeFicheiroPdf(ficheiro: FicheiroRat): string {
  return `${nomeBaseFicheiro(ficheiro)}.pdf`
}

export async function exportarPdf(ficheiro: FicheiroRat): Promise<void> {
  const blob = await gerarPdfBlob(ficheiro)
  descarregarFicheiro(nomeFicheiroPdf(ficheiro), blob)
}
