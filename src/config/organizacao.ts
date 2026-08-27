/**
 * Configuração da organização que usa esta instância da aplicação.
 *
 * Está tudo num só ficheiro de propósito: o código da aplicação é
 * genérico e público (CLAUDE.md §2.7), e outra organização adota-a
 * mudando apenas este ficheiro — sem tocar em schemas, formulários ou
 * exports.
 */

/** Nome usado nos rótulos que falam de decisões internas (ex.: retenção). */
export const NOME_ORGANIZACAO = 'SPMS'

/**
 * Logótipo da organização, mostrado na barra lateral.
 *
 * Basta colocar o ficheiro em `public/logo.svg` — fica junto do bundle,
 * servido pela própria aplicação, nunca de uma CDN (CLAUDE.md §2.1).
 * Enquanto o ficheiro não existir, a barra lateral mostra o nome da
 * organização em texto: a `<img>` falha a carregar e o componente troca
 * para o nome, sem ícone de imagem partida.
 *
 * Para usar outro nome ou formato (`logo.png`, por exemplo), muda aqui.
 * Para não ter logótipo nenhum, põe `undefined`.
 */
export const LOGO: string | undefined = 'logo.svg'

/** Direção por omissão de um registo novo. */
export const DIRECAO_POR_OMISSAO = 'Direção de Arquitetura, Negócio e Análise de Dados (DANAD)'

export interface UnidadeCoordenacao {
  id: string
  sigla: string
  nome: string
}

/** Unidades de Coordenação oferecidas na lista de seleção. */
export const UNIDADES_COORDENACAO: UnidadeCoordenacao[] = [
  { id: 'urn', sigla: 'URN', nome: 'Unidade de Registos Nacionais' },
  { id: 'uia', sigla: 'UIA', nome: 'Unidade de Advanced Analytics & Intelligence' },
  { id: 'uid', sigla: 'UID', nome: 'Unidade de Inovação Digital' },
  {
    id: 'upace',
    sigla: 'UPACE',
    nome: 'Unidade de Planeamento, Arquitetura, Conformidade e Engenharia',
  },
]

export const idsUnidadesCoordenacao = UNIDADES_COORDENACAO.map((u) => u.id) as [string, ...string[]]

export function rotuloUnidade(id: string | undefined): string {
  if (!id) return ''
  const unidade = UNIDADES_COORDENACAO.find((u) => u.id === id)
  return unidade ? `${unidade.sigla} — ${unidade.nome}` : id
}
