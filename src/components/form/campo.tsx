import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { AjudaCampo } from '@/components/form/ajuda-campo'

interface CampoProps {
  id: string
  label: string
  erro?: string
  obrigatorio?: boolean
  ajuda?: string
  children: ReactNode
}

/** Envelope de campo de formulário: label, controlo, erro e ajuda contextual. */
export function Campo({ id, label, erro, obrigatorio, ajuda, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {obrigatorio ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </div>
      {children}
      {erro ? (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      {ajuda ? <AjudaCampo campo={ajuda} /> : null}
    </div>
  )
}
