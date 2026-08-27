import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import type { OutroSubcontratante } from '@/domain/schema/subcontratado'

interface CampoOutrosSubcontratantesProps {
  valor: OutroSubcontratante[]
  onChange: (valor: OutroSubcontratante[]) => void
}

export function CampoOutrosSubcontratantes({ valor, onChange }: CampoOutrosSubcontratantesProps) {
  function adicionar() {
    onChange([...valor, {}])
  }

  function remover(indice: number) {
    onChange(valor.filter((_, i) => i !== indice))
  }

  function atualizar(indice: number, alteracoes: Partial<OutroSubcontratante>) {
    onChange(valor.map((item, i) => (i === indice ? { ...item, ...alteracoes } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      {valor.map((item, indice) => (
        <div key={indice} className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`subcontratante-nome-${indice}`}>{textos.campos['outroSubcontratante.nome']}</Label>
            <Input
              id={`subcontratante-nome-${indice}`}
              value={item.nome ?? ''}
              onChange={(e) => atualizar(indice, { nome: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`subcontratante-contacto-${indice}`}>
              {textos.campos['outroSubcontratante.contacto']}
            </Label>
            <Input
              id={`subcontratante-contacto-${indice}`}
              value={item.contacto ?? ''}
              onChange={(e) => atualizar(indice, { contacto: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`subcontratante-data-${indice}`}>
              {textos.campos['outroSubcontratante.dataContrato']}
            </Label>
            <Input
              id={`subcontratante-data-${indice}`}
              placeholder="AAAA-MM-DD"
              value={item.dataContrato ?? ''}
              onChange={(e) => atualizar(indice, { dataContrato: e.target.value })}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => remover(indice)}>
            {textos.formulario.remover}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={adicionar}>
        {textos.formulario.adicionar}
      </Button>
    </div>
  )
}
