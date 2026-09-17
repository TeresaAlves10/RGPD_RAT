import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { calcularEstadoPorRegisto } from '@/features/preenchimento/estado-por-registo'
import { TabelaRegistos } from '@/features/preenchimento/tabela-registos'

/**
 * Vista do gestor de projeto: pesquisa os próprios registos pelo nome e
 * edita-os a qualquer momento — sem contas nem sessão. Não é uma vista
 * "autenticada": é o mesmo ficheiro deste browser, só filtrado pelo nome
 * em `gestorProjeto.nome` (CLAUDE.md §2.8, sem noção de utilizador).
 */
export function GestorProjeto() {
  const navigate = useNavigate()
  const { ficheiro } = useFicheiro()
  const [nome, setNome] = useState('')

  const estadoPorRegisto = useMemo(() => calcularEstadoPorRegisto(ficheiro), [ficheiro])

  const termo = nome.trim().toLowerCase()
  const registosDoGestor = useMemo(() => {
    if (!termo) return []
    return ficheiro.registos.filter((registo) =>
      registo.gestorProjeto.nome.toLowerCase().includes(termo),
    )
  }, [ficheiro.registos, termo])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{textos.gestorProjeto.titulo}</h1>
        <p className="text-sm text-muted-foreground">{textos.gestorProjeto.descricao}</p>
      </div>

      <div className="flex max-w-sm flex-col gap-1.5">
        <Label htmlFor="gestor-projeto-nome">{textos.gestorProjeto.campoNome}</Label>
        <Input
          id="gestor-projeto-nome"
          type="search"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={textos.gestorProjeto.placeholderNome}
          autoFocus
        />
      </div>

      {!termo ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-sm text-muted-foreground">{textos.gestorProjeto.semNome}</p>
          </CardContent>
        </Card>
      ) : registosDoGestor.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {textos.gestorProjeto.semResultados(nome.trim())}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {textos.gestorProjeto.resultados(registosDoGestor.length)}
          </p>
          <TabelaRegistos
            registos={registosDoGestor}
            estadoPorRegisto={estadoPorRegisto}
            onEditar={(id) => navigate(`/registos/${id}/editar`)}
          />
        </>
      )}
    </div>
  )
}
