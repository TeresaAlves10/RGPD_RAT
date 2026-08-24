import { useState } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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

function Cabecalho() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <div>
          <h1 className="text-base font-semibold">{textos.app.titulo}</h1>
          <p className="text-xs text-muted-foreground">{textos.app.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">{textos.navegacao.listaRegistos}</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/validacao">{textos.validador.tituloNav}</Link>
          </Button>
          <Button
            variant="outline"
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
      </div>
    </header>
  )
}

function ConteudoApp() {
  const { ficheiro } = useFicheiro()
  useGuardarRascunhoAutomatico(ficheiro, true)

  return (
    <div className="min-h-svh">
      <Cabecalho />
      <Routes>
        <Route path="/" element={<ListaRegistos />} />
        <Route path="/registos/novo" element={<EscolhaTipoRegisto />} />
        <Route path="/registos/novo/:tipo" element={<PaginaFormularioRegisto />} />
        <Route path="/registos/:id/editar" element={<PaginaFormularioRegisto />} />
        <Route path="/validacao" element={<ModoValidador />} />
      </Routes>
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
