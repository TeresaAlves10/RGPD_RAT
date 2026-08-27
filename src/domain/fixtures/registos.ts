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
  estado: 'rascunho',
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
  criterioPrazoConservacao:
    'Prazo de prescrição de créditos laborais e obrigações de conservação fiscal.',
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
  estado: 'pronto',
  // A matriz de levantamento é parte do formulário do responsável
  // (passos "Caracterização" a "Observações gerais"), não do módulo
  // opcional de avaliação — esse ficou reservado ao subcontratante.
  matriz: {
    caracterizacao: {
      operacoesTratamento:
        'Recolha, registo, organização, conservação, consulta e apagamento de dados de colaboradores.',
      temDadosPessoais: 'sim',
      dadosNecessariosParaFinalidade: 'sim',
      categoriasEspeciaisNecessarias: 'parcial',
      entidadesQueEnviamDados: 'Segurança Social (declarações de remunerações anteriores).',
      entidadesParaQuemEnvioDados: 'Autoridade Tributária; seguradora de acidentes de trabalho.',
      suportesFisicos: 'Processos individuais em papel.',
      localizacaoSuportesFisicos: 'Arquivo fechado à chave, piso 2.',
    },
    ferramentas: {
      ferramentasAplicacoes: 'Sistema fictício de gestão de recursos humanos.',
      numeroCamposComDadosPessoais: '24',
      volumeDadosPessoais: 'Cerca de 400 colaboradores.',
      numeroUtilizadoresComAcesso: '6',
    },
    subcontratados: [
      {
        nome: 'Processamento de Salários Fictícia, Lda.',
        operacoesTratamento: 'Processamento salarial e emissão de recibos de vencimento.',
        existeContrato: 'sim',
        contratoComClausulasProtecaoDados: 'sim',
        transferenciasPaisesTerceiros: 'nao',
        auditoriasAoSubcontratado: 'nao',
        pedidoAutorizacaoCnpd: 'nao_aplicavel',
      },
    ],
    licitudeRetencao: {
      mecanismosDemonstracaoConsentimento: 'nao_aplicavel',
      consentimentoResponsabilidadeParental: 'nao_aplicavel',
      retencaoDefinidaPelaOrganizacao: 'sim',
      retencaoPorNormativosLegais: 'sim',
    },
    normativosAplicaveis: 'Código do Trabalho; legislação de segurança social.',
    diagramaProcesso: 'Diagrama BPMN fictício, arquivado fora desta aplicação.',
    comentarios: 'Revisão periódica de acessos por calendarizar com a equipa de sistemas.',
  },
  // Requisitos funcionais e controlos operacionais são passos 9 e 10 do
  // formulário do responsável, por isso este registo não usa o módulo à parte.
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
  estado: 'rascunho',
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
  // Campos da folha "Subcontratante" que, juridicamente, são obrigações do
  // responsável (art. 30.º/1). Ficam disponíveis a quem os queira registar,
  // mas nunca são requisito — ver schema/subcontratado.ts.
  finalidades: 'Apoio técnico a utilizadores finais, por conta dos clientes.',
  responsavelConjunto: 'N/A',
  representante: 'N/A',
  baseLicitude: 'execucao_contrato',
  recolhaDados: 'Pedidos submetidos pelos utilizadores finais no portal de suporte.',
  categoriasTitulares: ['clientes'],
  categoriasDados: [
    { categoria: 'identificacao_civil', tipos: ['Nome'] },
    { categoria: 'morada_contacto', tipos: ['Endereço de correio eletrónico', 'Telefone'] },
  ],
  categoriasEspeciais: { aplicavel: false },
  destinatarios: 'Apenas o responsável pelo tratamento por conta de quem se atua.',
  prazoConservacao: 'Até 90 dias após o encerramento do pedido de suporte.',
  criterioPrazoConservacao: 'Prazo contratualmente acordado com cada responsável.',
  anotacoes: [],
  estado: 'rascunho',
  // O módulo opcional de avaliação de controlos vive aqui, à parte do RAT.
  avaliacao: {
    requisitosFuncionais: {
      deverInformar: 'nao_aplicavel',
      direitoAcesso: 'sim',
      direitoRetificacao: 'sim',
      direitoApagamento: 'sim',
      direitoPortabilidade: 'nao_aplicavel',
      direitoLimitacao: 'parcial',
      direitoNaoDecisoesAutomatizadas: 'nao_aplicavel',
      direitoOposicao: 'nao_aplicavel',
      detecaoNotificacaoViolacoes: 'sim',
    },
    controlosOperacionais: {
      procedimentosAcessosDocumentados: 'sim',
      procedimentosAcessosImplementados: 'sim',
      acessosFormalmenteAutorizados: 'sim',
      controlosAcessosPrivilegiados: 'sim',
      revisaoPeriodicaAcessos: 'parcial',
      remocaoAcessosASaida: 'sim',
    },
    governoSubcontratacao: {
      existeContrato: 'sim',
      contratoComClausulasProtecaoDados: 'sim',
      auditoriasAoSubcontratado: 'parcial',
      pedidoAutorizacaoCnpd: 'nao_aplicavel',
    },
    governoConsentimento: {
      mecanismosDemonstracaoConsentimento: 'nao_aplicavel',
      consentimentoResponsabilidadeParental: 'nao_aplicavel',
    },
    normativosAplicaveis: 'Contratos de prestação de serviços com cada responsável.',
  },
}

export const ficheiroRatFixtureValido: FicheiroRat = {
  schemaVersion: 4,
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
  schemaVersion: 4,
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
