import type { Registo } from '@/domain/schema/registo'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import { catalogoRegras } from '@/domain/rules/catalog'
import type { Ocorrencia, Regra } from '@/domain/rules/types'

/** Avalia apenas as regras de âmbito "registo" contra um único registo. */
export function avaliarRegisto(registo: Registo, catalogo: Regra[] = catalogoRegras): Ocorrencia[] {
  const ocorrencias: Ocorrencia[] = []
  for (const regra of catalogo) {
    if (regra.escopo !== 'registo') continue
    if (regra.verificar(registo)) continue
    ocorrencias.push({
      regraId: regra.id,
      severidade: regra.severidade,
      registoId: registo.id,
      campo: regra.campo,
      mensagem: typeof regra.mensagem === 'function' ? regra.mensagem(registo) : regra.mensagem,
    })
  }
  return ocorrencias
}

/** Avalia todas as regras (registo + ficheiro) contra um ficheiro RAT completo. */
export function avaliarFicheiro(
  ficheiro: FicheiroRat,
  catalogo: Regra[] = catalogoRegras,
): Ocorrencia[] {
  const ocorrenciasPorRegisto = ficheiro.registos.flatMap((registo) =>
    avaliarRegisto(registo, catalogo),
  )

  const ocorrenciasPorFicheiro = catalogo
    .filter((regra): regra is Extract<Regra, { escopo: 'ficheiro' }> => regra.escopo === 'ficheiro')
    .flatMap((regra) =>
      regra.avaliar(ficheiro).map(
        (oc): Ocorrencia => ({
          regraId: regra.id,
          severidade: regra.severidade,
          registoId: oc.registoId,
          campo: regra.campo,
          mensagem: oc.mensagem,
        }),
      ),
    )

  return [...ocorrenciasPorRegisto, ...ocorrenciasPorFicheiro]
}

export function temErros(ocorrencias: Ocorrencia[]): boolean {
  return ocorrencias.some((o) => o.severidade === 'erro')
}

/**
 * Um registo só pode ser submetido a validação quando não tem erros.
 * É aqui que a obrigatoriedade dos campos da especificação ganha efeito
 * prático — e o único sítio onde alguma coisa é bloqueada: guardar,
 * exportar e importar nunca dependem disto (CLAUDE.md §7).
 */
export function podeSubmeter(registo: Registo, catalogo: Regra[] = catalogoRegras): boolean {
  return !temErros(avaliarRegisto(registo, catalogo))
}

/** Erros por resolver antes de submeter, para mostrar ao GP. */
export function errosPorResolver(registo: Registo, catalogo: Regra[] = catalogoRegras): Ocorrencia[] {
  return avaliarRegisto(registo, catalogo).filter((o) => o.severidade === 'erro')
}
