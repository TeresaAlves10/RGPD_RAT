import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Footer,
} from 'docx'
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

/** Uma linha "Rótulo: valor". Campos vazios não ocupam espaço no documento. */
function campo(label: string, valor: string | undefined): Paragraph[] {
  if (!valor) return []
  return [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: valor }),
      ],
    }),
  ]
}

function titulo(texto: string): Paragraph {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 60 } })
}

/** Uma secção só entra no documento se tiver conteúdo. */
function seccao(nome: string, linhas: Paragraph[]): Paragraph[] {
  return linhas.length > 0 ? [titulo(nome), ...linhas] : []
}

/** As sete secções do responsável (art. 30.º/1), na ordem do formulário — espelha src/io/pdf/exportar.ts. */
function seccoesResponsavel(registo: RegistoResponsavel): Paragraph[] {
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
      // Os anexos não são embebidos no Word: lista-se o que existe, porque
      // o documento é para leitura e arquivo, não para reimportar.
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
 * as do responsável, na mesma ordem do formulário — espelha
 * src/io/pdf/exportar.ts.
 */
function seccoesSubcontratado(registo: RegistoSubcontratado): Paragraph[] {
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

function seccaoRegisto(registo: Registo, ocorrencias: Ocorrencia[]): Paragraph[] {
  const cabecalho: Paragraph[] = [
    new Paragraph({
      text: `${registo.numero}. ${registo.nomeTratamento}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 320, after: 40 },
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text:
            registo.tipoRegisto === 'responsavel'
              ? textos.lista.tipoResponsavel
              : textos.lista.tipoSubcontratado,
          italics: true,
        }),
      ],
    }),
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
  const seccaoAnotacoes: Paragraph[] =
    anotacoes.length > 0
      ? [
          titulo(textos.validador.anotacoesTitulo),
          ...anotacoes.map(
            (a) =>
              new Paragraph({
                text: `${a.campo}: ${a.texto}${a.autor ? ` — ${a.autor}` : ''}`,
                bullet: { level: 0 },
              }),
          ),
        ]
      : []

  const sumarioValidacao: Paragraph[] =
    ocorrencias.length > 0
      ? [
          titulo(textos.formulario.avisosTitulo),
          ...ocorrencias.map(
            (o) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun({
                    text: `[${o.severidade === 'erro' ? 'ERRO' : 'AVISO'}] ${o.mensagem}`,
                    color: o.severidade === 'erro' ? 'B91C1C' : '57534E',
                  }),
                ],
              }),
          ),
        ]
      : []

  return [...cabecalho, ...corpo, ...seccaoAnotacoes, ...sumarioValidacao]
}

export function gerarDocumento(ficheiro: FicheiroRat): Document {
  const ocorrencias = avaliarFicheiro(ficheiro)
  const ocorrenciasPorRegisto = new Map<string, Ocorrencia[]>()
  for (const ocorrencia of ocorrencias) {
    if (!ocorrencia.registoId) continue
    const lista = ocorrenciasPorRegisto.get(ocorrencia.registoId) ?? []
    lista.push(ocorrencia)
    ocorrenciasPorRegisto.set(ocorrencia.registoId, lista)
  }

  const cabecalhoDocumento: Paragraph[] = [
    new Paragraph({ text: textos.app.titulo, heading: HeadingLevel.TITLE, spacing: { after: 80 } }),
    new Paragraph({ text: NOME_ORGANIZACAO, spacing: { after: 40 } }),
    new Paragraph({
      text: `${textos.lista.campoEquipa}: ${ficheiro.metadados.equipa}`,
      spacing: { after: 40 },
    }),
    ...(ficheiro.metadados.contacto
      ? [
          new Paragraph({
            text: `${textos.lista.campoContactoEquipa}: ${ficheiro.metadados.contacto}`,
            spacing: { after: 40 },
          }),
        ]
      : []),
    new Paragraph({
      text: `Exportado em: ${new Date(ficheiro.metadados.dataUltimaEdicao).toLocaleString('pt-PT')}`,
      spacing: { after: 200 },
    }),
  ]

  const conteudo = ficheiro.registos.flatMap((registo) =>
    seccaoRegisto(registo, ocorrenciasPorRegisto.get(registo.id) ?? []),
  )

  return new Document({
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: FUNDAMENTACAO_RODAPE, size: 14 })],
              }),
            ],
          }),
        },
        children: [...cabecalhoDocumento, ...conteudo],
      },
    ],
  })
}

export async function gerarWordBlob(ficheiro: FicheiroRat): Promise<Blob> {
  return Packer.toBlob(gerarDocumento(ficheiro))
}

export function nomeFicheiroWord(ficheiro: FicheiroRat): string {
  return `${nomeBaseFicheiro(ficheiro)}.docx`
}

export async function exportarWord(ficheiro: FicheiroRat): Promise<void> {
  const blob = await gerarWordBlob(ficheiro)
  descarregarFicheiro(nomeFicheiroWord(ficheiro), blob)
}
