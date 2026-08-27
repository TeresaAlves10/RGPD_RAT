import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'

interface CampoEscalaProps {
  id: string
  label: string
  valor: string | undefined
  onChange: (valor: string | undefined) => void
  obrigatorio?: boolean
}

/**
 * Escala de grandeza das contagens (campos, volume, utilizadores). O
 * utilizador preferiu ordens de grandeza a números exatos: um número
 * exato envelhece no dia seguinte, a ordem de grandeza não.
 */
export function CampoEscala({ id, label, valor, onChange, obrigatorio }: CampoEscalaProps) {
  return (
    <div className="grid items-center gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_15rem]">
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
        <option value="">{textos.escala.porResponder}</option>
        <option value="baixo">{textos.escala.baixo}</option>
        <option value="medio">{textos.escala.medio}</option>
        <option value="elevado">{textos.escala.elevado}</option>
      </Select>
    </div>
  )
}
