import { describe, expect, it } from 'vitest'
import { avaliarFicheiro, avaliarRegisto } from '@/domain/rules/motor'
import {
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoResponsavelMinimo,
  registoSubcontratadoCompleto,
  registoSubcontratadoMinimo,
} from '@/domain/fixtures/registos'
import type { Registo } from '@/domain/schema/registo'
import type { FicheiroRat } from '@/domain/schema/ficheiro'

function clone<T>(valor: T): T {
  return structuredClone(valor)
}

function temOcorrencia(registo: Registo, regraId: string): boolean {
  return avaliarRegisto(registo).some((o) => o.regraId === regraId)
}

describe('MTO_OUTRO_ESPECIFICADO', () => {
  it('passa quando "outro" tem medidaOutra preenchida', () => {
    const registo = clone(registoResponsavelCompleto)
    expect(temOcorrencia(registo, 'MTO_OUTRO_ESPECIFICADO')).toBe(false)
  })

  it('falha quando "outro" não tem medidaOutra', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.medidasTecnicasOrganizativas = [{ medida: 'outro' }]
    expect(temOcorrencia(registo, 'MTO_OUTRO_ESPECIFICADO')).toBe(true)
  })
})

describe('TRANSFERENCIA_MECANISMO_OBRIGATORIO', () => {
  it('passa quando não existem transferências', () => {
    const registo = clone(registoResponsavelMinimo)
    expect(temOcorrencia(registo, 'TRANSFERENCIA_MECANISMO_OBRIGATORIO')).toBe(false)
  })

  it('falha quando existem transferências sem mecanismo', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.transferenciasInternacionais = { existem: true, paisesOuOrganizacoes: ['França'] }
    expect(temOcorrencia(registo, 'TRANSFERENCIA_MECANISMO_OBRIGATORIO')).toBe(true)
  })
})

describe('TRANSFERENCIA_MECANISMO_OUTRO_ESPECIFICADO', () => {
  it('passa quando o mecanismo não é "outro"', () => {
    const registo = clone(registoResponsavelCompleto)
    expect(temOcorrencia(registo, 'TRANSFERENCIA_MECANISMO_OUTRO_ESPECIFICADO')).toBe(false)
  })

  it('falha quando o mecanismo é "outro" sem especificação', () => {
    const registo = clone(registoResponsavelCompleto)
    registo.transferenciasInternacionais = { ...registo.transferenciasInternacionais, mecanismo: 'outro' }
    expect(temOcorrencia(registo, 'TRANSFERENCIA_MECANISMO_OUTRO_ESPECIFICADO')).toBe(true)
  })
})

describe('TRANSFERENCIA_PAISES_OBRIGATORIO', () => {
  it('passa quando existem transferências com países indicados', () => {
    const registo = clone(registoResponsavelCompleto)
    expect(temOcorrencia(registo, 'TRANSFERENCIA_PAISES_OBRIGATORIO')).toBe(false)
  })

  it('falha quando existem transferências sem países indicados', () => {
    const registo = clone(registoResponsavelCompleto)
    registo.transferenciasInternacionais = { existem: true, mecanismo: 'cct' }
    expect(temOcorrencia(registo, 'TRANSFERENCIA_PAISES_OBRIGATORIO')).toBe(true)
  })
})

describe('TRANSFERENCIA_SEM_DADOS_QUANDO_NAO_EXISTEM', () => {
  it('passa quando não existem transferências e nada está preenchido', () => {
    const registo = clone(registoResponsavelMinimo)
    expect(temOcorrencia(registo, 'TRANSFERENCIA_SEM_DADOS_QUANDO_NAO_EXISTEM')).toBe(false)
  })

  it('falha quando não existem transferências mas há mecanismo preenchido', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.transferenciasInternacionais = { existem: false, mecanismo: 'cct' }
    expect(temOcorrencia(registo, 'TRANSFERENCIA_SEM_DADOS_QUANDO_NAO_EXISTEM')).toBe(true)
  })
})

describe('GESTOR_PROJETO_CONTACTO_FORMATO', () => {
  it('passa com um email válido', () => {
    const registo = clone(registoResponsavelMinimo)
    expect(temOcorrencia(registo, 'GESTOR_PROJETO_CONTACTO_FORMATO')).toBe(false)
  })

  it('falha com um contacto que não é email nem telefone', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.gestorProjeto = { ...registo.gestorProjeto, contacto: 'fala comigo' }
    expect(temOcorrencia(registo, 'GESTOR_PROJETO_CONTACTO_FORMATO')).toBe(true)
  })
})

describe('CATEGORIAS_ESPECIAIS_CONDICAO_OBRIGATORIA', () => {
  it('passa quando categorias especiais aplicável tem condição e identificação', () => {
    const registo = clone(registoResponsavelCompleto)
    expect(temOcorrencia(registo, 'CATEGORIAS_ESPECIAIS_CONDICAO_OBRIGATORIA')).toBe(false)
  })

  it('falha quando categorias especiais aplicável não tem condição', () => {
    const registo = clone(registoResponsavelCompleto)
    registo.categoriasEspeciais = { aplicavel: true }
    expect(temOcorrencia(registo, 'CATEGORIAS_ESPECIAIS_CONDICAO_OBRIGATORIA')).toBe(true)
  })

  it('não se aplica a registos de subcontratado', () => {
    const registo = clone(registoSubcontratadoMinimo)
    expect(temOcorrencia(registo, 'CATEGORIAS_ESPECIAIS_CONDICAO_OBRIGATORIA')).toBe(false)
  })
})

describe('CATEGORIAS_ESPECIAIS_SEM_DADOS_QUANDO_NAO_APLICAVEL', () => {
  it('passa quando não aplicável e nada está preenchido', () => {
    const registo = clone(registoResponsavelMinimo)
    expect(temOcorrencia(registo, 'CATEGORIAS_ESPECIAIS_SEM_DADOS_QUANDO_NAO_APLICAVEL')).toBe(false)
  })

  it('falha quando não aplicável mas há identificação preenchida', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.categoriasEspeciais = { aplicavel: false, identificar: 'dados de saúde' }
    expect(temOcorrencia(registo, 'CATEGORIAS_ESPECIAIS_SEM_DADOS_QUANDO_NAO_APLICAVEL')).toBe(true)
  })
})

describe('CATEGORIA_DADOS_OUTRO_ESPECIFICADA', () => {
  it('passa quando não há categoria "outro"', () => {
    const registo = clone(registoResponsavelMinimo)
    expect(temOcorrencia(registo, 'CATEGORIA_DADOS_OUTRO_ESPECIFICADA')).toBe(false)
  })

  it('falha quando categoria "outro" não tem especificação', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.categoriasDados = [{ categoria: 'outro', tipos: ['algo'] }]
    expect(temOcorrencia(registo, 'CATEGORIA_DADOS_OUTRO_ESPECIFICADA')).toBe(true)
  })
})

describe('CATEGORIAS_TITULARES_OUTRO_ESPECIFICADA', () => {
  it('passa quando não há categoria de titulares "outro"', () => {
    const registo = clone(registoResponsavelMinimo)
    expect(temOcorrencia(registo, 'CATEGORIAS_TITULARES_OUTRO_ESPECIFICADA')).toBe(false)
  })

  it('falha quando categoria de titulares "outro" não tem especificação', () => {
    const registo = clone(registoResponsavelMinimo)
    registo.categoriasTitulares = ['outro']
    expect(temOcorrencia(registo, 'CATEGORIAS_TITULARES_OUTRO_ESPECIFICADA')).toBe(true)
  })
})

describe('RESPONSAVEIS_CATEGORIAS_TRATAMENTO_DESCRITIVAS', () => {
  it('passa com uma descrição suficientemente longa', () => {
    const registo = clone(registoSubcontratadoCompleto)
    expect(temOcorrencia(registo, 'RESPONSAVEIS_CATEGORIAS_TRATAMENTO_DESCRITIVAS')).toBe(false)
  })

  it('falha com uma descrição demasiado curta', () => {
    const registo = clone(registoSubcontratadoMinimo)
    registo.responsaveis = [{ nome: 'Cliente Fictício', categoriasTratamento: 'ok' }]
    expect(temOcorrencia(registo, 'RESPONSAVEIS_CATEGORIAS_TRATAMENTO_DESCRITIVAS')).toBe(true)
  })
})

describe('SUBCONTRATANTE_DATA_CONTRATO_FORMATO', () => {
  it('passa com data no formato AAAA-MM-DD', () => {
    const registo = clone(registoResponsavelCompleto)
    expect(temOcorrencia(registo, 'SUBCONTRATANTE_DATA_CONTRATO_FORMATO')).toBe(false)
  })

  it('falha com uma data em formato inválido', () => {
    const registo = clone(registoResponsavelCompleto)
    registo.subcontratantesContratados = [{ nome: 'Fornecedor Fictício', dataContrato: '15/01/2023' }]
    expect(temOcorrencia(registo, 'SUBCONTRATANTE_DATA_CONTRATO_FORMATO')).toBe(true)
  })
})

describe('REGISTOS_NOME_TRATAMENTO_UNICO', () => {
  it('passa quando não há registos duplicados', () => {
    const ficheiro = clone(ficheiroRatFixtureValido)
    expect(avaliarFicheiro(ficheiro).some((o) => o.regraId === 'REGISTOS_NOME_TRATAMENTO_UNICO')).toBe(
      false,
    )
  })

  it('falha quando dois registos partilham direção e nome de tratamento', () => {
    const ficheiro: FicheiroRat = clone(ficheiroRatFixtureValido)
    const duplicado = clone(registoResponsavelMinimo)
    duplicado.id = '55555555-5555-4555-8555-555555555555'
    ficheiro.registos = [registoResponsavelMinimo, duplicado]
    expect(avaliarFicheiro(ficheiro).some((o) => o.regraId === 'REGISTOS_NOME_TRATAMENTO_UNICO')).toBe(
      true,
    )
  })
})

describe('avaliarFicheiro', () => {
  it('não reporta nenhum erro para o ficheiro de fixture válido', () => {
    const ocorrencias = avaliarFicheiro(ficheiroRatFixtureValido)
    const erros = ocorrencias.filter((o) => o.severidade === 'erro')
    expect(erros).toEqual([])
  })
})
