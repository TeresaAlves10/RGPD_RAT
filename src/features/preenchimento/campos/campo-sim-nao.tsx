import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import { cn } from '@/lib/utils'

type Valor = string | undefined

interface CampoSimNaoProps {
  id: string
  label: string
  valor: Valor
  onChange: (valor: Valor) => void
  /** Acrescenta "Não sei" — só a pergunta sobre a CNPD o usa. */
  comNaoSei?: boolean
  obrigatorio?: boolean
  /** Dá peso visual à pergunta, para não passar despercebida. */
  destaque?: boolean
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
  comNaoSei,
  obrigatorio,
  destaque,
}: CampoSimNaoProps) {
  return (
    <div
      className={cn(
        'grid items-center gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_13rem]',
        destaque && 'rounded-md border border-primary-border bg-primary-soft p-3',
      )}
    >
      {/* O asterisco fica fora do <label>: dentro passaria a fazer parte
          do nome acessível do campo. */}
      <div className="flex items-baseline gap-1">
        <Label
          htmlFor={id}
          className={cn('text-sm leading-snug', destaque ? 'font-semibold' : 'font-normal')}
        >
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
        <option value="nao">{textos.respostas.nao}</option>
        <option value="nao_aplicavel">{textos.respostas.nao_aplicavel}</option>
        {comNaoSei ? <option value="nao_sei">{textos.respostas.nao_sei}</option> : null}
      </Select>
    </div>
  )
}
