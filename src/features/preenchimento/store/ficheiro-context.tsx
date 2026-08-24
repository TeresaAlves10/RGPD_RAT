import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FicheiroRat, MetadadosEquipa } from '@/domain/schema/ficheiro'
import { SCHEMA_VERSION_ATUAL } from '@/domain/schema/ficheiro'
import type { Registo } from '@/domain/schema/registo'

function agoraIso(): string {
  return new Date().toISOString()
}

export function criarFicheiroVazio(): FicheiroRat {
  const agora = agoraIso()
  return {
    schemaVersion: SCHEMA_VERSION_ATUAL,
    metadados: { equipa: '', dataCriacao: agora, dataUltimaEdicao: agora },
    registos: [],
  }
}

interface FicheiroContextValue {
  ficheiro: FicheiroRat
  definirFicheiro: (ficheiro: FicheiroRat) => void
  definirMetadados: (metadados: Partial<Omit<MetadadosEquipa, 'dataCriacao' | 'dataUltimaEdicao'>>) => void
  guardarRegisto: (registo: Registo) => void
  adicionarRegistos: (registos: Registo[]) => void
  removerRegisto: (id: string) => void
  reiniciarFicheiro: () => void
}

const FicheiroContext = createContext<FicheiroContextValue | null>(null)

interface FicheiroProviderProps {
  ficheiroInicial?: FicheiroRat
  children: ReactNode
}

export function FicheiroProvider({ ficheiroInicial, children }: FicheiroProviderProps) {
  const [ficheiro, setFicheiro] = useState<FicheiroRat>(ficheiroInicial ?? criarFicheiroVazio())

  const definirFicheiro = useCallback((novo: FicheiroRat) => setFicheiro(novo), [])

  const definirMetadados = useCallback<FicheiroContextValue['definirMetadados']>((metadados) => {
    setFicheiro((atual) => ({
      ...atual,
      metadados: { ...atual.metadados, ...metadados, dataUltimaEdicao: agoraIso() },
    }))
  }, [])

  const guardarRegisto = useCallback((registo: Registo) => {
    setFicheiro((atual) => {
      const existe = atual.registos.some((r) => r.id === registo.id)
      const registos = existe
        ? atual.registos.map((r) => (r.id === registo.id ? registo : r))
        : [...atual.registos, registo]
      return { ...atual, registos, metadados: { ...atual.metadados, dataUltimaEdicao: agoraIso() } }
    })
  }, [])

  const adicionarRegistos = useCallback((novosRegistos: Registo[]) => {
    setFicheiro((atual) => ({
      ...atual,
      registos: [...atual.registos, ...novosRegistos],
      metadados: { ...atual.metadados, dataUltimaEdicao: agoraIso() },
    }))
  }, [])

  const removerRegisto = useCallback((id: string) => {
    setFicheiro((atual) => ({
      ...atual,
      registos: atual.registos.filter((r) => r.id !== id),
      metadados: { ...atual.metadados, dataUltimaEdicao: agoraIso() },
    }))
  }, [])

  const reiniciarFicheiro = useCallback(() => setFicheiro(criarFicheiroVazio()), [])

  const valor = useMemo<FicheiroContextValue>(
    () => ({
      ficheiro,
      definirFicheiro,
      definirMetadados,
      guardarRegisto,
      adicionarRegistos,
      removerRegisto,
      reiniciarFicheiro,
    }),
    [ficheiro, definirFicheiro, definirMetadados, guardarRegisto, adicionarRegistos, removerRegisto, reiniciarFicheiro],
  )

  return <FicheiroContext.Provider value={valor}>{children}</FicheiroContext.Provider>
}

export function useFicheiro(): FicheiroContextValue {
  const contexto = useContext(FicheiroContext)
  if (!contexto) {
    throw new Error('useFicheiro tem de ser usado dentro de um FicheiroProvider')
  }
  return contexto
}
