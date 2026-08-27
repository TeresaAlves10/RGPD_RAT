import { describe, expect, it } from 'vitest'
import { ErroVersaoDesconhecida, migrarParaVersaoAtual } from '@/domain/migrations'
import { ficheiroRatFixtureValido, registoResponsavelMinimo } from '@/domain/fixtures/registos'
import { SCHEMA_VERSION_ATUAL } from '@/domain/schema/ficheiro'

describe('migrarParaVersaoAtual', () => {
  it('devolve o ficheiro tal como está quando já está na versão atual', () => {
    const resultado = migrarParaVersaoAtual(ficheiroRatFixtureValido)
    expect(resultado).toEqual(ficheiroRatFixtureValido)
  })

  it('migra um ficheiro v1 (sem "anotacoes" nem "estado") para a versão atual', () => {
    const { anotacoes: _semAnotacoes, estado: _semEstado, ...registoV1 } = registoResponsavelMinimo
    const ficheiroV1 = {
      schemaVersion: 1,
      metadados: ficheiroRatFixtureValido.metadados,
      registos: [registoV1],
    }

    const resultado = migrarParaVersaoAtual(ficheiroV1)
    expect(resultado.schemaVersion).toBe(SCHEMA_VERSION_ATUAL)
    expect(resultado.registos[0].anotacoes).toEqual([])
    expect(resultado.registos[0].estado).toBe('rascunho')
  })

  it('migra um ficheiro v2 (sem "estado") para a versão atual', () => {
    const { estado: _semEstado, ...registoV2 } = registoResponsavelMinimo
    const ficheiroV2 = {
      schemaVersion: 2,
      metadados: ficheiroRatFixtureValido.metadados,
      registos: [registoV2],
    }

    const resultado = migrarParaVersaoAtual(ficheiroV2)
    expect(resultado.schemaVersion).toBe(SCHEMA_VERSION_ATUAL)
    // "rascunho" é o estado mais conservador: nunca dá por concluído
    // aquilo que ninguém deu.
    expect(resultado.registos[0].estado).toBe('rascunho')
    // O módulo de avaliação continua ausente — não ativado.
    expect(resultado.registos[0].avaliacao).toBeUndefined()
  })

  it('preserva um estado já existente em vez de o repor', () => {
    const ficheiroV2 = {
      schemaVersion: 2,
      metadados: ficheiroRatFixtureValido.metadados,
      registos: [{ ...registoResponsavelMinimo, estado: 'validado' }],
    }

    const resultado = migrarParaVersaoAtual(ficheiroV2)
    expect(resultado.registos[0].estado).toBe('validado')
  })

  it('migra um ficheiro v3 (sem os campos da matriz) para a versão atual', () => {
    const ficheiroV3 = {
      schemaVersion: 3,
      metadados: ficheiroRatFixtureValido.metadados,
      registos: [registoResponsavelMinimo],
    }

    const resultado = migrarParaVersaoAtual(ficheiroV3)
    expect(resultado.schemaVersion).toBe(SCHEMA_VERSION_ATUAL)
    // Campos novos são todos opcionais: a ausência é o estado correto,
    // nada é inventado na migração.
    const registo = resultado.registos[0]
    expect(registo.tipoRegisto).toBe('responsavel')
    if (registo.tipoRegisto === 'responsavel') {
      expect(registo.matriz).toBeUndefined()
      expect(registo.criterioPrazoConservacao).toBeUndefined()
    }
    // E o que já lá estava mantém-se intacto.
    expect(registo.nomeTratamento).toBe(registoResponsavelMinimo.nomeTratamento)
  })

  it('lança ErroVersaoDesconhecida para uma versão futura sem migrador', () => {
    const dados = { ...ficheiroRatFixtureValido, schemaVersion: SCHEMA_VERSION_ATUAL + 1 }
    expect(() => migrarParaVersaoAtual(dados)).toThrow(ErroVersaoDesconhecida)
  })

  it('lança um erro de validação se schemaVersion nem sequer existir', () => {
    const { schemaVersion: _semVersao, ...semSchemaVersion } = ficheiroRatFixtureValido as Record<
      string,
      unknown
    > & { schemaVersion: unknown }
    expect(() => migrarParaVersaoAtual(semSchemaVersion)).toThrow()
  })
})
