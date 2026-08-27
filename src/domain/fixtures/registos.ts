import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { DIRECAO_POR_OMISSAO } from '@/config/organizacao'

/**
 * Dados fictícios (CLAUDE.md §2.7: nunca dados reais no repositório).
 * Servem de fixtures aos testes e de exemplo carregável na aplicação.
 */

export const registoResponsavelMinimo: RegistoResponsavel = {
  id: '11111111-1111-4111-8111-111111111111',
  numero: 1,
  tipoRegisto: 'responsavel',
  estado: 'rascunho',
  direcao: DIRECAO_POR_OMISSAO,
  nomeTratamento: 'Gestão de candidaturas a emprego',
  gestorProjeto: { nome: 'Ana Fictícia' },
}

export const registoResponsavelCompleto: RegistoResponsavel = {
  id: '22222222-2222-4222-8222-222222222222',
  numero: 2,
  tipoRegisto: 'responsavel',
  estado: 'submetido',
  direcao: DIRECAO_POR_OMISSAO,
  unidadeCoordenacao: 'urn',
  nomeTratamento: 'Gestão administrativa de colaboradores',
  descricao:
    'Recolha dos dados de admissão do colaborador, registo no sistema de gestão de recursos humanos, utilização para processamento salarial e assiduidade, partilha com a Segurança Social e a Autoridade Tributária, e conservação em arquivo após a cessação do contrato.',

  // 1. Descrição do Processo / Caracterização
  finalidade: 'Gestão de contratos de trabalho, processamento salarial e controlo de assiduidade.',
  operacoesTratamento:
    'Recolha, registo, validação, organização, conservação, consulta, atualização e partilha com entidades autorizadas.',
  dadosPessoais: 'Nome, NIF, número de segurança social, IBAN, morada, data de nascimento.',
  dadosNecessariosParaFinalidade: 'sim',
  categoriasDados:
    'Dados de identificação\nDados de contacto\nDados profissionais\nDados de saúde (justificação de faltas)',
  categoriasEspeciais: 'sim',
  categoriasEspeciaisNecessarias: 'sim',
  categoriasTitulares: 'Colaboradores',
  entidadesQueEnviamDados: 'Segurança Social (declarações de remunerações anteriores).',
  entidadesParaQuemEnvioDados:
    'Autoridade Tributária; Segurança Social; seguradora de acidentes de trabalho.',
  suportesFisicos: 'Processos individuais em papel.',
  localizacaoSuportesFisicos: 'Arquivo fechado à chave, piso 2.',

  // 2. Ferramentas / Aplicações utilizadas
  ferramentasAplicacoes: 'Sistema fictício de gestão de recursos humanos.',
  numeroCamposComDadosPessoais: { escala: 'baixo', valor: '24' },
  volumeDadosPessoais: { escala: 'medio', valor: 'Cerca de 400 colaboradores.' },
  numeroUtilizadoresComAcesso: { escala: 'baixo', valor: '6' },

  // 3. Subcontratados
  entidadesSubcontratadas: 'Processamento de Salários Fictícia, Lda.',
  operacoesTratamentoSubcontratadas:
    'Processamento salarial e emissão de recibos de vencimento.',
  existeContrato: 'sim',
  contratoComClausulasProtecaoDados: 'sim',
  transferenciasPaisesTerceiros: 'nao',
  auditoriasAoSubcontratado: 'nao',
  pedidoAutorizacaoCnpd: 'nao_aplicavel',

  // 4. Base de Licitude
  baseLicitude:
    'Cumprimento de obrigação jurídica — legislação laboral e de segurança social aplicável ao empregador.',
  consentimentoMecanismosDemonstracao: 'Não aplicável: o tratamento não assenta no consentimento.',
  consentimentoResponsabilidadeParental: 'nao_aplicavel',
  retencaoDefinidaPelaOrganizacao: '10 anos após a cessação do contrato de trabalho.',
  criterioRetencao: 'Prazo de prescrição de créditos laborais e obrigações de conservação fiscal.',
  retencaoPorNormativosLegais: 'Código do Trabalho e legislação fiscal.',

  // 5. Requisitos Funcionais / Direitos dos Titulares
  deverInformar: 'Sim, através da declaração de privacidade entregue no momento da admissão.',
  direitoAcesso: 'Pedido ao GP, resposta no prazo de um mês.',
  direitoRetificacao: 'Sim, via portal do colaborador.',
  direitoApagamento: 'Limitado pelo prazo legal de conservação.',
  direitoPortabilidade: 'Não aplicável: a base de licitude não é o consentimento nem o contrato.',
  direitoLimitacao: 'Possível mediante pedido fundamentado.',
  direitoDecisoesAutomatizadas: 'Não aplicável: não há decisões automatizadas neste tratamento.',
  direitoOposicao: 'Não aplicável: obrigação jurídica.',
  detecaoNotificacaoViolacoes:
    'Procedimento interno de notificação à CNPD no prazo de 72 horas.',

  // 6. Controlos Operacionais
  procedimentosAcessosDocumentados: 'sim',
  procedimentosAcessosImplementados: 'sim',
  acessosFormalmenteAutorizados: 'sim',
  controlosAcessosPrivilegiados: 'sim',
  revisaoPeriodicaAcessos: 'nao',
  remocaoAcessosASaida: 'sim',

  // 7. Observações Gerais
  medidasTecnicasOrganizativas:
    'Encriptação em repouso; gestão de direitos de acesso; formação anual dos colaboradores; cláusula de confidencialidade no contrato de trabalho.',
  normativosAplicaveis: 'Código do Trabalho; legislação de segurança social.',
  aipdRealizada: 'nao',
  gestorProjeto: { nome: 'Bruno Fictício', contacto: 'bruno.ficticio@exemplo.pt' },
  observacoes: 'Revisão periódica de acessos por calendarizar com a equipa de sistemas.',

  anotacoes: [
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      campo: 'revisaoPeriodicaAcessos',
      texto: 'Sem revisão periódica de acessos, indicar até quando fica calendarizada.',
      autor: 'Validador Fictício',
      data: '2026-01-16T09:00:00.000Z',
      resolvida: false,
    },
  ],
}

export const registoSubcontratadoMinimo: RegistoSubcontratado = {
  id: '33333333-3333-4333-8333-333333333333',
  numero: 3,
  tipoRegisto: 'subcontratado',
  estado: 'rascunho',
  direcao: DIRECAO_POR_OMISSAO,
  nomeTratamento: 'Alojamento de infraestrutura cloud para cliente terceiro',
  gestorProjeto: { nome: 'Carla Fictícia' },
}

export const registoSubcontratadoCompleto: RegistoSubcontratado = {
  id: '44444444-4444-4444-8444-444444444444',
  numero: 4,
  tipoRegisto: 'subcontratado',
  estado: 'validado',
  direcao: DIRECAO_POR_OMISSAO,
  unidadeCoordenacao: 'uid',
  nomeTratamento: 'Serviço de helpdesk em regime de outsourcing',
  descricao:
    'Receção de pedidos de suporte no portal do cliente, registo e resolução por conta do responsável pelo tratamento, e eliminação 90 dias após o encerramento do pedido.',

  nomeResponsavelTratamento: 'Cliente Alfa Fictício, Lda.',
  responsavelConjunto: 'N/A',
  finalidade: 'Registo e resolução de pedidos de suporte técnico dos utilizadores do cliente.',
  operacoesTratamento: 'Recolha, registo, consulta, atualização e eliminação.',
  recolhaDados: 'Pedidos submetidos pelos utilizadores finais no portal de suporte do cliente.',
  dadosPessoais: 'Nome, endereço de correio eletrónico, telefone.',
  dadosNecessariosParaFinalidade: 'sim',
  categoriasDados: 'Dados de identificação\nDados de contacto',
  categoriasEspeciais: 'nao',
  categoriasTitulares: 'Clientes; utilizadores de portais e aplicações',
  entidadesQueEnviamDados: 'Cliente Alfa Fictício, Lda.',
  destinatarios: 'Apenas o responsável pelo tratamento por conta de quem se atua.',
  suportesFisicos: 'Nenhum.',
  localizacaoSuportesFisicos: 'N/A',

  ferramentasAplicacoes: 'Plataforma fictícia de gestão de tickets.',
  numeroCamposComDadosPessoais: { escala: 'baixo', valor: '12' },
  volumeDadosPessoais: { escala: 'elevado', valor: 'Milhares de pedidos por ano.' },
  numeroUtilizadoresComAcesso: { escala: 'baixo', valor: '15' },

  entidadesSubcontratadas: 'Centro de Dados Fictício, S.A.',
  operacoesTratamentoSubcontratadas: 'Alojamento da infraestrutura aplicacional.',
  existeContrato: 'sim',
  contratoComClausulasProtecaoDados: 'sim',
  auditoriasAoSubcontratado: 'sim',
  pedidoAutorizacaoCnpd: 'nao_aplicavel',

  transferenciasPaisesTerceiros: 'sim',
  paisesTerceiros: 'Reino Unido (ao abrigo de decisão de adequação).',

  baseLegal: 'Execução de contrato de prestação de serviços com o responsável pelo tratamento.',
  consentimentoMecanismosDemonstracao: 'Não aplicável.',
  consentimentoResponsabilidadeParental: 'nao_aplicavel',
  prazoConservacao: 'Até 90 dias após o encerramento do pedido de suporte.',
  criterioRetencao: 'Prazo contratualmente acordado com o responsável pelo tratamento.',
  retencaoPorNormativosLegais: 'Não aplicável.',

  deverInformar: 'Cumprido pelo responsável pelo tratamento, junto dos seus utilizadores.',
  direitoAcesso: 'Encaminhado para o responsável pelo tratamento no prazo de 5 dias úteis.',
  direitoRetificacao: 'Encaminhado para o responsável pelo tratamento.',
  direitoApagamento: 'Executado a pedido do responsável pelo tratamento.',
  direitoPortabilidade: 'Não aplicável.',
  direitoLimitacao: 'Executado a pedido do responsável pelo tratamento.',
  direitoDecisoesAutomatizadas: 'Não aplicável.',
  direitoOposicao: 'Não aplicável.',
  detecaoNotificacaoViolacoes:
    'Notificação ao responsável pelo tratamento sem demora injustificada, nos termos do art. 33.º/2.',

  procedimentosAcessosDocumentados: 'sim',
  procedimentosAcessosImplementados: 'sim',
  acessosFormalmenteAutorizados: 'sim',
  controlosAcessosPrivilegiados: 'sim',
  revisaoPeriodicaAcessos: 'sim',
  remocaoAcessosASaida: 'sim',

  medidasTecnicasOrganizativas:
    'Encriptação em trânsito e em repouso; políticas internas de proteção de dados; avaliação prévia de subcontratantes.',
  normativosAplicaveis: 'Contratos de prestação de serviços com cada responsável.',
  aipdRealizada: 'sim',
  gestorProjeto: { nome: 'Diana Fictícia', contacto: 'diana.ficticia@exemplo.pt' },
  observacoes: 'Ecossistema documentado no anexo técnico do contrato.',

  anotacoes: [],
  validacao: {
    validadoPor: 'Validador Fictício',
    data: '2026-01-20T11:30:00.000Z',
    observacoes: 'Registo conforme. Rever à data de renovação do contrato.',
  },
}

export const ficheiroRatFixtureValido: FicheiroRat = {
  schemaVersion: 7,
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
  schemaVersion: 7,
  metadados: {
    equipa: '',
    dataCriacao: '2026-01-15T10:00:00.000Z',
    dataUltimaEdicao: '2026-01-15T10:00:00.000Z',
  },
  registos: [
    {
      id: 'nao-e-um-uuid',
      numero: 0,
      tipoRegisto: 'responsavel',
      estado: 'rascunho',
      nomeTratamento: '',
      gestorProjeto: { nome: '' },
    },
  ],
}
