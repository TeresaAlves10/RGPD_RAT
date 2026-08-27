import { textos } from '@/i18n/pt'
import type { Registo } from '@/domain/schema/registo'

interface PainelTotaisProps {
  registos: Registo[]
}

interface Total {
  rotulo: string
  valor: number
  descricao: string
}

/**
 * Totais do ficheiro aberto no browser.
 *
 * Não é um dashboard agregado persistente (CLAUDE.md §2.8): não há
 * servidor nem base de dados por trás — são contagens sobre os registos
 * que estão neste momento em memória, e desaparecem quando se fecha a
 * aplicação. É a leitura rápida de um ficheiro, não um painel de gestão.
 */
export function PainelTotais({ registos }: PainelTotaisProps) {
  const totais: Total[] = [
    {
      rotulo: textos.totais.total,
      valor: registos.length,
      descricao: textos.totais.totalDescricao,
    },
    {
      rotulo: textos.totais.responsavel,
      valor: registos.filter((r) => r.tipoRegisto === 'responsavel').length,
      descricao: textos.totais.responsavelDescricao,
    },
    {
      rotulo: textos.totais.subcontratante,
      valor: registos.filter((r) => r.tipoRegisto === 'subcontratado').length,
      descricao: textos.totais.subcontratanteDescricao,
    },
    {
      // "Em validação" é tudo o que já saiu das mãos do GP e ainda não
      // está validado: submetido, ou devolvido para correção.
      rotulo: textos.totais.emValidacao,
      valor: registos.filter((r) => r.estado === 'submetido' || r.estado === 'devolvido').length,
      descricao: textos.totais.emValidacaoDescricao,
    },
    {
      rotulo: textos.totais.validados,
      valor: registos.filter((r) => r.estado === 'validado').length,
      descricao: textos.totais.validadosDescricao,
    },
    {
      rotulo: textos.totais.comAipd,
      valor: registos.filter((r) => r.aipdRealizada === 'sim').length,
      descricao: textos.totais.comAipdDescricao,
    },
  ]

  return (
    <section aria-label={textos.totais.titulo} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {totais.map((total) => (
        <div
          key={total.rotulo}
          className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <span className="text-2xl font-semibold tabular-nums text-primary">{total.valor}</span>
          <span className="text-sm font-medium leading-snug">{total.rotulo}</span>
          <span className="text-xs leading-snug text-muted-foreground">{total.descricao}</span>
        </div>
      ))}
    </section>
  )
}
