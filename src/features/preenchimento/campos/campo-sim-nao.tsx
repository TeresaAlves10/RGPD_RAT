import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'

type Valor = string | undefined

interface CampoSimNaoProps {
  id: string
  label: string
  valor: Valor
  onChange: (valor: Valor) => void
  /** Acrescenta "Parcialmente" — perguntas de capacidade/controlo. */
  comParcial?: boolean
  obrigatorio?: boolean
}

/**
 * Pergunta de resposta fechada. Usa `undefined` para "por responder" —
 * nunca assume um "não" que ninguém deu.
 */
export function CampoSimNao({
  id,
  label,
  valor,
  onChange,
  comParcial,
  obrigatorio,
}: CampoSimNaoProps) {
  return (
    <div className="grid items-center gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_13rem]">
      {/* O asterisco fica fora do <label>: dentro passaria a fazer parte
          do nome acessível do campo. */}
      <div className="flex items-baseline gap-1">
        <Label htmlFor={id} className="text-sm font-normal leading-snug">
          {label}
        </Label>
        {obrigatorio ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </div>
      <Select id={id} value={valor ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">{textos.respostas.porResponder}</option>
        <option value="sim">{textos.respostas.sim}</option>
        {comParcial ? <option value="parcial">{textos.respostas.parcial}</option> : null}
        <option value="nao">{textos.respostas.nao}</option>
        <option value="nao_aplicavel">{textos.respostas.nao_aplicavel}</option>
      </Select>
    </div>
  )
}
