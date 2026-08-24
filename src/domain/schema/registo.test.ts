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

  it('ignora campos exclusivos do responsável presentes num registo de subcontratado', () => {
    // baseLicitude não faz parte do schema do subcontratado: campos extra
    // são ignorados por omissão pelo Zod, o resultado continua válido, mas
    // confirmamos que o tipoRegisto correto é o determinante.
    const comCampoDeMais = { ...registoSubcontratadoMinimo, baseLicitude: 'consentimento' }
    const resultado = registoSchema.safeParse(comCampoDeMais)
    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect('baseLicitude' in resultado.data).toBe(false)
    }
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
