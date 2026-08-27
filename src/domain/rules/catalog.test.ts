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

const subcontratado = (alteracoes: Partial<RegistoSubcontratado>): RegistoSubcontratado => ({
  ...registoSubcontratadoCompleto,
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
    expect(ids).toContain('resp.obrigatorio.finalidade')
    expect(ids).toContain('resp.obrigatorio.operacoesTratamento')
    expect(ids).toContain('resp.obrigatorio.ferramentasAplicacoes')
    expect(ids).toContain('resp.obrigatorio.direitoAcesso')
    expect(ids).toContain('resp.obrigatorio.revisaoPeriodicaAcessos')
    expect(ids).toContain('comum.obrigatorio.unidadeCoordenacao')
    expect(podeSubmeter(registoResponsavelMinimo)).toBe(false)
  })

  it('negativo: apagar um único campo obrigatório acusa só esse campo', () => {
    const ids = violadas(responsavel({ suportesFisicos: '   ' }))
    expect(ids).toContain('resp.obrigatorio.suportesFisicos')
    expect(ids).not.toContain('resp.obrigatorio.localizacaoSuportesFisicos')
  })
})

describe('tipos de dados dentro de cada categoria', () => {
  it('positivo: cada categoria escolhida indica os seus tipos', () => {
    expect(violadas(registoResponsavelCompleto)).not.toContain('comum.categoriaDadosSemTipos')
    expect(violadas(registoSubcontratadoCompleto)).not.toContain('comum.categoriaDadosSemTipos')
  })

  it('negativo: categoria escolhida sem nenhum tipo indicado', () => {
    const ids = violadas(
      responsavel({ categoriasDados: [{ categoria: 'identificacao_civil', tipos: [] }] }),
    )
    expect(ids).toContain('comum.categoriaDadosSemTipos')
  })

  it('negativo: categoria "Outro" por especificar', () => {
    const ids = violadas(
      responsavel({ categoriasDados: [{ categoria: 'outro', tipos: ['Algo'] }] }),
    )
    expect(ids).toContain('comum.categoriaDadosOutraPorEspecificar')
  })

  it('positivo: categoria "Outro" especificada', () => {
    const ids = violadas(
      responsavel({
        categoriasDados: [
          { categoria: 'outro', categoriaOutra: 'Dados de geolocalização', tipos: ['Coordenadas'] },
        ],
      }),
    )
    expect(ids).not.toContain('comum.categoriaDadosOutraPorEspecificar')
  })
})

describe('categorias especiais de dados (art. 9.º)', () => {
  it('positivo: identificadas quando existem', () => {
    expect(violadas(registoResponsavelCompleto)).not.toContain(
      'resp.categoriasEspeciaisPorIdentificar',
    )
  })

  it('negativo: assinaladas mas não identificadas', () => {
    const ids = violadas(
      responsavel({ categoriasEspeciais: { aplicavel: 'sim', identificar: '' } }),
    )
    expect(ids).toContain('resp.categoriasEspeciaisPorIdentificar')
  })

  it('não se aplica quando não há categorias especiais', () => {
    const ids = violadas(
      responsavel({
        categoriasEspeciais: { aplicavel: 'nao' },
        categoriasEspeciaisNecessarias: undefined,
      }),
    )
    expect(ids).not.toContain('resp.categoriasEspeciaisPorIdentificar')
    expect(ids).not.toContain('resp.categoriasEspeciaisNecessidadePorResponder')
  })
})

describe('consentimento (arts. 7.º e 8.º)', () => {
  it('positivo: com consentimento e mecanismos de demonstração', () => {
    const ids = violadas(
      responsavel({
        baseLicitude: 'consentimento',
        consentimentoMecanismosDemonstracao: 'sim',
        consentimentoResponsabilidadeParental: 'nao_aplicavel',
      }),
    )
    expect(ids).not.toContain('resp.consentimentoDemonstracaoPorResponder')
    expect(ids).not.toContain('resp.consentimentoSemDemonstracao')
  })

  it('negativo: com consentimento e sem forma de o demonstrar', () => {
    const ids = violadas(
      responsavel({
        baseLicitude: 'consentimento',
        consentimentoMecanismosDemonstracao: 'nao',
        consentimentoResponsabilidadeParental: 'nao_aplicavel',
      }),
    )
    expect(ids).toContain('resp.consentimentoSemDemonstracao')
  })

  it('as perguntas de consentimento não se aplicam a outra base de licitude', () => {
    const ids = violadas(responsavel({ baseLicitude: 'obrigacao_juridica' }))
    expect(ids).not.toContain('resp.consentimentoDemonstracaoPorResponder')
    expect(ids).not.toContain('resp.consentimentoParentalPorResponder')
  })
})

describe('subcontratados (art. 28.º)', () => {
  it('positivo: com contrato e cláusulas de proteção de dados', () => {
    const ids = violadas(registoResponsavelCompleto)
    expect(ids).not.toContain('resp.subcontratadoSemContrato')
    expect(ids).not.toContain('resp.subcontratadoSemClausulas')
  })

  it('negativo: subcontratado sem contrato e sem cláusulas', () => {
    const ids = violadas(
      responsavel({
        subcontratados: [
          { nome: 'Fornecedor Fictício', existeContrato: 'nao', contratoComClausulasProtecaoDados: 'nao' },
        ],
      }),
    )
    expect(ids).toContain('resp.subcontratadoSemContrato')
    expect(ids).toContain('resp.subcontratadoSemClausulas')
  })

  it('negativo: subcontratado sem nome', () => {
    expect(violadas(responsavel({ subcontratados: [{ operacoesTratamento: 'Alojamento.' }] }))).toContain(
      'resp.subcontratadoSemNome',
    )
  })
})

describe('período de retenção (art. 30.º/1 f))', () => {
  it('positivo: retenção definida internamente', () => {
    expect(violadas(registoResponsavelCompleto)).not.toContain('resp.semPeriodoDeRetencao')
  })

  it('negativo: sem retenção definida nem por normativo', () => {
    const ids = violadas(
      responsavel({ retencaoDefinidaPelaOrganizacao: 'nao', retencaoPorNormativosLegais: 'nao' }),
    )
    expect(ids).toContain('resp.semPeriodoDeRetencao')
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
    expect(podeSubmeter(registoSubcontratadoMinimo)).toBe(false)
  })

  it('as regras do responsável não se aplicam ao subcontratante', () => {
    const ids = violadas(registoSubcontratadoMinimo)
    expect(ids.filter((id) => id.startsWith('resp.'))).toHaveLength(0)
  })
})

describe('transferências para países terceiros (art. 44.º)', () => {
  it('positivo: identificadas quando existem', () => {
    expect(violadas(registoSubcontratadoCompleto)).not.toContain('sub.transferenciasPorIdentificar')
  })

  it('negativo: assinaladas mas não identificadas', () => {
    const ids = violadas(subcontratado({ transferencias: { existem: 'sim' } }))
    expect(ids).toContain('sub.transferenciasPorIdentificar')
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
