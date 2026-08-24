import { obterAjudaCampo } from '@/domain/help/rat'
import { textos } from '@/i18n/pt'

interface AjudaCampoProps {
  campo: string
}

/**
 * Disclosure acessível (nativo, sem dependências) com a fundamentação
 * legal de um campo, quando exista em src/domain/help/rat.ts.
 */
export function AjudaCampo({ campo }: AjudaCampoProps) {
  const ajuda = obterAjudaCampo(campo)
  if (!ajuda) return null

  return (
    <details className="group mt-1 rounded-md border border-border bg-muted/40 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1 px-3 py-1.5 font-medium text-muted-foreground marker:content-none">
        <span aria-hidden="true">?</span>
        <span>{textos.formulario.ajudaLegal(ajuda.baseLegal)}</span>
      </summary>
      <p className="whitespace-pre-line px-3 pb-3 text-muted-foreground">{ajuda.texto}</p>
    </details>
  )
}
