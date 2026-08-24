import { describe, expect, it } from 'vitest'
import { serializarJson } from '@/io/json/exportar'
import { interpretarJson } from '@/io/json/importar'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'

describe('JSON canónico', () => {
  it('faz round-trip sem perdas: ficheiro -> JSON -> ficheiro', () => {
    const texto = serializarJson(ficheiroRatFixtureValido)
    const resultado = interpretarJson(texto)
    expect(resultado).toEqual(ficheiroRatFixtureValido)
  })

  it('inclui schemaVersion no texto exportado', () => {
    const texto = serializarJson(ficheiroRatFixtureValido)
    expect(JSON.parse(texto).schemaVersion).toBe(1)
  })

  it('rejeita texto que não valida contra o schema', () => {
    expect(() => interpretarJson(JSON.stringify({ foo: 'bar' }))).toThrow()
  })
})
