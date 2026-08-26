import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { AjudaCampo } from '@/components/form/ajuda-campo'
import { cn } from '@/lib/utils'

interface CampoProps {
  id: string
  label: string
  /** Frase de apoio em linguagem corrente, por baixo da etiqueta. */
  descricao?: string
  erro?: string
  obrigatorio?: boolean
  /** Id da entrada em src/domain/help/rat.ts, se houver fundamentação legal. */
  ajuda?: string
  children: ReactNode
}

/**
 * Envelope de campo. Quando o campo tem fundamentação legal, esta fica
 * numa coluna à direita, sempre visível (em ecrãs largos); em ecrãs
 * estreitos passa para baixo do campo.
 */
export function Campo({ id, label, descricao, erro, obrigatorio, ajuda, children }: CampoProps) {
  return (
    <div
      className={cn(
        'grid items-start gap-x-10 gap-y-3',
        ajuda ? 'lg:grid-cols-[minmax(0,1fr)_17rem]' : 'grid-cols-1',
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <Label htmlFor={id} className="text-[0.95rem]">
              {label}
            </Label>
            {obrigatorio ? (
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            ) : null}
          </div>
          {descricao ? <p className="text-sm text-muted-foreground">{descricao}</p> : null}
        </div>

        {children}

        {erro ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {erro}
          </p>
        ) : null}
      </div>

      {ajuda ? <AjudaCampo campo={ajuda} /> : null}
    </div>
  )
}
