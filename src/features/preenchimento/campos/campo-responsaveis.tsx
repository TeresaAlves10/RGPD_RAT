import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import type { ResponsavelPorConta } from '@/domain/schema/subcontratado'

interface CampoResponsaveisProps {
  valor: ResponsavelPorConta[]
  onChange: (valor: ResponsavelPorConta[]) => void
}

export function CampoResponsaveis({ valor, onChange }: CampoResponsaveisProps) {
  function adicionar() {
    onChange([...valor, { nome: '', categoriasTratamento: '' }])
  }

  function remover(indice: number) {
    onChange(valor.filter((_, i) => i !== indice))
  }

  function atualizar(indice: number, alteracoes: Partial<ResponsavelPorConta>) {
    onChange(valor.map((item, i) => (i === indice ? { ...item, ...alteracoes } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      {valor.map((item, indice) => (
        <div key={indice} className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`responsavel-nome-${indice}`}>{textos.campos['responsaveis.nome']}</Label>
            <Input
              id={`responsavel-nome-${indice}`}
              value={item.nome}
              onChange={(e) => atualizar(indice, { nome: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`responsavel-contacto-${indice}`}>{textos.campos['responsaveis.contacto']}</Label>
            <Input
              id={`responsavel-contacto-${indice}`}
              value={item.contacto ?? ''}
              onChange={(e) => atualizar(indice, { contacto: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`responsavel-categorias-${indice}`}>
              {textos.campos['responsaveis.categoriasTratamento']}
            </Label>
            <Textarea
              id={`responsavel-categorias-${indice}`}
              value={item.categoriasTratamento}
              onChange={(e) => atualizar(indice, { categoriasTratamento: e.target.value })}
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
