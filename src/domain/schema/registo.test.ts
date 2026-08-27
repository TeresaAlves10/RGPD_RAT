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

describe('schema do registo', () => {
  it('aceita os quatro registos das fixtures', () => {
    for (const registo of [
      registoResponsavelMinimo,
      registoResponsavelCompleto,
      registoSubcontratadoMinimo,
      registoSubcontratadoCompleto,
    ]) {
      expect(registoSchema.safeParse(registo).success).toBe(true)
    }
  })

  it('distingue as duas qualidades pelo discriminante tipoRegisto', () => {
    const responsavel = registoSchema.parse(registoResponsavelCompleto)
    const subcontratado = registoSchema.parse(registoSubcontratadoCompleto)
    expect(responsavel.tipoRegisto).toBe('responsavel')
    expect(subcontratado.tipoRegisto).toBe('subcontratado')
  })

  it('rejeita um registo sem os campos mínimos para existir na lista', () => {
    const resultado = registoSchema.safeParse({
      id: 'nao-e-uuid',
      tipoRegisto: 'responsavel',
      estado: 'rascunho',
      direcao: '',
      nomeTratamento: '',
      gestorProjeto: { nome: '' },
    })
    expect(resultado.success).toBe(false)
  })

  /**
   * Os campos da especificação são opcionais no schema de propósito: a
   * obrigatoriedade é imposta pelo catálogo de regras, para que um
   * rascunho a meio continue a poder ser guardado e exportado.
   * Ver src/domain/rules/catalog.test.ts.
   */
  it('aceita um registo por completar, para o rascunho poder ser guardado', () => {
    expect(registoSchema.safeParse(registoResponsavelMinimo).success).toBe(true)
    expect(registoSchema.safeParse(registoSubcontratadoMinimo).success).toBe(true)
  })

  it('só reconhece campos do seu tipo — os do outro tipo são descartados', () => {
    const comCampoDoOutroTipo = {
      ...registoSubcontratadoMinimo,
      // "operacoesTratamento" é do responsável, não do subcontratante.
      operacoesTratamento: 'Não deve sobreviver ao parse.',
    }
    const resultado = registoSchema.parse(comCampoDoOutroTipo)
    expect(resultado).not.toHaveProperty('operacoesTratamento')
  })

  it('valida o ficheiro completo e rejeita a fixture inválida', () => {
    expect(ficheiroRatSchema.safeParse(ficheiroRatFixtureValido).success).toBe(true)
    expect(ficheiroRatSchema.safeParse(ficheiroRatFixtureInvalida).success).toBe(false)
  })
})
