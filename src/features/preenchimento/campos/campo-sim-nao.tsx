import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'

type Valor = string | undefined

interface CampoSimNaoProps {
  id: string
  label: string
  valor: Valor
  onChange: (valor: Valor) => void
  /** Acrescenta "Parcialmente" às opções (perguntas de maturidade). */
  comParcial?: boolean
}

/**
 * Pergunta de resposta fechada da matriz. Usa `undefined` para "por
 * responder" — nunca assume um "não" que ninguém deu.
 */
export function CampoSimNao({ id, label, valor, onChange, comParcial }: CampoSimNaoProps) {
  return (
    <div className="grid items-center gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_13rem]">
      <Label htmlFor={id} className="text-sm font-normal leading-snug">
        {label}
      </Label>
      <Select id={id} value={valor ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">{textos.matriz.respostas.porResponder}</option>
        <option value="sim">{textos.matriz.respostas.sim}</option>
        {comParcial ? <option value="parcial">{textos.avaliacao.respostas.parcial}</option> : null}
        <option value="nao">{textos.matriz.respostas.nao}</option>
        <option value="nao_aplicavel">{textos.matriz.respostas.nao_aplicavel}</option>
      </Select>
    </div>
  )
}
