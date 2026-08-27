import type { Migrador } from '@/domain/migrations/types'

/**
 * v6 -> v7: as três contagens da secção "Ferramentas" deixam de ser só a
 * escala e passam a `{ escala, valor }`, para se poder registar também o
 * número ou a nota exata ao lado da ordem de grandeza.
 *
 * A escala escolhida transita tal e qual; `valor` fica por preencher.
 * Nada mais muda de forma — a mudança da pergunta sobre violações de
 * dados para os Controlos Operacionais é só de posição no formulário, e o
 * campo mantém o mesmo nome.
 */

type Obj = Record<string, unknown>

const CONTAGENS = [
  'numeroCamposComDadosPessoais',
  'volumeDadosPessoais',
  'numeroUtilizadoresComAcesso',
] as const

function migrarContagens(registo: Obj): Obj {
  const migrado: Obj = { ...registo }
  for (const campo of CONTAGENS) {
    const escala = registo[campo]
    migrado[campo] = typeof escala === 'string' && escala !== '' ? { escala } : undefined
  }
  return migrado
}

export const migradorV6ParaV7: Migrador = {
  de: 6,
  migrar(dados) {
    const registos = Array.isArray(dados.registos) ? (dados.registos as Obj[]) : []
    return { ...dados, schemaVersion: 7, registos: registos.map(migrarContagens) }
  },
}
