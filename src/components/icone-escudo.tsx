const tracoBase = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/**
 * Escudo — o mesmo motivo usado junto do nome da app na barra lateral.
 * Ícone simples, para contextos pequenos (navegação, rótulos).
 */
export function IconeEscudo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...tracoBase} aria-hidden="true" className={className}>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z" />
    </svg>
  )
}

/**
 * Escudo com cadeado — a mesma silhueta, com o detalhe do cadeado à vista.
 * Reservado a contextos maiores (estados vazios, ilustrações), onde o
 * detalhe extra não se perde. Sem recorrer a ilustrações externas
 * (CLAUDE.md §2.1: nada de CDN, tudo self-hosted).
 */
export function IconeEscudoCadeado({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...tracoBase} aria-hidden="true" className={className}>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z" />
      <path d="M9.25 12.4v-1.65a2.75 2.75 0 0 1 5.5 0v1.65" />
      <rect x="8.75" y="12.4" width="6.5" height="4.6" rx="1" />
    </svg>
  )
}
