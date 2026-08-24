import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { textos } from '@/i18n/pt'
import { medidasTecnicasOrganizativas, type ItemMedidaTecnicaOrganizativa } from '@/domain/schema/vocabularios'
import type { MedidaTecnicaOrganizativa } from '@/domain/schema/comum'

interface CampoMedidasProps {
  valor: MedidaTecnicaOrganizativa[]
  onChange: (valor: MedidaTecnicaOrganizativa[]) => void
}

function agrupar(itens: ItemMedidaTecnicaOrganizativa[]) {
  return {
    tecnicas: itens.filter((i) => i.tipo === 'tecnica'),
    organizativas: itens.filter((i) => i.tipo === 'organizativa'),
  }
}

export function CampoMedidas({ valor, onChange }: CampoMedidasProps) {
  const { tecnicas, organizativas } = agrupar(medidasTecnicasOrganizativas)

  function estaSelecionada(id: string) {
    return valor.some((m) => m.medida === id)
  }

  function alternar(id: string, marcada: boolean) {
    if (marcada) {
      onChange([...valor, { medida: id as MedidaTecnicaOrganizativa['medida'] }])
    } else {
      onChange(valor.filter((m) => m.medida !== id))
    }
  }

  function alterarOutro(texto: string) {
    onChange(valor.map((m) => (m.medida === 'outro' ? { ...m, medidaOutra: texto } : m)))
  }

  const outroSelecionado = valor.find((m) => m.medida === 'outro')

  function grupo(titulo: string, itens: ItemMedidaTecnicaOrganizativa[]) {
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{titulo}</legend>
        {itens.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={estaSelecionada(item.id)}
              onChange={(e) => alternar(item.id, e.target.checked)}
            />
            {item.label}
          </label>
        ))}
      </fieldset>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {grupo('Técnicas', tecnicas)}
      {grupo('Organizativas', organizativas)}
      {outroSelecionado ? (
        <Input
          aria-label={textos.formulario.outroEspecificar}
          placeholder={textos.formulario.outroEspecificar}
          value={outroSelecionado.medidaOutra ?? ''}
          onChange={(e) => alterarOutro(e.target.value)}
        />
      ) : null}
    </div>
  )
}
