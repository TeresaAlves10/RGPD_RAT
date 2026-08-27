import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { textos } from '@/i18n/pt'
import { LOGO, NOME_ORGANIZACAO } from '@/config/organizacao'

interface ItemNavegacao {
  para: string
  texto: string
  icone: ReactNode
  exato?: boolean
}

const traco = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const ITENS: ItemNavegacao[] = [
  {
    para: '/',
    texto: textos.navegacao.listaRegistos,
    exato: true,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    para: '/registos/novo',
    texto: textos.navegacao.novoRegisto,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M12 12v5M9.5 14.5h5" />
      </svg>
    ),
  },
  {
    para: '/validacao',
    texto: textos.validador.tituloNav,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    ),
  },
  {
    para: '/ajuda',
    texto: textos.navegacao.ajuda,
    icone: (
      <svg viewBox="0 0 24 24" {...traco} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7" />
        <path d="M12 17.5h.01" />
      </svg>
    ),
  },
]

export function BarraLateral() {
  return (
    <aside className="no-print flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <Link
        to="/"
        className="flex flex-col gap-2 border-b border-sidebar-border px-5 py-5"
      >
        {/* O logótipo é servido do próprio bundle (public/), nunca de uma
            CDN. Enquanto não existir, mostra-se só o nome. */}
        {LOGO ? (
          <img src={LOGO} alt={NOME_ORGANIZACAO} className="h-8 w-auto self-start" />
        ) : (
          <span className="text-[0.95rem] font-semibold">{NOME_ORGANIZACAO}</span>
        )}
        <span className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
          <svg viewBox="0 0 24 24" {...traco} className="h-4 w-4 shrink-0" aria-hidden="true">
            <path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z" />
          </svg>
          {textos.app.marca} · RGPD
        </span>
      </Link>

      <nav className="flex flex-col gap-1 p-3" aria-label={textos.navegacao.principal}>
        {ITENS.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.exato}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active text-sidebar-foreground'
                  : 'text-sidebar-muted hover:bg-sidebar-active/50 hover:text-sidebar-foreground',
              )
            }
          >
            <span className="h-[18px] w-[18px] shrink-0">{item.icone}</span>
            {item.texto}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-sidebar-border px-5 py-4">
        <p className="text-xs leading-relaxed text-sidebar-muted">{textos.app.rodape}</p>
      </div>
    </aside>
  )
}
