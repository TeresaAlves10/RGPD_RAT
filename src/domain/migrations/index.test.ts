import { describe, expect, it } from 'vitest'
import { ErroVersaoDesconhecida, migrarParaVersaoAtual } from '@/domain/migrations'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'

describe('migrarParaVersaoAtual', () => {
  it('devolve o ficheiro tal como está quando já está na versão atual', () => {
    const resultado = migrarParaVersaoAtual(ficheiroRatFixtureValido)
    expect(resultado).toEqual(ficheiroRatFixtureValido)
  })

  it('lança ErroVersaoDesconhecida para uma versão futura sem migrador', () => {
    const dados = { ...ficheiroRatFixtureValido, schemaVersion: 2 }
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
