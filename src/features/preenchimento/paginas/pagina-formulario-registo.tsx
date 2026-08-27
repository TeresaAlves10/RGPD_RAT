import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { WizardResponsavel } from '@/features/preenchimento/wizard-responsavel'
import { WizardSubcontratado } from '@/features/preenchimento/wizard-subcontratado'
import { textos } from '@/i18n/pt'
import type { Registo } from '@/domain/schema/registo'

interface MolduraProps {
  etiqueta: string
  titulo: string
  /** Só existe depois do registo estar guardado (tem id na rota). */
  idRegisto?: string
  temAvaliacao?: boolean
  /**
   * Só o subcontratante usa o módulo à parte: no responsável, as perguntas
   * de controlo são secções do próprio formulário.
   */
  mostrarAvaliacao?: boolean
  children: ReactNode
}

function Moldura({ etiqueta, titulo, idRegisto, temAvaliacao, mostrarAvaliacao, children }: MolduraProps) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {etiqueta}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        </div>
        {idRegisto && mostrarAvaliacao ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="no-print"
            onClick={() => navigate(`/registos/${idRegisto}/avaliacao`)}
          >
            {temAvaliacao ? textos.avaliacao.tituloNav : textos.avaliacao.ativar}
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** Página do wizard: cria um registo novo (via /registos/novo/:tipo) ou edita um existente (via /registos/:id/editar). */
export function PaginaFormularioRegisto() {
  const { tipo, id } = useParams<{ tipo?: string; id?: string }>()
  const navigate = useNavigate()
  const { ficheiro, guardarRegisto } = useFicheiro()

  const registoExistente: Registo | undefined = id
    ? ficheiro.registos.find((r) => r.id === id)
    : undefined

  const tipoRegisto = registoExistente?.tipoRegisto ?? tipo
  const titulo = registoExistente?.nomeTratamento?.trim() || textos.navegacao.novoRegisto

  function aoGuardar(registo: Registo) {
    guardarRegisto(registo)
    navigate('/')
  }

  function aoCancelar() {
    navigate('/')
  }

  if (tipoRegisto === 'responsavel') {
    return (
      <Moldura
        etiqueta={textos.escolhaTipo.responsavelEtiqueta}
        titulo={titulo}
        idRegisto={registoExistente?.id}
        temAvaliacao={Boolean(registoExistente?.avaliacao)}
      >
        <WizardResponsavel
          registoInicial={
            registoExistente?.tipoRegisto === 'responsavel' ? registoExistente : undefined
          }
          onGuardar={aoGuardar}
          onCancelar={aoCancelar}
        />
      </Moldura>
    )
  }

  if (tipoRegisto === 'subcontratado') {
    return (
      <Moldura
        etiqueta={textos.escolhaTipo.subcontratadoEtiqueta}
        titulo={titulo}
        idRegisto={registoExistente?.id}
        temAvaliacao={Boolean(registoExistente?.avaliacao)}
        mostrarAvaliacao
      >
        <WizardSubcontratado
          registoInicial={
            registoExistente?.tipoRegisto === 'subcontratado' ? registoExistente : undefined
          }
          onGuardar={aoGuardar}
          onCancelar={aoCancelar}
        />
      </Moldura>
    )
  }

  return null
}
