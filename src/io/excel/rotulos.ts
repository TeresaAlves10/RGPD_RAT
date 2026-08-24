import {
  aipdSchema,
  type Aipd,
  type CategoriaDados,
  type MedidaTecnicaOrganizativa,
  type TransferenciaInternacional,
} from '@/domain/schema/comum'
import {
  baseLicitude,
  categoriasDados,
  categoriasTitulares,
  condicaoArt9,
  mecanismoTransferencia,
  medidasTecnicasOrganizativas,
  type ItemVocabulario,
} from '@/domain/schema/vocabularios'
import { textos } from '@/i18n/pt'

/**
 * Tradução de ids de vocabulário controlado para os rótulos legíveis
 * usados na folha "Registos" do Excel exportado (CLAUDE.md §7: "folha
 * legível"). O ficheiro `_dados` continua a guardar os ids, não os
 * rótulos — só esta folha é traduzida.
 */

function rotulo(vocabulario: ItemVocabulario[], id: string | undefined): string {
  if (!id) return ''
  return vocabulario.find((item) => item.id === id)?.label ?? id
}

export function rotuloBaseLicitude(id: string): string {
  return rotulo(baseLicitude, id)
}

export function rotulosCondicaoArt9(ids: string[] | undefined): string {
  return (ids ?? []).map((id) => rotulo(condicaoArt9, id)).join('; ')
}

export function rotulosCategoriasTitulares(ids: string[], outra?: string): string {
  const rotulos = ids.map((id) => rotulo(categoriasTitulares, id))
  if (outra) return [...rotulos, `Outro: ${outra}`].join('; ')
  return rotulos.join('; ')
}

export function rotuloCategoriasDados(itens: CategoriaDados[]): string {
  return itens
    .map((item) => {
      const nomeCategoria =
        item.categoria === 'outro' ? item.categoriaOutra || textos.formulario.outroEspecificar : rotulo(categoriasDados, item.categoria)
      return `${nomeCategoria}: ${item.tipos.join(', ')}`
    })
    .join('; ')
}

export function rotuloMecanismoTransferencia(t: TransferenciaInternacional): string {
  if (!t.existem) return textos.formulario.simNao.nao
  if (t.mecanismo === 'outro') return t.mecanismoOutro || textos.formulario.outroEspecificar
  return rotulo(mecanismoTransferencia, t.mecanismo)
}

export function rotuloMedidas(itens: MedidaTecnicaOrganizativa[]): string {
  return itens
    .map((item) =>
      item.medida === 'outro'
        ? item.medidaOutra || textos.formulario.outroEspecificar
        : rotulo(medidasTecnicasOrganizativas, item.medida),
    )
    .join('; ')
}

export function rotuloAipd(valor: Aipd): string {
  const validado = aipdSchema.safeParse(valor)
  return validado.success ? textos.aipd[validado.data] : valor
}

export function rotuloSimNao(valor: boolean): string {
  return valor ? textos.formulario.simNao.sim : textos.formulario.simNao.nao
}
