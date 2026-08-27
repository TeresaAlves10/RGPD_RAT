import { describe, expect, it } from 'vitest'
import { ErroVersaoDesconhecida, migrarParaVersaoAtual } from '@/domain/migrations'
import { ficheiroRatFixtureValido } from '@/domain/fixtures/registos'
import { SCHEMA_VERSION_ATUAL } from '@/domain/schema/ficheiro'

/**
 * Um registo tal como era gravado na v4 — a estrutura antiga, com a
 * matriz aninhada e o módulo de avaliação à parte. É este o formato que o
 * migrador v4->v5 tem de saber ler.
 */
const registoResponsavelV4 = {
  id: '22222222-2222-4222-8222-222222222222',
  tipoRegisto: 'responsavel',
  estado: 'pronto',
  direcao: 'Direção de Recursos Humanos',
  unidadeCoordenacao: 'Unidade Fictícia',
  nomeTratamento: 'Gestão administrativa de colaboradores',
  descricao: 'Descrição fictícia.',
  gestorProjeto: { nome: 'Bruno Fictício', contacto: 'bruno@exemplo.pt' },
  finalidades: 'Gestão de contratos de trabalho.',
  baseLicitude: 'obrigacao_juridica',
  recolhaDados: 'Formulário de admissão.',
  categoriasTitulares: ['colaboradores'],
  categoriasDados: [{ categoria: 'identificacao_civil', tipos: ['Nome'] }],
  categoriasEspeciais: {
    aplicavel: true,
    condicoesArt9: ['obrigacoes_direito_laboral'],
    identificar: 'Dados de saúde.',
  },
  destinatarios: 'Segurança Social.',
  prazoConservacao: '10 anos.',
  criterioPrazoConservacao: 'Prescrição de créditos laborais.',
  medidasTecnicasOrganizativas: [{ medida: 'encriptacao' }],
  transferenciasInternacionais: {
    existem: true,
    paisesOuOrganizacoes: ['Estados Unidos da América'],
    mecanismo: 'cct',
  },
  aipdRealizada: 'nao',
  observacoes: 'Observação original.',
  anotacoes: [],
  matriz: {
    caracterizacao: {
      operacoesTratamento: 'Recolha e conservação.',
      temDadosPessoais: 'sim',
      dadosNecessariosParaFinalidade: 'sim',
      entidadesQueEnviamDados: 'Segurança Social.',
      suportesFisicos: 'Papel.',
      localizacaoSuportesFisicos: 'Arquivo, piso 2.',
    },
    ferramentas: { ferramentasAplicacoes: 'Sistema fictício de RH.', volumeDadosPessoais: '400' },
    licitudeRetencao: { retencaoDefinidaPelaOrganizacao: 'sim', retencaoPorNormativosLegais: 'sim' },
    normativosAplicaveis: 'Código do Trabalho.',
    comentarios: 'Comentário da matriz.',
  },
  avaliacao: {
    requisitosFuncionais: { direitoAcesso: 'sim', direitoNaoDecisoesAutomatizadas: 'nao_aplicavel' },
    controlosOperacionais: { revisaoPeriodicaAcessos: 'nao', notas: 'Por calendarizar.' },
  },
}

const registoSubcontratadoV4 = {
  id: '44444444-4444-4444-8444-444444444444',
  tipoRegisto: 'subcontratado',
  estado: 'rascunho',
  direcao: 'Direção de Sistemas',
  nomeTratamento: 'Helpdesk',
  gestorProjeto: { nome: 'Diana Fictícia', contacto: 'diana@exemplo.pt' },
  medidasTecnicasOrganizativas: [{ medida: 'encriptacao' }],
  transferenciasInternacionais: { existem: true, paisesOuOrganizacoes: ['Reino Unido'] },
  aipdRealizada: 'sim',
  anotacoes: [],
  responsaveis: [
    { nome: 'Cliente Alfa Fictício, Lda.', categoriasTratamento: 'Suporte técnico.' },
    { nome: 'Cliente Beta Fictício, S.A.', categoriasTratamento: 'Gestão de tickets.' },
  ],
  prazoConservacao: '90 dias.',
}

function ficheiroV4(registos: unknown[]) {
  return { schemaVersion: 4, metadados: ficheiroRatFixtureValido.metadados, registos }
}

describe('migrarParaVersaoAtual', () => {
  it('devolve o ficheiro tal como está quando já está na versão atual', () => {
    expect(migrarParaVersaoAtual(ficheiroRatFixtureValido)).toEqual(ficheiroRatFixtureValido)
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

describe('migração v4 -> v5 do responsável', () => {
  const resultado = migrarParaVersaoAtual(ficheiroV4([registoResponsavelV4]))
  const registo = resultado.registos[0]

  it('chega à versão atual e mantém a identidade do registo', () => {
    expect(resultado.schemaVersion).toBe(SCHEMA_VERSION_ATUAL)
    expect(registo.id).toBe(registoResponsavelV4.id)
    expect(registo.nomeTratamento).toBe(registoResponsavelV4.nomeTratamento)
  })

  it('traduz o estado "pronto" para "submetido"', () => {
    expect(registo.estado).toBe('submetido')
  })

  it('achata a matriz aninhada nos campos das secções', () => {
    if (registo.tipoRegisto !== 'responsavel') throw new Error('tipo inesperado')
    expect(registo.operacoesTratamento).toBe('Recolha e conservação.')
    expect(registo.trataDadosPessoais).toBe('sim')
    expect(registo.suportesFisicos).toBe('Papel.')
    expect(registo.ferramentasAplicacoes).toBe('Sistema fictício de RH.')
    expect(registo.retencaoDefinidaPelaOrganizacao).toBe('sim')
    expect(registo.normativosAplicaveis).toBe('Código do Trabalho.')
  })

  it('traz as respostas do módulo de avaliação para as secções 5 e 6', () => {
    if (registo.tipoRegisto !== 'responsavel') throw new Error('tipo inesperado')
    expect(registo.direitoAcesso).toBe('sim')
    // O campo mudou de nome entre versões.
    expect(registo.direitoDecisoesAutomatizadas).toBe('nao_aplicavel')
    expect(registo.revisaoPeriodicaAcessos).toBe('nao')
  })

  it('converte o booleano das categorias especiais para sim/não', () => {
    if (registo.tipoRegisto !== 'responsavel') throw new Error('tipo inesperado')
    expect(registo.categoriasEspeciais?.aplicavel).toBe('sim')
    expect(registo.categoriasEspeciais?.identificar).toBe('Dados de saúde.')
  })

  it('renomeia "finalidades" para "finalidade"', () => {
    if (registo.tipoRegisto !== 'responsavel') throw new Error('tipo inesperado')
    expect(registo.finalidade).toBe('Gestão de contratos de trabalho.')
  })

  /**
   * O ponto mais importante da migração: nada do que uma equipa escreveu
   * pode desaparecer só porque o campo deixou de existir.
   */
  it('não perde texto de campos que deixaram de ter destino próprio', () => {
    const observacoes = registo.observacoes ?? ''
    expect(observacoes).toContain('Observação original.')
    expect(observacoes).toContain('10 anos.')
    expect(observacoes).toContain('Prescrição de créditos laborais.')
    expect(observacoes).toContain('Formulário de admissão.')
    expect(observacoes).toContain('obrigacoes_direito_laboral')
    expect(observacoes).toContain('Estados Unidos da América')
    expect(observacoes).toContain('Comentário da matriz.')
    expect(observacoes).toContain('Por calendarizar.')
  })
})

describe('migração v4 -> v5 do subcontratante', () => {
  const resultado = migrarParaVersaoAtual(ficheiroV4([registoSubcontratadoV4]))
  const registo = resultado.registos[0]

  it('junta os vários responsáveis num só nome, sem perder nenhum', () => {
    if (registo.tipoRegisto !== 'subcontratado') throw new Error('tipo inesperado')
    expect(registo.nomeResponsavelTratamento).toContain('Cliente Alfa Fictício, Lda.')
    expect(registo.nomeResponsavelTratamento).toContain('Cliente Beta Fictício, S.A.')
  })

  it('preserva nas observações as categorias de tratamento de cada responsável', () => {
    const observacoes = registo.observacoes ?? ''
    expect(observacoes).toContain('Suporte técnico.')
    expect(observacoes).toContain('Gestão de tickets.')
  })

  it('converte transferenciasInternacionais para o novo campo transferencias', () => {
    if (registo.tipoRegisto !== 'subcontratado') throw new Error('tipo inesperado')
    expect(registo.transferencias?.existem).toBe('sim')
    expect(registo.transferencias?.identificar).toBe('Reino Unido')
  })
})

describe('migração desde as versões mais antigas', () => {
  it('um ficheiro v1 (sem "anotacoes" nem "estado") chega à versão atual', () => {
    const { anotacoes: _a, estado: _e, ...registoV1 } = registoResponsavelV4
    const resultado = migrarParaVersaoAtual({
      schemaVersion: 1,
      metadados: ficheiroRatFixtureValido.metadados,
      registos: [registoV1],
    })
    expect(resultado.schemaVersion).toBe(SCHEMA_VERSION_ATUAL)
    expect(resultado.registos[0].anotacoes).toEqual([])
    // "rascunho" é o estado mais conservador: nunca dá por concluído
    // aquilo que ninguém deu.
    expect(resultado.registos[0].estado).toBe('rascunho')
  })

  it('preserva um estado já existente em vez de o repor', () => {
    const resultado = migrarParaVersaoAtual({
      schemaVersion: 2,
      metadados: ficheiroRatFixtureValido.metadados,
      registos: [{ ...registoResponsavelV4, estado: 'validado' }],
    })
    expect(resultado.registos[0].estado).toBe('validado')
  })
})
