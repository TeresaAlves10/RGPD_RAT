import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import type { RespostaControlo } from '@/domain/schema/avaliacao'

const OPCOES: RespostaControlo[] = ['sim', 'parcial', 'nao', 'nao_aplicavel']

interface CampoRespostaProps {
  id: string
  label: string
  valor: RespostaControlo | undefined
  onChange: (valor: RespostaControlo | undefined) => void
}

/** Pergunta de controlo com resposta fechada (sim / parcial / não / N/A). */
export function CampoResposta({ id, label, valor, onChange }: CampoRespostaProps) {
  return (
    <div className="grid items-center gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_13rem]">
      <Label htmlFor={id} className="text-sm font-normal leading-snug">
        {label}
      </Label>
      <Select
        id={id}
        value={valor ?? ''}
        onChange={(e) => onChange((e.target.value || undefined) as RespostaControlo | undefined)}
      >
        <option value="">{textos.avaliacao.respostas.porResponder}</option>
        {OPCOES.map((opcao) => (
          <option key={opcao} value={opcao}>
            {textos.avaliacao.respostas[opcao]}
          </option>
        ))}
      </Select>
    </div>
  )
}
