import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import type { FicheiroRat } from '@/domain/schema/ficheiro'

/**
 * Fixtures com dados fictícios (CLAUDE.md §2.7: nunca dados reais). Usadas
 * nos testes de schema, regras, exports e imports.
 */

export const registoResponsavelMinimo: RegistoResponsavel = {
  id: '11111111-1111-4111-8111-111111111111',
  tipoRegisto: 'responsavel',
  direcao: 'Direção de Sistemas de Informação',
  nomeTratamento: 'Gestão de candidaturas a emprego',
  medidasTecnicasOrganizativas: [{ medida: 'passwords' }],
  transferenciasInternacionais: { existem: false },
  aipdRealizada: 'nao_aplicavel',
  gestorProjeto: { nome: 'Ana Fictícia', contacto: 'ana.ficticia@exemplo.pt' },
  finalidades: 'Avaliação de candidaturas a processos de recrutamento e seleção.',
  baseLicitude: 'execucao_contrato',
  recolhaDados: 'Formulário eletrónico de candidatura no site institucional.',
  categoriasTitulares: ['candidatos_emprego'],
  categoriasDados: [
    { categoria: 'identificacao_civil', tipos: ['Nome', 'Email', 'Data de nascimento'] },
  ],
  categoriasEspeciais: { aplicavel: false },
  prazoConservacao: '2 anos após o fim do processo de recrutamento.',
  anotacoes: [],
}

export const registoResponsavelCompleto: RegistoResponsavel = {
  id: '22222222-2222-4222-8222-222222222222',
  tipoRegisto: 'responsavel',
  direcao: 'Direção de Recursos Humanos',
  unidadeCoordenacao: 'Unidade de Desenvolvimento Organizacional',
  nomeTratamento: 'Gestão administrativa de colaboradores',
  descricao: 'Processamento de dados de colaboradores para fins de gestão de RH.',
  observacoes: 'Diagrama do processo disponível em anexo (não incluído neste ficheiro).',
  medidasTecnicasOrganizativas: [
    { medida: 'encriptacao' },
    { medida: 'direitos_acesso' },
    { medida: 'formacao_colaboradores' },
    { medida: 'outro', medidaOutra: 'Cláusula de confidencialidade no contrato de trabalho' },
  ],
  transferenciasInternacionais: {
    existem: true,
    paisesOuOrganizacoes: ['Estados Unidos da América'],
    mecanismo: 'cct',
  },
  aipdRealizada: 'nao',
  gestorProjeto: { nome: 'Bruno Fictício', contacto: 'bruno.ficticio@exemplo.pt' },
  finalidades: 'Gestão de contratos de trabalho, processamento salarial e assiduidade.',
  responsavelConjunto: 'N/A',
  representante: 'N/A',
  baseLicitude: 'obrigacao_juridica',
  recolhaDados: 'Formulário de admissão preenchido presencialmente pelo colaborador.',
  categoriasTitulares: ['colaboradores'],
  categoriasDados: [
    { categoria: 'identificacao_civil', tipos: ['Nome', 'Data de nascimento', 'Assinatura'] },
    { categoria: 'identificacao_fiscal', tipos: ['Número de identificação fiscal'] },
    { categoria: 'contratuais_patrimoniais', tipos: ['IBAN', 'Número de conta'] },
  ],
  categoriasEspeciais: {
    aplicavel: true,
    condicoesArt9: ['obrigacoes_direito_laboral'],
    identificar: 'Dados de saúde para efeitos de justificação de faltas por doença.',
  },
  destinatarios: 'Segurança Social, Autoridade Tributária, seguradora de acidentes de trabalho.',
  prazoConservacao: '10 anos após a cessação do contrato de trabalho, por obrigação legal.',
  subcontratantesContratados: [
    {
      nome: 'Processamento de Salários Fictícia, Lda.',
      contacto: 'geral@processamentoficticio.pt',
      dataContrato: '2023-01-15',
    },
  ],
  anotacoes: [
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      campo: 'prazoConservacao',
      texto: 'Confirmar se o prazo de 10 anos tem base legal identificada (ex.: Código do Trabalho).',
      autor: 'DPO Fictício',
      data: '2026-01-16T09:00:00.000Z',
      resolvida: false,
    },
  ],
}

export const registoSubcontratadoMinimo: RegistoSubcontratado = {
  id: '33333333-3333-4333-8333-333333333333',
  tipoRegisto: 'subcontratado',
  direcao: 'Direção de Operações',
  nomeTratamento: 'Alojamento de infraestrutura cloud para cliente terceiro',
  medidasTecnicasOrganizativas: [{ medida: 'ciberseguranca' }],
  transferenciasInternacionais: { existem: false },
  aipdRealizada: 'nao_aplicavel',
  gestorProjeto: { nome: 'Carla Fictícia', contacto: 'carla.ficticia@exemplo.pt' },
  responsaveis: [
    {
      nome: 'Cliente Fictício, S.A.',
      categoriasTratamento: 'Armazenamento e backup de bases de dados de clientes finais.',
    },
  ],
  anotacoes: [],
}

export const registoSubcontratadoCompleto: RegistoSubcontratado = {
  id: '44444444-4444-4444-8444-444444444444',
  tipoRegisto: 'subcontratado',
  direcao: 'Direção de Sistemas de Informação',
  unidadeCoordenacao: 'Unidade de Suporte a Clientes',
  nomeTratamento: 'Serviço de helpdesk em regime de outsourcing',
  descricao: 'Prestação de serviço de apoio técnico a utilizadores finais de clientes.',
  observacoes: 'N/A',
  medidasTecnicasOrganizativas: [
    { medida: 'encriptacao' },
    { medida: 'politicas_internas' },
    { medida: 'due_diligence' },
  ],
  transferenciasInternacionais: {
    existem: true,
    paisesOuOrganizacoes: ['Reino Unido'],
    mecanismo: 'decisao_adequacao',
  },
  aipdRealizada: 'sim',
  gestorProjeto: { nome: 'Diana Fictícia', contacto: 'diana.ficticia@exemplo.pt' },
  responsaveis: [
    {
      nome: 'Cliente Alfa Fictício, Lda.',
      contacto: 'dpo@clientealfaficticio.pt',
      categoriasTratamento: 'Registo e resolução de pedidos de suporte técnico.',
    },
    {
      nome: 'Cliente Beta Fictício, S.A.',
      contacto: 'dpo@clientebetaficticio.pt',
      categoriasTratamento: 'Gestão de tickets e histórico de contactos com utilizadores finais.',
    },
  ],
  anotacoes: [],
}

export const ficheiroRatFixtureValido: FicheiroRat = {
  schemaVersion: 2,
  metadados: {
    equipa: 'Equipa Fictícia de Sistemas de Informação',
    contacto: 'equipa.ficticia@exemplo.pt',
    dataCriacao: '2026-01-15T10:00:00.000Z',
    dataUltimaEdicao: '2026-01-15T10:00:00.000Z',
  },
  registos: [
    registoResponsavelMinimo,
    registoResponsavelCompleto,
    registoSubcontratadoMinimo,
    registoSubcontratadoCompleto,
  ],
}

/** Fixture propositadamente inválida, para testar mensagens de erro do schema. */
export const ficheiroRatFixtureInvalida = {
  schemaVersion: 2,
  metadados: {
    // falta "equipa", que é obrigatório
    dataCriacao: '2026-01-15T10:00:00.000Z',
    dataUltimaEdicao: '2026-01-15T10:00:00.000Z',
  },
  registos: [
    {
      id: 'não-é-um-uuid',
      tipoRegisto: 'responsavel',
      direcao: '',
      nomeTratamento: '',
      medidasTecnicasOrganizativas: [],
      transferenciasInternacionais: { existem: false },
      aipdRealizada: 'talvez',
      gestorProjeto: { nome: '', contacto: '' },
      finalidades: '',
      baseLicitude: 'motivo_inexistente',
      recolhaDados: '',
      categoriasTitulares: [],
      categoriasDados: [],
      categoriasEspeciais: { aplicavel: false },
      prazoConservacao: '',
    },
  ],
}
