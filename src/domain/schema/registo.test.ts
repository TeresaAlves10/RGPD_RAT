import { describe, expect, it } from 'vitest'
import { registoSchema } from '@/domain/schema/registo'
import { ficheiroRatSchema } from '@/domain/schema/ficheiro'
import {
  ficheiroRatFixtureInvalida,
  ficheiroRatFixtureValido,
  registoResponsavelCompleto,
  registoResponsavelMinimo,
  registoSubcontratadoCompleto,
  registoSubcontratadoMinimo,
} from '@/domain/fixtures/registos'

describe('registoSchema', () => {
  it('aceita um registo mínimo de responsável', () => {
    expect(registoSchema.safeParse(registoResponsavelMinimo).success).toBe(true)
  })

  it('aceita um registo completo de responsável', () => {
    expect(registoSchema.safeParse(registoResponsavelCompleto).success).toBe(true)
  })

  it('aceita um registo mínimo de subcontratado', () => {
    expect(registoSchema.safeParse(registoSubcontratadoMinimo).success).toBe(true)
  })

  it('aceita um registo completo de subcontratado', () => {
    expect(registoSchema.safeParse(registoSubcontratadoCompleto).success).toBe(true)
  })

  it('aceita e preserva os campos opcionais da folha "Subcontratante"', () => {
    // A lista fornecida para esta folha inclui base de licitude e prazo de
    // conservação. Juridicamente são obrigações do responsável (art. 30.º/1),
    // por isso ficam opcionais aqui — mas quem os preencher não os perde.
    const comCamposDaFolha = {
      ...registoSubcontratadoMinimo,
      baseLicitude: 'consentimento',
      prazoConservacao: '3 anos após o fim do contrato.',
    }
    const resultado = registoSchema.safeParse(comCamposDaFolha)
    expect(resultado.success).toBe(true)
    if (resultado.success && resultado.data.tipoRegisto === 'subcontratado') {
      expect(resultado.data.baseLicitude).toBe('consentimento')
      expect(resultado.data.prazoConservacao).toBe('3 anos após o fim do contrato.')
    }
  })

  it('continua a exigir apenas os responsáveis num registo de subcontratado', () => {
    // Sem base de licitude nem prazo, o registo do art. 30.º/2 é válido.
    const semCamposDoResponsavel = { ...registoSubcontratadoMinimo }
    expect(registoSchema.safeParse(semCamposDoResponsavel).success).toBe(true)
  })

  it('rejeita um id que não é um uuid válido', () => {
    const invalido = { ...registoResponsavelMinimo, id: 'não-é-um-uuid' }
    const resultado = registoSchema.safeParse(invalido)
    expect(resultado.success).toBe(false)
  })

  it('rejeita um valor de baseLicitude fora do vocabulário controlado', () => {
    const invalido = { ...registoResponsavelMinimo, baseLicitude: 'motivo_inexistente' }
    expect(registoSchema.safeParse(invalido).success).toBe(false)
  })

  it('rejeita um registo de responsável sem nenhuma medida técnica/organizativa', () => {
    const invalido = { ...registoResponsavelMinimo, medidasTecnicasOrganizativas: [] }
    expect(registoSchema.safeParse(invalido).success).toBe(false)
  })

  it('rejeita um registo de subcontratado sem nenhum responsável identificado', () => {
    const invalido = { ...registoSubcontratadoMinimo, responsaveis: [] }
    expect(registoSchema.safeParse(invalido).success).toBe(false)
  })
})

describe('ficheiroRatSchema', () => {
  it('aceita um ficheiro válido com registos dos dois tipos misturados', () => {
    const resultado = ficheiroRatSchema.safeParse(ficheiroRatFixtureValido)
    expect(resultado.success).toBe(true)
  })

  it('rejeita um ficheiro inválido e reporta os problemas', () => {
    const resultado = ficheiroRatSchema.safeParse(ficheiroRatFixtureInvalida)
    expect(resultado.success).toBe(false)
    if (!resultado.success) {
      expect(resultado.error.issues.length).toBeGreaterThan(0)
    }
  })

  it('rejeita um schemaVersion diferente do atual', () => {
    const comVersaoErrada = { ...ficheiroRatFixtureValido, schemaVersion: 99 }
    expect(ficheiroRatSchema.safeParse(comVersaoErrada).success).toBe(false)
  })
})
