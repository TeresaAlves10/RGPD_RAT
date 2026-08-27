import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CampoSimNao } from '@/features/preenchimento/campos/campo-sim-nao'
import { textos } from '@/i18n/pt'
import type { SubcontratadoMatriz } from '@/domain/schema/matriz'

interface CampoSubcontratadosMatrizProps {
  valor: SubcontratadoMatriz[]
  onChange: (valor: SubcontratadoMatriz[]) => void
}

const PERGUNTAS = [
  'existeContrato',
  'contratoComClausulasProtecaoDados',
  'transferenciasPaisesTerceiros',
  'auditoriasAoSubcontratado',
  'pedidoAutorizacaoCnpd',
] as const

/** Secção "Subcontratados" da matriz: uma entrada por entidade. */
export function CampoSubcontratadosMatriz({ valor, onChange }: CampoSubcontratadosMatrizProps) {
  function atualizar(indice: number, alteracao: Partial<SubcontratadoMatriz>) {
    onChange(valor.map((item, i) => (i === indice ? { ...item, ...alteracao } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      {valor.length === 0 ? (
        <p className="text-sm text-muted-foreground">{textos.matriz.semSubcontratados}</p>
      ) : null}

      {valor.map((item, indice) => (
        <div key={indice} className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`sub-matriz-nome-${indice}`}>{textos.matriz.campos.subcontratadoNome}</Label>
            <Input
              id={`sub-matriz-nome-${indice}`}
              value={item.nome ?? ''}
              onChange={(e) => atualizar(indice, { nome: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`sub-matriz-op-${indice}`}>
              {textos.matriz.campos.subcontratadoOperacoes}
            </Label>
            <Textarea
              id={`sub-matriz-op-${indice}`}
              value={item.operacoesTratamento ?? ''}
              onChange={(e) => atualizar(indice, { operacoesTratamento: e.target.value })}
            />
          </div>

          {PERGUNTAS.map((chave) => (
            <CampoSimNao
              key={chave}
              id={`sub-matriz-${chave}-${indice}`}
              label={textos.matriz.campos[chave]}
              valor={item[chave]}
              onChange={(v) => atualizar(indice, { [chave]: v } as Partial<SubcontratadoMatriz>)}
            />
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => onChange(valor.filter((_, i) => i !== indice))}
          >
            {textos.formulario.remover}
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" className="self-start" onClick={() => onChange([...valor, {}])}>
        {textos.matriz.adicionarSubcontratado}
      </Button>
    </div>
  )
}
