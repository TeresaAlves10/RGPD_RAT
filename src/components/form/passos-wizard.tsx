import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { textos } from '@/i18n/pt'

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
 * Navegação por secções do wizard, em coluna, com o padrão ARIA de tabs
 * completo: roving tabindex e navegação por setas do teclado.
 */
export function PassosWizard({
  idBase,
  titulos,
  passoAtual,
  passosComErro,
  onMudarPasso,
}: PassosWizardProps) {
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
    <div
      className="no-print flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible"
      role="tablist"
      aria-orientation="vertical"
      aria-label={textos.formulario.passosAria}
    >
      <p className="hidden pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
        {textos.formulario.seccoes}
      </p>

      {titulos.map((titulo, indice) => {
        const ativo = passoAtual === indice
        const comErro = passosComErro.has(indice)
        return (
          <button
            key={titulo}
            ref={(el) => {
              refsBotoes.current[indice] = el
            }}
            type="button"
            role="tab"
            id={idTabPasso(idBase, indice)}
            aria-controls={idPainelPasso(idBase, indice)}
            aria-selected={ativo}
            tabIndex={ativo ? 0 : -1}
            onClick={() => onMudarPasso(indice)}
            onKeyDown={(e) => aoTeclar(e, indice)}
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors lg:w-full',
              ativo
                ? 'bg-primary-soft font-semibold text-primary-strong'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
                ativo
                  ? 'bg-primary text-primary-foreground'
                  : comErro
                    ? 'bg-destructive-soft text-destructive'
                    : 'border border-border text-muted-foreground',
              )}
            >
              {indice + 1}
            </span>
            <span className="whitespace-nowrap lg:whitespace-normal">{titulo}</span>
            {comErro ? (
              <span className="ml-auto hidden text-xs font-medium text-destructive lg:inline">
                {textos.formulario.porRever}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
