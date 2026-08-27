import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import type { Contagem } from '@/domain/schema/comum'

interface CampoEscalaProps {
  id: string
  label: string
  valor: Contagem | undefined
  onChange: (valor: Contagem | undefined) => void
  obrigatorio?: boolean
}

/**
 * Contagem da secção "Ferramentas": ordem de grandeza mais um campo livre
 * para o número ou a nota exata.
 *
 * A escala sozinha envelhece bem mas perde precisão; o número sozinho
 * envelhece no dia seguinte. Guardam-se os dois — e é a escala que conta
 * para a validação, por isso é a que tem o asterisco.
 */
export function CampoEscala({ id, label, valor, onChange, obrigatorio }: CampoEscalaProps) {
  function atualizar(alteracoes: Partial<Contagem>) {
    const proximo = { ...valor, ...alteracoes }
    // Sem escala nem valor, o campo volta a "por responder".
    onChange(proximo.escala || proximo.valor ? proximo : undefined)
  }

  return (
    <div className="grid items-start gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_15rem]">
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
      <div className="flex flex-col gap-1.5">
        <Select
          id={id}
          value={valor?.escala ?? ''}
          onChange={(e) => atualizar({ escala: (e.target.value || undefined) as Contagem['escala'] })}
        >
          <option value="">{textos.escala.porResponder}</option>
          <option value="baixo">{textos.escala.baixo}</option>
          <option value="medio">{textos.escala.medio}</option>
          <option value="elevado">{textos.escala.elevado}</option>
        </Select>
        <Input
          id={`${id}-valor`}
          aria-label={`${label} — ${textos.escala.valorRotulo}`}
          placeholder={textos.escala.valorPlaceholder}
          value={valor?.valor ?? ''}
          onChange={(e) => atualizar({ valor: e.target.value || undefined })}
        />
      </div>
    </div>
  )
}
