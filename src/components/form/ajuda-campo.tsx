import { useState } from 'react'
import { obterAjudaCampo } from '@/domain/help/rat'
import { textos } from '@/i18n/pt'

interface AjudaCampoProps {
  campo: string
}

/**
 * Acima deste número de caracteres o texto legal é recolhido por omissão.
 * Mantém-se curto de propósito: a nota tem de caber ao lado do campo sem
 * esticar a linha da grelha e afastar os campos uns dos outros.
 */
const LIMITE_TEXTO_CURTO = 165

/**
 * Fundamentação legal do campo, apresentada como nota de margem sempre
 * visível (CLAUDE.md §4) — não como um popover escondido atrás de um "?".
 * Textos longos mostram o início e expandem a pedido.
 */
export function AjudaCampo({ campo }: AjudaCampoProps) {
  const ajuda = obterAjudaCampo(campo)
  const [expandido, setExpandido] = useState(false)

  if (!ajuda) return null

  const ehLongo = ajuda.texto.length > LIMITE_TEXTO_CURTO
  const mostraTudo = expandido || !ehLongo

  return (
    <aside className="border-t-2 border-primary pt-3 text-sm">
      <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
        {ajuda.baseLegal}
      </p>
      <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
        {mostraTudo ? ajuda.texto : `${ajuda.texto.slice(0, LIMITE_TEXTO_CURTO).trimEnd()}…`}
      </p>
      {ehLongo ? (
        <button
          type="button"
          onClick={() => setExpandido((atual) => !atual)}
          className="mt-2 rounded text-xs font-medium text-primary hover:text-primary-strong hover:underline"
        >
          {expandido ? textos.formulario.ajudaVerMenos : textos.formulario.ajudaVerTudo}
        </button>
      ) : null}
    </aside>
  )
}
