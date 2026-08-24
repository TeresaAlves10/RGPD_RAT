import { useNavigate, useParams } from 'react-router-dom'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { WizardResponsavel } from '@/features/preenchimento/wizard-responsavel'
import { WizardSubcontratado } from '@/features/preenchimento/wizard-subcontratado'
import type { Registo } from '@/domain/schema/registo'

/** Página do wizard: cria um registo novo (via /registos/novo/:tipo) ou edita um existente (via /registos/:id/editar). */
export function PaginaFormularioRegisto() {
  const { tipo, id } = useParams<{ tipo?: string; id?: string }>()
  const navigate = useNavigate()
  const { ficheiro, guardarRegisto } = useFicheiro()

  const registoExistente: Registo | undefined = id
    ? ficheiro.registos.find((r) => r.id === id)
    : undefined

  const tipoRegisto = registoExistente?.tipoRegisto ?? tipo

  function aoGuardar(registo: Registo) {
    guardarRegisto(registo)
    navigate('/')
  }

  function aoCancelar() {
    navigate('/')
  }

  if (tipoRegisto === 'responsavel') {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <WizardResponsavel
          registoInicial={registoExistente?.tipoRegisto === 'responsavel' ? registoExistente : undefined}
          onGuardar={aoGuardar}
          onCancelar={aoCancelar}
        />
      </div>
    )
  }

  if (tipoRegisto === 'subcontratado') {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <WizardSubcontratado
          registoInicial={registoExistente?.tipoRegisto === 'subcontratado' ? registoExistente : undefined}
          onGuardar={aoGuardar}
          onCancelar={aoCancelar}
        />
      </div>
    )
  }

  return null
}
