import type { FicheiroRat } from '@/domain/schema/ficheiro'
import type { RegistoResponsavel } from '@/domain/schema/responsavel'
import type { RegistoSubcontratado } from '@/domain/schema/subcontratado'

/**
 * Dados fictícios (CLAUDE.md §2.7: nunca dados reais no repositório).
 * Servem de fixtures aos testes e de exemplo carregável na aplicação.
 */

export const registoResponsavelMinimo: RegistoResponsavel = {
  id: '11111111-1111-4111-8111-111111111111',
  tipoRegisto: 'responsavel',
  estado: 'rascunho',
  direcao: 'Direção de Sistemas de Informação',
  nomeTratamento: 'Gestão de candidaturas a emprego',
  gestorProjeto: { nome: 'Ana Fictícia' },
}

export const registoResponsavelCompleto: RegistoResponsavel = {
  id: '22222222-2222-4222-8222-222222222222',
  tipoRegisto: 'responsavel',
  estado: 'submetido',
  direcao: 'Direção de Recursos Humanos',
  unidadeCoordenacao: 'Unidade de Desenvolvimento Organizacional',
  nomeTratamento: 'Gestão administrativa de colaboradores',
  descricao:
    'Processamento de dados de colaboradores para gestão contratual, salarial e de assiduidade.',
  gestorProjeto: { nome: 'Bruno Fictício', contacto: 'bruno.ficticio@exemplo.pt' },

  // 1. Descrição do Processo / Caracterização
  finalidade: 'Gestão de contratos de trabalho, processamento salarial e controlo de assiduidade.',
  operacoesTratamento:
    'Recolha, registo, organização, conservação, consulta, alteração e apagamento.',
  trataDadosPessoais: 'sim',
  dadosNecessariosParaFinalidade: 'sim',
  categoriasEspeciais: {
    aplicavel: 'sim',
    identificar: 'Dados de saúde, para justificação de faltas por doença.',
  },
  categoriasEspeciaisNecessarias: 'sim',
  categoriasTitulares: ['colaboradores'],
  categoriasDados: [
    { categoria: 'identificacao_civil', tipos: ['Nome', 'Data de nascimento', 'Assinatura'] },
    { categoria: 'identificacao_fiscal', tipos: ['Número de identificação fiscal'] },
    { categoria: 'contratuais_patrimoniais', tipos: ['IBAN'] },
  ],
  entidadesQueEnviamDados: 'Segurança Social (declarações de remunerações anteriores).',
  entidadesParaQuemEnvioDados:
    'Autoridade Tributária; Segurança Social; seguradora de acidentes de trabalho.',
  suportesFisicos: 'Processos individuais em papel.',
  localizacaoSuportesFisicos: 'Arquivo fechado à chave, piso 2.',

  // 2. Ferramentas / Aplicações
  ferramentasAplicacoes: 'Sistema fictício de gestão de recursos humanos.',
  numeroCamposComDadosPessoais: '24',
  volumeDadosPessoais: 'Cerca de 400 colaboradores.',
  numeroUtilizadoresComAcesso: '6',

  // 3. Subcontratados
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

  // 4. Base de Licitude
  baseLicitude: 'obrigacao_juridica',
  retencaoDefinidaPelaOrganizacao: 'sim',
  retencaoPorNormativosLegais: 'sim',

  // 5. Requisitos Funcionais / Direitos dos Titulares
  deverInformar: 'sim',
  direitoAcesso: 'sim',
  direitoRetificacao: 'sim',
  direitoApagamento: 'parcial',
  direitoPortabilidade: 'nao_aplicavel',
  direitoLimitacao: 'parcial',
  direitoDecisoesAutomatizadas: 'nao_aplicavel',
  direitoOposicao: 'sim',
  detecaoNotificacaoViolacoes: 'sim',

  // 6. Controlos Operacionais
  procedimentosAcessosDocumentados: 'sim',
  procedimentosAcessosImplementados: 'sim',
  acessosFormalmenteAutorizados: 'sim',
  controlosAcessosPrivilegiados: 'parcial',
  revisaoPeriodicaAcessos: 'nao',
  remocaoAcessosASaida: 'sim',

  // 7. Observações Gerais
  medidasTecnicasOrganizativas: [
    { medida: 'encriptacao' },
    { medida: 'direitos_acesso' },
    { medida: 'formacao_colaboradores' },
    { medida: 'outro', medidaOutra: 'Cláusula de confidencialidade no contrato de trabalho' },
  ],
  normativosAplicaveis: 'Código do Trabalho; legislação de segurança social.',
  diagramaProcesso: 'Diagrama BPMN fictício, arquivado fora desta aplicação.',
  aipdRealizada: 'nao',
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
  tipoRegisto: 'subcontratado',
  estado: 'rascunho',
  direcao: 'Direção de Operações',
  nomeTratamento: 'Alojamento de infraestrutura cloud para cliente terceiro',
  gestorProjeto: { nome: 'Carla Fictícia' },
}

export const registoSubcontratadoCompleto: RegistoSubcontratado = {
  id: '44444444-4444-4444-8444-444444444444',
  tipoRegisto: 'subcontratado',
  estado: 'validado',
  direcao: 'Direção de Sistemas de Informação',
  unidadeCoordenacao: 'Unidade de Suporte a Clientes',
  nomeTratamento: 'Serviço de helpdesk em regime de outsourcing',
  descricao: 'Apoio técnico a utilizadores finais, por conta de clientes da organização.',
  gestorProjeto: { nome: 'Diana Fictícia', contacto: 'diana.ficticia@exemplo.pt' },

  nomeResponsavelTratamento: 'Cliente Alfa Fictício, Lda.',
  finalidade: 'Registo e resolução de pedidos de suporte técnico dos utilizadores do cliente.',
  responsavelConjunto: 'N/A',
  baseLegal: 'execucao_contrato',
  recolhaDados: 'Pedidos submetidos pelos utilizadores finais no portal de suporte do cliente.',
  categoriasTitulares: ['clientes'],
  categoriasDados: [
    { categoria: 'identificacao_civil', tipos: ['Nome'] },
    { categoria: 'morada_contacto', tipos: ['Endereço de correio eletrónico', 'Telefone'] },
  ],
  categoriasEspeciais: { aplicavel: 'nao' },
  destinatarios: 'Apenas o responsável pelo tratamento por conta de quem se atua.',
  transferencias: { existem: 'sim', identificar: 'Reino Unido (decisão de adequação)' },
  prazoConservacao: 'Até 90 dias após o encerramento do pedido de suporte.',
  medidasTecnicasOrganizativas: [
    { medida: 'encriptacao' },
    { medida: 'politicas_internas' },
    { medida: 'due_diligence' },
  ],
  outrosSubcontratantes: [
    {
      nome: 'Centro de Dados Fictício, S.A.',
      contacto: 'dpo@centrodadosficticio.pt',
      dataContrato: '2024-03-01',
    },
  ],
  aipdRealizada: 'sim',
  observacoes: 'Ecossistema documentado no anexo técnico do contrato.',
  diagramaEcosistema: 'Diagrama de ecossistema fictício, arquivado fora desta aplicação.',
  anotacoes: [],
  validacao: {
    validadoPor: 'Validador Fictício',
    data: '2026-01-20T11:30:00.000Z',
    observacoes: 'Registo conforme. Rever à data de renovação do contrato.',
  },
}

export const ficheiroRatFixtureValido: FicheiroRat = {
  schemaVersion: 5,
  metadados: {
    equipa: 'Equipa Fictícia de Sistemas de Informação',
    contacto: 'equipa.ficticia@exemplo.pt',
    organizacao: 'Organização Fictícia',
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
  schemaVersion: 5,
  metadados: {
    equipa: '',
    dataCriacao: '2026-01-15T10:00:00.000Z',
    dataUltimaEdicao: '2026-01-15T10:00:00.000Z',
  },
  registos: [
    {
      id: 'nao-e-um-uuid',
      tipoRegisto: 'responsavel',
      estado: 'rascunho',
      direcao: '',
      nomeTratamento: '',
      gestorProjeto: { nome: '' },
    },
  ],
}
