import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { textos } from '@/i18n/pt'
import { categoriasDados } from '@/domain/schema/vocabularios'
import type { CategoriaDados } from '@/domain/schema/comum'

interface CampoCategoriasDadosProps {
  valor: CategoriaDados[]
  onChange: (valor: CategoriaDados[]) => void
}

export function CampoCategoriasDados({ valor, onChange }: CampoCategoriasDadosProps) {
  function adicionar() {
    onChange([...valor, { categoria: categoriasDados[0].id as CategoriaDados['categoria'], tipos: [] }])
  }

  function remover(indice: number) {
    onChange(valor.filter((_, i) => i !== indice))
  }

  function atualizar(indice: number, alteracoes: Partial<CategoriaDados>) {
    onChange(valor.map((item, i) => (i === indice ? { ...item, ...alteracoes } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      {valor.map((item, indice) => {
        const itemVocabulario = categoriasDados.find((c) => c.id === item.categoria)
        return (
          <div key={indice} className="flex flex-col gap-2 rounded-md border border-border p-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`categoria-dados-${indice}`}>{textos.campos['categoriaDados.categoria']}</Label>
              <Select
                id={`categoria-dados-${indice}`}
                value={item.categoria}
                onChange={(e) =>
                  atualizar(indice, { categoria: e.target.value as CategoriaDados['categoria'] })
                }
              >
                {categoriasDados.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.label}
                  </option>
                ))}
              </Select>
              {itemVocabulario && itemVocabulario.tipos.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Exemplos: {itemVocabulario.tipos.join(', ')}
                </p>
              ) : null}
            </div>

            {item.categoria === 'outro' ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`categoria-dados-outra-${indice}`}>
                  {textos.campos['categoriaDados.categoriaOutra']}
                </Label>
                <Input
                  id={`categoria-dados-outra-${indice}`}
                  value={item.categoriaOutra ?? ''}
                  onChange={(e) => atualizar(indice, { categoriaOutra: e.target.value })}
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`categoria-dados-tipos-${indice}`}>{textos.campos['categoriaDados.tipos']}</Label>
              <Textarea
                id={`categoria-dados-tipos-${indice}`}
                value={item.tipos.join('\n')}
                onChange={(e) =>
                  atualizar(indice, {
                    tipos: e.target.value.split('\n').map((t) => t.trim()).filter(Boolean),
                  })
                }
              />
            </div>

            <Button type="button" variant="outline" size="sm" onClick={() => remover(indice)}>
              {textos.formulario.remover}
            </Button>
          </div>
        )
      })}
      <Button type="button" variant="outline" onClick={adicionar}>
        {textos.formulario.adicionar}
      </Button>
    </div>
  )
}
