import type { FicheiroRat } from '@/domain/schema/ficheiro'
import { avaliarFicheiro } from '@/domain/rules/motor'
import { registoSchema } from '@/domain/schema/registo'

export interface EstadoRegisto {
  erros: number
  avisos: number
  /** Mensagens concretas do que falta, para o bloco de atenção. */
  mensagens: string[]
}

export const ESTADO_VAZIO: EstadoRegisto = { erros: 0, avisos: 0, mensagens: [] }

/**
 * Erros/avisos por registo, combinando as regras de negócio declarativas
 * com os campos obrigatórios do schema Zod (ex.: registos importados do
 * template antigo). Partilhado entre a lista de registos e a vista do
 * gestor de projeto — nenhuma das duas duplica o cálculo.
 */
export function calcularEstadoPorRegisto(ficheiro: FicheiroRat): Map<string, EstadoRegisto> {
  const mapa = new Map<string, EstadoRegisto>()

  for (const ocorrencia of avaliarFicheiro(ficheiro)) {
    if (!ocorrencia.registoId) continue
    const atual = mapa.get(ocorrencia.registoId) ?? { erros: 0, avisos: 0, mensagens: [] }
    if (ocorrencia.severidade === 'erro') atual.erros += 1
    else atual.avisos += 1
    atual.mensagens.push(ocorrencia.mensagem)
    mapa.set(ocorrencia.registoId, atual)
  }

  for (const registo of ficheiro.registos) {
    const resultado = registoSchema.safeParse(registo)
    if (resultado.success) continue
    const atual = mapa.get(registo.id) ?? { erros: 0, avisos: 0, mensagens: [] }
    atual.erros += resultado.error.issues.length
    for (const problema of resultado.error.issues) {
      atual.mensagens.push(problema.message)
    }
    mapa.set(registo.id, atual)
  }

  return mapa
}
