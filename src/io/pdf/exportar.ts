import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { Registo } from '@/domain/schema/registo'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { avaliarFicheiro } from '@/domain/rules/motor'
import type { Ocorrencia } from '@/domain/rules/types'
import { descarregarFicheiro } from '@/io/descarregar'
import { nomeBaseFicheiro } from '@/io/nome-ficheiro'
import { rotuloEscala, rotuloResposta, rotuloUnidade } from '@/io/excel/rotulos'
import { NOME_ORGANIZACAO } from '@/config/organizacao'
import { formatarTamanho, tamanhoTotal } from '@/domain/schema/anexo'
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

/** As sete secções do responsável (art. 30.º/1), na ordem do formulário. */
function seccoesResponsavel(registo: RegistoResponsavel): Content[] {
  const anexos = registo.anexos ?? []
  const anexosContrato = registo.anexosContrato ?? []
  const politicaPrivacidadeAnexos = registo.politicaPrivacidadeAnexos ?? []

  return [
    ...seccao(textos.passos.caracterizacao, [
      ...campo(c.direcao, registo.direcao),
      ...campo(c.unidadeCoordenacao, rotuloUnidade(registo.unidadeCoordenacao)),
      ...campo(c.descricao, registo.descricao),
      ...campo(c.finalidade, registo.finalidade),
      ...campo(c.operacoesTratamento, registo.operacoesTratamento),
      ...campo(c.entidadesParaQuemEnvioDados, registo.entidadesParaQuemEnvioDados),
      ...campo(c.dadosPessoais, registo.dadosPessoais),
      ...campo(
        c.dadosNecessariosParaFinalidade,
        rotuloResposta(registo.dadosNecessariosParaFinalidade),
      ),
      ...campo(c.categoriasDados, registo.categoriasDados),
      ...campo(c.categoriasEspeciais, rotuloResposta(registo.categoriasEspeciais)),
      ...campo(
        c.categoriasEspeciaisNecessarias,
        rotuloResposta(registo.categoriasEspeciaisNecessarias),
      ),
      ...campo(c.categoriasTitulares, registo.categoriasTitulares),
      ...campo(c.entidadesQueEnviamDados, registo.entidadesQueEnviamDados),
      ...campo(c.suportesFisicos, registo.suportesFisicos),
      ...campo(c.localizacaoSuportesFisicos, registo.localizacaoSuportesFisicos),
    ]),

    ...seccao(textos.passos.ferramentas, [
      ...campo(c.ferramentasAplicacoes, registo.ferramentasAplicacoes),
      ...campo(
        c.numeroCamposComDadosPessoais,
        rotuloEscala(registo.numeroCamposComDadosPessoais),
      ),
      ...campo(c.volumeDadosPessoais, rotuloEscala(registo.volumeDadosPessoais)),
      ...campo(c.numeroUtilizadoresComAcesso, rotuloEscala(registo.numeroUtilizadoresComAcesso)),
    ]),

    ...seccao(textos.passos.subcontratados, [
      ...campo(c.entidadesSubcontratadas, registo.entidadesSubcontratadas),
      ...campo(c.operacoesTratamentoSubcontratadas, registo.operacoesTratamentoSubcontratadas),
      ...campo(c.existeContrato, rotuloResposta(registo.existeContrato)),
      ...campo(
        c.contratoComClausulasProtecaoDados,
        rotuloResposta(registo.contratoComClausulasProtecaoDados),
      ),
      ...campo(c.anexosContrato, anexosContrato.map((a) => a.nome).join('; ')),
      ...campo(
        c.transferenciasPaisesTerceiros,
        rotuloResposta(registo.transferenciasPaisesTerceiros),
      ),
      ...campo(c.paisesTerceiros, registo.paisesTerceiros),
      ...campo(c.auditoriasAoSubcontratado, rotuloResposta(registo.auditoriasAoSubcontratado)),
      ...campo(c.pedidoAutorizacaoCnpd, rotuloResposta(registo.pedidoAutorizacaoCnpd)),
    ]),

    ...seccao(textos.passos.baseLicitude, [
      ...campo(c.baseLicitude, registo.baseLicitude),
      ...campo(
        c.consentimentoMecanismosDemonstracao,
        registo.consentimentoMecanismosDemonstracao,
      ),
      ...campo(
        c.consentimentoResponsabilidadeParental,
        rotuloResposta(registo.consentimentoResponsabilidadeParental),
      ),
      ...campo(
        c.retencaoDefinidaPelaOrganizacao(NOME_ORGANIZACAO),
        registo.retencaoDefinidaPelaOrganizacao,
      ),
      ...campo(c.criterioRetencao(NOME_ORGANIZACAO), registo.criterioRetencao),
      ...campo(c.retencaoPorNormativosLegais, registo.retencaoPorNormativosLegais),
    ]),

    ...seccao(textos.passos.requisitosFuncionais, [
      ...campo(c.deverInformar, registo.deverInformar),
      ...campo(c.direitoAcesso, registo.direitoAcesso),
      ...campo(c.direitoRetificacao, registo.direitoRetificacao),
      ...campo(c.direitoApagamento, registo.direitoApagamento),
      ...campo(c.direitoPortabilidade, registo.direitoPortabilidade),
      ...campo(c.direitoLimitacao, registo.direitoLimitacao),
      ...campo(c.direitoDecisoesAutomatizadas, registo.direitoDecisoesAutomatizadas),
      ...campo(c.direitoOposicao, registo.direitoOposicao),
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
      ...campo(
        c.acessosFormalmenteAutorizados,
        rotuloResposta(registo.acessosFormalmenteAutorizados),
      ),
      ...campo(
        c.controlosAcessosPrivilegiados,
        rotuloResposta(registo.controlosAcessosPrivilegiados),
      ),
      ...campo(c.revisaoPeriodicaAcessos, rotuloResposta(registo.revisaoPeriodicaAcessos)),
      ...campo(c.remocaoAcessosASaida, rotuloResposta(registo.remocaoAcessosASaida)),
      ...campo(c.detecaoNotificacaoViolacoes, registo.detecaoNotificacaoViolacoes),
    ]),

    ...seccao(textos.passos.observacoesGerais, [
      ...campo(c.medidasTecnicasOrganizativas, registo.medidasTecnicasOrganizativas),
      ...campo(c.normativosAplicaveis, registo.normativosAplicaveis),
      ...campo(c.acessoProdutoSistema, registo.acessoProdutoSistema),
      ...campo(c.politicaPrivacidade, registo.politicaPrivacidade),
      ...campo(
        c.politicaPrivacidadeAnexos,
        politicaPrivacidadeAnexos.length > 0
          ? politicaPrivacidadeAnexos.map((a) => a.nome).join('; ')
          : undefined,
      ),
      // Os anexos não são embebidos no PDF: lista-se o que existe, porque
      // o PDF é para leitura e arquivo, não para reimportar.
      ...campo(
        c.anexos,
        anexos.length > 0
          ? `${anexos.map((a) => a.nome).join('; ')} (${formatarTamanho(tamanhoTotal(anexos))})`
          : undefined,
      ),
      ...campo(c.aipdRealizada, rotuloResposta(registo.aipdRealizada)),
      ...campo(c['gestorProjeto.nome'], registo.gestorProjeto.nome),
      ...campo(c['gestorProjeto.contacto'], registo.gestorProjeto.contacto),
      ...campo(c.observacoes, registo.observacoes),
    ]),
  ]
}

/**
 * As cinco secções do subcontratante (art. 30.º/2) — mais curtas do que
 * as do responsável, na mesma ordem do formulário.
 */
function seccoesSubcontratado(registo: RegistoSubcontratado): Content[] {
  const anexos = registo.anexos ?? []
  const politicaPrivacidadeAnexos = registo.politicaPrivacidadeAnexos ?? []

  return [
    ...seccao(textos.passos.subIdentificacao, [
      ...campo(c.nomeResponsavelTratamento, registo.nomeResponsavelTratamento),
      ...campo(c.direcao, registo.direcao),
      ...campo(c.unidadeCoordenacao, rotuloUnidade(registo.unidadeCoordenacao)),
      ...campo(c.descricao, registo.descricao),
    ]),

    ...seccao(textos.passos.subTratamentoBaseLegal, [
      ...campo(c.finalidade, registo.finalidade),
      ...campo(c.baseLegal, registo.baseLegal),
      ...campo(c.recolhaDados, registo.recolhaDados),
    ]),

    ...seccao(textos.passos.subTitularesDados, [
      ...campo(c.categoriasTitulares, registo.categoriasTitulares),
      ...campo(c.categoriasDados, registo.categoriasDados),
      ...campo(c.dadosPessoais, registo.dadosPessoais),
      ...campo(c.categoriasEspeciais, rotuloResposta(registo.categoriasEspeciais)),
    ]),

    ...seccao(textos.passos.subTransferenciasConservacao, [
      ...campo(
        c.transferenciasPaisesTerceiros,
        rotuloResposta(registo.transferenciasPaisesTerceiros),
      ),
      ...campo(c.paisesTerceiros, registo.paisesTerceiros),
      ...campo(c.prazoConservacao, registo.prazoConservacao),
      ...campo(c.criterioRetencao(NOME_ORGANIZACAO), registo.criterioRetencao),
    ]),

    ...seccao(textos.passos.subSegurancaObservacoes, [
      ...campo(c.medidasTecnicasOrganizativas, registo.medidasTecnicasOrganizativas),
      ...campo(c.acessoProdutoSistema, registo.acessoProdutoSistema),
      ...campo(c.politicaPrivacidade, registo.politicaPrivacidade),
      ...campo(
        c.politicaPrivacidadeAnexos,
        politicaPrivacidadeAnexos.length > 0
          ? politicaPrivacidadeAnexos.map((a) => a.nome).join('; ')
          : undefined,
      ),
      ...campo(
        c.existemOutrosSubcontratantes,
        rotuloResposta(registo.existemOutrosSubcontratantes),
      ),
      ...campo(c.entidadesSubcontratadas, registo.entidadesSubcontratadas),
      ...campo(
        c.anexos,
        anexos.length > 0
          ? `${anexos.map((a) => a.nome).join('; ')} (${formatarTamanho(tamanhoTotal(anexos))})`
          : undefined,
      ),
      ...campo(c.aipdRealizada, rotuloResposta(registo.aipdRealizada)),
      ...campo(c['gestorProjeto.nome'], registo.gestorProjeto.nome),
      ...campo(c['gestorProjeto.contacto'], registo.gestorProjeto.contacto),
      ...campo(c.observacoes, registo.observacoes),
    ]),
  ]
}

function seccaoRegisto(registo: Registo, ocorrencias: Ocorrencia[]): Content {
  const cabecalho: Content[] = [
    { text: `${registo.numero}. ${registo.nomeTratamento}`, style: 'tituloRegisto' },
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
    { text: NOME_ORGANIZACAO, margin: [0, 0, 0, 2] },
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
