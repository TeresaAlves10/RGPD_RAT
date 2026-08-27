import {
  baseLicitude,
  categoriasDados,
  categoriasTitulares,
  medidasTecnicasOrganizativas,
} from '@/domain/schema/vocabularios'
import type { CategoriaDados, MedidaTecnicaOrganizativa } from '@/domain/schema/comum'
import { textos } from '@/i18n/pt'

/** Conversão de ids de vocabulário e de respostas fechadas para texto legível. */

function rotuloDe(lista: { id: string; label: string }[], id: string | undefined): string {
  if (!id) return ''
  return lista.find((item) => item.id === id)?.label ?? id
}

export function rotuloBaseLicitude(id: string | undefined): string {
  return rotuloDe(baseLicitude, id)
}

/** Sim / Parcialmente / Não / Não aplicável — vazio quando por responder. */
export function rotuloResposta(valor: string | undefined): string {
  if (!valor) return ''
  const respostas = textos.respostas as Record<string, string>
  return respostas[valor] ?? valor
}

export function rotulosCategoriasTitulares(
  ids: string[] | undefined,
  outra: string | undefined,
): string {
  return (ids ?? [])
    .map((id) => (id === 'outro' && outra ? `Outro: ${outra}` : rotuloDe(categoriasTitulares, id)))
    .join('; ')
}

export function rotuloCategoriasDados(lista: CategoriaDados[] | undefined): string {
  return (lista ?? [])
    .map((item) => {
      const categoria =
        item.categoria === 'outro' && item.categoriaOutra
          ? `Outro: ${item.categoriaOutra}`
          : rotuloDe(categoriasDados, item.categoria)
      const tipos = item.tipos.filter(Boolean).join(', ')
      return tipos ? `${categoria} (${tipos})` : categoria
    })
    .join('; ')
}

export function rotuloMedidas(lista: MedidaTecnicaOrganizativa[] | undefined): string {
  return (lista ?? [])
    .map((item) =>
      item.medida === 'outro' && item.medidaOutra
        ? `Outro: ${item.medidaOutra}`
        : rotuloDe(medidasTecnicasOrganizativas, item.medida),
    )
    .join('; ')
}
