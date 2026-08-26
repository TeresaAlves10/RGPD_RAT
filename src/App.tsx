import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BarraLateral } from '@/components/layout/barra-lateral'
import { textos } from '@/i18n/pt'
import {
  FicheiroProvider,
  useFicheiro,
} from '@/features/preenchimento/store/ficheiro-context'
import {
  lerRascunho,
  limparRascunho,
  useGuardarRascunhoAutomatico,
  type RascunhoGuardado,
} from '@/features/preenchimento/store/rascunho-local'
import { RascunhoDialog } from '@/features/preenchimento/rascunho-dialog'
import { ListaRegistos } from '@/features/preenchimento/paginas/lista-registos'
import { EscolhaTipoRegisto } from '@/features/preenchimento/paginas/escolha-tipo-registo'
import { PaginaFormularioRegisto } from '@/features/preenchimento/paginas/pagina-formulario-registo'
import { ModoValidador } from '@/features/validacao/paginas/modo-validador'
import { PaginaAjuda } from '@/features/ajuda/pagina-ajuda'

function BarraEstado() {
  return (
    <div className="no-print flex h-14 items-center justify-end gap-4 border-b border-border bg-card px-6">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        {textos.app.rascunhoGuardado}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (window.confirm(textos.rascunho.confirmarLimpeza)) {
            limparRascunho()
            window.location.reload()
          }
        }}
      >
        {textos.rascunho.botaoLimpar}
      </Button>
    </div>
  )
}

function ConteudoApp() {
  const { ficheiro } = useFicheiro()
  useGuardarRascunhoAutomatico(ficheiro, true)

  return (
    <div className="flex min-h-svh">
      <BarraLateral />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraEstado />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ListaRegistos />} />
            <Route path="/registos/novo" element={<EscolhaTipoRegisto />} />
            <Route path="/registos/novo/:tipo" element={<PaginaFormularioRegisto />} />
            <Route path="/registos/:id/editar" element={<PaginaFormularioRegisto />} />
            <Route path="/validacao" element={<ModoValidador />} />
            <Route path="/ajuda" element={<PaginaAjuda />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  const [rascunho] = useState<RascunhoGuardado | null>(() => lerRascunho())
  const [decisao, setDecisao] = useState<'pendente' | 'continuar' | 'novo'>(
    rascunho ? 'pendente' : 'novo',
  )

  if (rascunho && decisao === 'pendente') {
    return (
      <RascunhoDialog
        guardadoEm={rascunho.guardadoEm}
        onContinuar={() => setDecisao('continuar')}
        onComecarNovo={() => {
          limparRascunho()
          setDecisao('novo')
        }}
      />
    )
  }

  return (
    <HashRouter>
      <FicheiroProvider ficheiroInicial={decisao === 'continuar' && rascunho ? rascunho.ficheiro : undefined}>
        <ConteudoApp />
      </FicheiroProvider>
    </HashRouter>
  )
}

export default App
