import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { textos } from '@/i18n/pt'
import type { ItemVocabulario } from '@/domain/schema/vocabularios'

interface SeletorMultiploProps {
  name: string
  opcoes: ItemVocabulario[]
  valor: string[]
  onChange: (valor: string[]) => void
  valorOutro?: string
  onChangeOutro?: (valor: string) => void
}

/** Grupo de checkboxes para vocabulários controlados, com "Outro" opcional. */
export function SeletorMultiplo({
  name,
  opcoes,
  valor,
  onChange,
  valorOutro,
  onChangeOutro,
}: SeletorMultiploProps) {
  function alternar(id: string, marcado: boolean) {
    onChange(marcado ? [...valor, id] : valor.filter((v) => v !== id))
  }

  const temOutro = valor.includes('outro')

  return (
    <div className="flex flex-col gap-2">
      {opcoes.map((opcao) => (
        <label key={opcao.id} className="flex items-center gap-2 text-sm">
          <Checkbox
            name={`${name}.${opcao.id}`}
            checked={valor.includes(opcao.id)}
            onChange={(e) => alternar(opcao.id, e.target.checked)}
          />
          {opcao.label}
        </label>
      ))}
      {temOutro && onChangeOutro ? (
        <Input
          aria-label={textos.formulario.outroEspecificar}
          placeholder={textos.formulario.outroEspecificar}
          value={valorOutro ?? ''}
          onChange={(e) => onChangeOutro(e.target.value)}
        />
      ) : null}
    </div>
  )
}
