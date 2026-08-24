import { useEffect, useRef } from 'react'
import type { FicheiroRat } from '@/domain/schema/ficheiro'
import { ficheiroRatSchema } from '@/domain/schema/ficheiro'

/**
 * Rascunho local (CLAUDE.md §6): único mecanismo de persistência de toda a
 * aplicação. Guarda o ficheiro em curso em localStorage, com debounce, sob
 * uma chave própria. Nunca é carregado silenciosamente — ver
 * RascunhoDialog, que pergunta explicitamente antes de o restaurar.
 */

const CHAVE_RASCUNHO = 'rgpd-rat:rascunho:v1'
const DEBOUNCE_MS = 1000

export interface RascunhoGuardado {
  guardadoEm: string
  ficheiro: FicheiroRat
}

export function lerRascunho(): RascunhoGuardado | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_RASCUNHO)
    if (!bruto) return null
    const dados = JSON.parse(bruto) as { guardadoEm?: unknown; ficheiro?: unknown }
    const ficheiroValidado = ficheiroRatSchema.safeParse(dados.ficheiro)
    if (!ficheiroValidado.success || typeof dados.guardadoEm !== 'string') return null
    return { guardadoEm: dados.guardadoEm, ficheiro: ficheiroValidado.data }
  } catch {
    return null
  }
}

export function guardarRascunho(ficheiro: FicheiroRat): void {
  try {
    const rascunho: RascunhoGuardado = { guardadoEm: new Date().toISOString(), ficheiro }
    window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho))
  } catch {
    // localStorage indisponível (modo privado, quota excedida, etc.) — o
    // rascunho é apenas uma conveniência, nunca bloqueia o preenchimento.
  }
}

export function limparRascunho(): void {
  try {
    window.localStorage.removeItem(CHAVE_RASCUNHO)
  } catch {
    // ver nota acima
  }
}

/** Guarda `ficheiro` em localStorage ~1s depois da última alteração. */
export function useGuardarRascunhoAutomatico(ficheiro: FicheiroRat, ativo: boolean): void {
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!ativo) return
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => guardarRascunho(ficheiro), DEBOUNCE_MS)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [ficheiro, ativo])
}
