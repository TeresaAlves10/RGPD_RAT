import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { WizardResponsavel } from '@/features/preenchimento/wizard-responsavel'
import { WizardSubcontratado } from '@/features/preenchimento/wizard-subcontratado'
import { textos } from '@/i18n/pt'
import type { Registo } from '@/domain/schema/registo'

interface MolduraProps {
  etiqueta: string
  titulo: string
  children: ReactNode
}

function Moldura({ etiqueta, titulo, children }: MolduraProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {etiqueta}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        </div>
      </div>
      {children}
    </div>
  )
}

/** Cria um registo novo (/registos/novo/:tipo) ou edita um existente (/registos/:id/editar). */
export function PaginaFormularioRegisto() {
  const { tipo, id } = useParams<{ tipo?: string; id?: string }>()
  const navigate = useNavigate()
  const { ficheiro, guardarRegisto } = useFicheiro()

  const registoExistente: Registo | undefined = id
    ? ficheiro.registos.find((r) => r.id === id)
    : undefined

  // Numeração automática: o próximo número livre dentro deste ficheiro.
  const proximoNumero =
    ficheiro.registos.reduce((maior, r) => Math.max(maior, r.numero), 0) + 1

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
      <Moldura etiqueta={textos.escolhaTipo.responsavelEtiqueta} titulo={titulo}>
        <WizardResponsavel
          registoInicial={
            registoExistente?.tipoRegisto === 'responsavel' ? registoExistente : undefined
          }
          proximoNumero={proximoNumero}
          onGuardar={aoGuardar}
          onCancelar={aoCancelar}
        />
      </Moldura>
    )
  }

  if (tipoRegisto === 'subcontratado') {
    return (
      <Moldura etiqueta={textos.escolhaTipo.subcontratadoEtiqueta} titulo={titulo}>
        <WizardSubcontratado
          registoInicial={
            registoExistente?.tipoRegisto === 'subcontratado' ? registoExistente : undefined
          }
          proximoNumero={proximoNumero}
          onGuardar={aoGuardar}
          onCancelar={aoCancelar}
        />
      </Moldura>
    )
  }

  return null
}
