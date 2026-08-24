import { useRef } from 'react'

interface PassosWizardProps {
  idBase: string
  titulos: readonly string[]
  passoAtual: number
  passosComErro: Set<number>
  onMudarPasso: (passo: number) => void
}

export function idPainelPasso(idBase: string, indice: number): string {
  return `${idBase}-painel-${indice}`
}

function idTabPasso(idBase: string, indice: number): string {
  return `${idBase}-tab-${indice}`
}

/**
 * Navegação por passos do wizard, com o padrão ARIA de tabs completo:
 * roving tabindex e navegação por setas do teclado (não só clique).
 */
export function PassosWizard({ idBase, titulos, passoAtual, passosComErro, onMudarPasso }: PassosWizardProps) {
  const refsBotoes = useRef<(HTMLButtonElement | null)[]>([])

  function focarEMudar(indice: number) {
    onMudarPasso(indice)
    refsBotoes.current[indice]?.focus()
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      focarEMudar((indice + 1) % titulos.length)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      focarEMudar((indice - 1 + titulos.length) % titulos.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focarEMudar(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focarEMudar(titulos.length - 1)
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Passos do formulário">
      {titulos.map((titulo, indice) => (
        <button
          key={titulo}
          ref={(el) => {
            refsBotoes.current[indice] = el
          }}
          type="button"
          role="tab"
          id={idTabPasso(idBase, indice)}
          aria-controls={idPainelPasso(idBase, indice)}
          aria-selected={passoAtual === indice}
          tabIndex={passoAtual === indice ? 0 : -1}
          onClick={() => onMudarPasso(indice)}
          onKeyDown={(e) => aoTeclar(e, indice)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            passoAtual === indice
              ? 'border-primary bg-primary text-primary-foreground'
              : passosComErro.has(indice)
                ? 'border-destructive text-destructive'
                : 'border-border text-muted-foreground'
          }`}
        >
          {indice + 1}. {titulo}
        </button>
      ))}
    </div>
  )
}
