import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CampoSimNao } from '@/features/preenchimento/campos/campo-sim-nao'
import { textos } from '@/i18n/pt'
import type { Subcontratado } from '@/domain/schema/responsavel'

interface CampoSubcontratadosProps {
  valor: Subcontratado[]
  onChange: (valor: Subcontratado[]) => void
}

/**
 * Secção "Subcontratados" do responsável: uma entrada por entidade, com as
 * perguntas do art. 28.º sobre cada uma.
 */
export function CampoSubcontratados({ valor, onChange }: CampoSubcontratadosProps) {
  function atualizar(indice: number, alteracoes: Partial<Subcontratado>) {
    onChange(valor.map((item, i) => (i === indice ? { ...item, ...alteracoes } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      {valor.length === 0 ? (
        <p className="text-sm text-muted-foreground">{textos.formulario.notaSubcontratados}</p>
      ) : null}

      {valor.map((item, indice) => (
        <div key={indice} className="flex flex-col gap-4 rounded-md border border-border p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`subcontratado-nome-${indice}`}>
              {textos.campos['subcontratado.nome']}
            </Label>
            <Input
              id={`subcontratado-nome-${indice}`}
              value={item.nome ?? ''}
              onChange={(e) => atualizar(indice, { nome: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`subcontratado-operacoes-${indice}`}>
              {textos.campos['subcontratado.operacoesTratamento']}
            </Label>
            <Textarea
              id={`subcontratado-operacoes-${indice}`}
              value={item.operacoesTratamento ?? ''}
              onChange={(e) => atualizar(indice, { operacoesTratamento: e.target.value })}
            />
          </div>

          <CampoSimNao
            id={`subcontratado-contrato-${indice}`}
            label={textos.campos['subcontratado.existeContrato']}
            valor={item.existeContrato}
            onChange={(v) => atualizar(indice, { existeContrato: v as Subcontratado['existeContrato'] })}
          />
          <CampoSimNao
            id={`subcontratado-clausulas-${indice}`}
            label={textos.campos['subcontratado.contratoComClausulasProtecaoDados']}
            valor={item.contratoComClausulasProtecaoDados}
            onChange={(v) =>
              atualizar(indice, {
                contratoComClausulasProtecaoDados:
                  v as Subcontratado['contratoComClausulasProtecaoDados'],
              })
            }
          />
          <CampoSimNao
            id={`subcontratado-transferencias-${indice}`}
            label={textos.campos['subcontratado.transferenciasPaisesTerceiros']}
            valor={item.transferenciasPaisesTerceiros}
            onChange={(v) =>
              atualizar(indice, {
                transferenciasPaisesTerceiros: v as Subcontratado['transferenciasPaisesTerceiros'],
              })
            }
          />
          <CampoSimNao
            id={`subcontratado-auditorias-${indice}`}
            label={textos.campos['subcontratado.auditoriasAoSubcontratado']}
            valor={item.auditoriasAoSubcontratado}
            onChange={(v) =>
              atualizar(indice, {
                auditoriasAoSubcontratado: v as Subcontratado['auditoriasAoSubcontratado'],
              })
            }
          />
          <CampoSimNao
            id={`subcontratado-cnpd-${indice}`}
            label={textos.campos['subcontratado.pedidoAutorizacaoCnpd']}
            valor={item.pedidoAutorizacaoCnpd}
            onChange={(v) =>
              atualizar(indice, {
                pedidoAutorizacaoCnpd: v as Subcontratado['pedidoAutorizacaoCnpd'],
              })
            }
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onChange(valor.filter((_, i) => i !== indice))}
          >
            {textos.formulario.remover}
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" className="self-start" onClick={() => onChange([...valor, {}])}>
        {textos.formulario.adicionar}
      </Button>
    </div>
  )
}
