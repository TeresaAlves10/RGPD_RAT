import { describe, expect, it } from 'vitest'
import { catalogoRegras } from '@/domain/rules/catalog'
import { avaliarFicheiro, avaliarRegisto, errosPorResolver, podeSubmeter } from '@/domain/rules/motor'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoResponsavelMinimo,
  registoSubcontratadoCompleto,
  registoSubcontratadoMinimo,
} from '@/domain/fixtures/registos'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'

/** Ids das regras violadas por um registo — o que os testes verificam. */
function violadas(registo: RegistoResponsavel | RegistoSubcontratado): string[] {
  return avaliarRegisto(registo).map((o) => o.regraId)
}

const responsavel = (alteracoes: Partial<RegistoResponsavel>): RegistoResponsavel => ({
  ...registoResponsavelCompleto,
  ...alteracoes,
})

describe('catálogo de regras', () => {
  it('não tem ids duplicados', () => {
    const ids = catalogoRegras.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada regra tem descrição e campo ancorável na UI', () => {
    for (const regra of catalogoRegras) {
      expect(regra.descricao.length).toBeGreaterThan(0)
      expect(regra.campo.length).toBeGreaterThan(0)
    }
  })
})

describe('campos obrigatórios do responsável', () => {
  it('positivo: um registo completo não tem erros', () => {
    expect(errosPorResolver(registoResponsavelCompleto)).toHaveLength(0)
    expect(podeSubmeter(registoResponsavelCompleto)).toBe(true)
  })

  it('negativo: um registo mínimo acusa os campos por preencher', () => {
    const ids = violadas(registoResponsavelMinimo)
    expect(ids).toContain('comum.obrigatorio.finalidade')
    expect(ids).toContain('comum.obrigatorio.operacoesTratamento')
    expect(ids).toContain('comum.obrigatorio.ferramentasAplicacoes')
    expect(ids).toContain('comum.obrigatorio.direitoAcesso')
    expect(ids).toContain('comum.obrigatorio.revisaoPeriodicaAcessos')
    expect(ids).toContain('comum.obrigatorio.unidadeCoordenacao')
    expect(ids).toContain('resp.obrigatorio.baseLicitude')
    expect(podeSubmeter(registoResponsavelMinimo)).toBe(false)
  })

  it('negativo: apagar um único campo obrigatório acusa só esse campo', () => {
    const ids = violadas(responsavel({ suportesFisicos: '   ' }))
    expect(ids).toContain('comum.obrigatorio.suportesFisicos')
    expect(ids).not.toContain('comum.obrigatorio.localizacaoSuportesFisicos')
  })
})

describe('categorias especiais de dados (art. 9.º)', () => {
  it('positivo: com categorias especiais, a necessidade está respondida', () => {
    expect(violadas(registoResponsavelCompleto)).not.toContain(
      'comum.categoriasEspeciaisNecessidadePorResponder',
    )
  })

  it('negativo: com categorias especiais e sem dizer se são necessárias', () => {
    const ids = violadas(
      responsavel({ categoriasEspeciais: 'sim', categoriasEspeciaisNecessarias: undefined }),
    )
    expect(ids).toContain('comum.categoriasEspeciaisNecessidadePorResponder')
  })

  it('não se aplica quando não há categorias especiais', () => {
    const ids = violadas(
      responsavel({ categoriasEspeciais: 'nao', categoriasEspeciaisNecessarias: undefined }),
    )
    expect(ids).not.toContain('comum.categoriasEspeciaisNecessidadePorResponder')
  })
})

describe('transferências para países terceiros (art. 44.º)', () => {
  it('positivo: identificadas quando existem', () => {
    expect(violadas(registoSubcontratadoCompleto)).not.toContain(
      'comum.paisesTerceirosPorIdentificar',
    )
  })

  it('negativo: assinaladas mas sem país identificado', () => {
    const ids = violadas(
      responsavel({ transferenciasPaisesTerceiros: 'sim', paisesTerceiros: undefined }),
    )
    expect(ids).toContain('comum.paisesTerceirosPorIdentificar')
  })

  it('não se aplica quando não há transferências', () => {
    const ids = violadas(responsavel({ transferenciasPaisesTerceiros: 'nao' }))
    expect(ids).not.toContain('comum.paisesTerceirosPorIdentificar')
  })
})

describe('subcontratação (art. 28.º)', () => {
  it('positivo: com contrato e com cláusulas de proteção de dados', () => {
    const ids = violadas(registoResponsavelCompleto)
    expect(ids).not.toContain('comum.subcontratadoSemContrato')
    expect(ids).not.toContain('comum.subcontratadoSemClausulas')
  })

  it('negativo: sem contrato e sem cláusulas', () => {
    const ids = violadas(
      responsavel({ existeContrato: 'nao', contratoComClausulasProtecaoDados: 'nao' }),
    )
    expect(ids).toContain('comum.subcontratadoSemContrato')
    expect(ids).toContain('comum.subcontratadoSemClausulas')
  })
})

describe('segurança dos acessos (art. 32.º)', () => {
  it('positivo: acessos removidos à saída', () => {
    expect(violadas(registoResponsavelCompleto)).not.toContain('comum.acessosSemRemocaoASaida')
  })

  it('negativo: acessos por remover à saída', () => {
    expect(violadas(responsavel({ remocaoAcessosASaida: 'nao' }))).toContain(
      'comum.acessosSemRemocaoASaida',
    )
  })
})

describe('minimização dos dados (art. 5.º/1 c))', () => {
  it('positivo: todos os dados são necessários', () => {
    expect(violadas(registoResponsavelCompleto)).not.toContain('comum.dadosDesnecessarios')
  })

  it('negativo: nem todos os dados são necessários', () => {
    expect(violadas(responsavel({ dadosNecessariosParaFinalidade: 'nao' }))).toContain(
      'comum.dadosDesnecessarios',
    )
  })
})

describe('campos obrigatórios do subcontratante', () => {
  it('positivo: um registo completo não tem erros', () => {
    expect(errosPorResolver(registoSubcontratadoCompleto)).toHaveLength(0)
    expect(podeSubmeter(registoSubcontratadoCompleto)).toBe(true)
  })

  it('negativo: um registo mínimo acusa os campos por preencher', () => {
    const ids = violadas(registoSubcontratadoMinimo)
    expect(ids).toContain('sub.obrigatorio.nomeResponsavelTratamento')
    expect(ids).toContain('sub.obrigatorio.baseLegal')
    expect(ids).toContain('sub.obrigatorio.prazoConservacao')
    expect(ids).toContain('sub.obrigatorio.destinatarios')
    expect(podeSubmeter(registoSubcontratadoMinimo)).toBe(false)
  })

  it('as regras próprias do responsável não se aplicam ao subcontratante', () => {
    const ids = violadas(registoSubcontratadoMinimo)
    expect(ids.filter((id) => id.startsWith('resp.'))).toHaveLength(0)
  })

  it('as regras comuns aplicam-se às duas qualidades', () => {
    // O utilizador pediu que a lista do responsável se replicasse aqui.
    const ids = violadas(registoSubcontratadoMinimo)
    expect(ids).toContain('comum.obrigatorio.direitoAcesso')
    expect(ids).toContain('comum.obrigatorio.ferramentasAplicacoes')
  })
})

describe('numeração automática', () => {
  it('positivo: a fixture não tem números repetidos', () => {
    const ids = avaliarFicheiro(ficheiroRatFixtureValido).map((o) => o.regraId)
    expect(ids).not.toContain('ficheiro.numerosDuplicados')
  })

  it('negativo: dois registos com o mesmo ID', () => {
    const duplicado = {
      ...ficheiroRatFixtureValido,
      registos: [registoResponsavelCompleto, { ...registoSubcontratadoCompleto, numero: registoResponsavelCompleto.numero }],
    }
    expect(avaliarFicheiro(duplicado).map((o) => o.regraId)).toContain('ficheiro.numerosDuplicados')
  })
})

describe('regras de âmbito ficheiro', () => {
  it('positivo: a fixture não tem nomes de tratamento duplicados', () => {
    const ids = avaliarFicheiro(ficheiroRatFixtureValido).map((o) => o.regraId)
    expect(ids).not.toContain('ficheiro.nomesDuplicados')
  })

  it('negativo: dois registos com o mesmo nome', () => {
    const duplicado = {
      ...ficheiroRatFixtureValido,
      registos: [
        registoResponsavelCompleto,
        { ...registoSubcontratadoCompleto, nomeTratamento: registoResponsavelCompleto.nomeTratamento },
      ],
    }
    const ids = avaliarFicheiro(duplicado).map((o) => o.regraId)
    expect(ids).toContain('ficheiro.nomesDuplicados')
  })
})
