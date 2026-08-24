import baseLicitudeJson from '@/domain/vocabularios/base-licitude.json'
import condicaoArt9Json from '@/domain/vocabularios/condicao-art9.json'
import categoriasTitularesJson from '@/domain/vocabularios/categorias-titulares.json'
import categoriasDadosJson from '@/domain/vocabularios/categorias-dados.json'
import mecanismoTransferenciaJson from '@/domain/vocabularios/mecanismo-transferencia.json'
import medidasTecnicasOrganizativasJson from '@/domain/vocabularios/medidas-tecnicas-organizativas.json'

export interface ItemVocabulario {
  id: string
  label: string
  artigo?: string
}

export interface ItemCategoriaDados extends ItemVocabulario {
  tipos: string[]
}

export interface ItemMedidaTecnicaOrganizativa extends ItemVocabulario {
  tipo: 'tecnica' | 'organizativa'
}

export const baseLicitude = baseLicitudeJson as ItemVocabulario[]
export const condicaoArt9 = condicaoArt9Json as ItemVocabulario[]
export const categoriasTitulares = categoriasTitularesJson as ItemVocabulario[]
export const categoriasDados = categoriasDadosJson as ItemCategoriaDados[]
export const mecanismoTransferencia = mecanismoTransferenciaJson as ItemVocabulario[]
export const medidasTecnicasOrganizativas =
  medidasTecnicasOrganizativasJson as ItemMedidaTecnicaOrganizativa[]

function idsDe(vocabulario: ItemVocabulario[]): [string, ...string[]] {
  const ids = vocabulario.map((item) => item.id)
  if (ids.length === 0) {
    throw new Error('Vocabulário vazio')
  }
  return ids as [string, ...string[]]
}

export const idsBaseLicitude = idsDe(baseLicitude)
export const idsCondicaoArt9 = idsDe(condicaoArt9)
export const idsCategoriasTitulares = idsDe(categoriasTitulares)
export const idsCategoriasDados = idsDe(categoriasDados)
export const idsMecanismoTransferencia = idsDe(mecanismoTransferencia)
export const idsMedidasTecnicasOrganizativas = idsDe(medidasTecnicasOrganizativas)
