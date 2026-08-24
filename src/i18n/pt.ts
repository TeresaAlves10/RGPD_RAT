export const textos = {
  app: {
    titulo: 'Registo de Atividades de Tratamento (RGPD)',
    descricao: 'Aplicação de preenchimento de RAT nos termos do art. 30.º do RGPD.',
  },

  navegacao: {
    listaRegistos: 'Registos',
    novoRegisto: 'Novo registo',
  },

  lista: {
    titulo: 'Registos de Atividades de Tratamento',
    semRegistos: 'Ainda não existe nenhum registo neste ficheiro.',
    semRegistosSugestao: 'Cria o primeiro registo para começares.',
    botaoNovoRegisto: '+ Novo registo',
    colunaNome: 'Nome do tratamento',
    colunaTipo: 'Tipo',
    colunaDirecao: 'Direção',
    colunaEstado: 'Estado',
    tipoResponsavel: 'Responsável',
    tipoSubcontratado: 'Subcontratado',
    estadoSemProblemas: 'Sem problemas',
    estadoAvisos: (n: number) => `${n} aviso${n === 1 ? '' : 's'}`,
    estadoErros: (n: number) => `${n} erro${n === 1 ? '' : 's'}`,
    botaoEditar: 'Editar',
    botaoRemover: 'Remover',
    confirmarRemocao: 'Tens a certeza que queres remover este registo? Esta ação não pode ser desfeita.',
    metadadosTitulo: 'Dados da equipa',
    campoEquipa: 'Equipa / Direção responsável pelo ficheiro',
    campoContactoEquipa: 'Contacto (opcional)',
  },

  escolhaTipo: {
    titulo: 'Que tipo de registo queres criar?',
    descricao:
      'O RGPD pede conteúdo diferente consoante a qualidade em que a organização atua neste tratamento.',
    responsavelTitulo: 'Responsável pelo Tratamento',
    responsavelDescricao:
      'Art. 30.º/1 — a organização determina as finalidades e os meios do tratamento.',
    subcontratadoTitulo: 'Subcontratado',
    subcontratadoDescricao: 'Art. 30.º/2 — a organização trata dados por conta de outro responsável.',
    botaoContinuar: 'Continuar',
    botaoCancelar: 'Cancelar',
  },

  formulario: {
    ajudaLegal: (base: string) => `Fundamentação legal (${base})`,
    botaoAnterior: 'Anterior',
    botaoSeguinte: 'Seguinte',
    botaoGuardar: 'Guardar registo',
    botaoCancelar: 'Cancelar',
    obrigatorio: 'Campos assinalados com * são obrigatórios.',
    passo: (atual: number, total: number) => `Passo ${atual} de ${total}`,
    outroEspecificar: 'Outro (especificar)',
    adicionar: 'Adicionar',
    remover: 'Remover',
    simNao: { sim: 'Sim', nao: 'Não' },
    avisosTitulo: 'Avisos e verificações adicionais',
    avisosDescricao:
      'Estas verificações não impedem guardar o registo, mas convém rever antes de exportar.',
  },

  campos: {
    direcao: 'Direção / Área / Serviço',
    unidadeCoordenacao: 'Unidade de Coordenação',
    nomeTratamento: 'Nome do tratamento / processo',
    descricao: 'Descrição do processo',
    observacoes: 'Observações',
    'gestorProjeto.nome': 'Nome do Gestor de Projeto (GP)',
    'gestorProjeto.contacto': 'Contacto do GP',
    medidasTecnicasOrganizativas: 'Medidas técnicas e organizativas implementadas',
    'transferenciasInternacionais.existem':
      'Os dados pessoais são transferidos para países terceiros ou organizações internacionais?',
    'transferenciasInternacionais.paisesOuOrganizacoes': 'País(es) ou organização(ões) de destino',
    'transferenciasInternacionais.mecanismo': 'Mecanismo de garantia da transferência',
    'transferenciasInternacionais.mecanismoOutro': 'Especifica o mecanismo',
    aipdRealizada: 'Foi realizada AIPD para SI/BD?',

    finalidades: 'Finalidade(s) do tratamento de dados pessoais',
    responsavelConjunto: 'Responsável conjunto pelo tratamento (identificar ou N/A)',
    representante: 'Representante do responsável pelo tratamento (identificar ou N/A)',
    baseLicitude: 'Base de licitude do tratamento',
    recolhaDados: 'Como é efetuada a recolha dos dados',
    categoriasTitulares: 'Categorias de titulares dos dados',
    categoriasTitularesOutra: 'Especifica a categoria de titulares',
    categoriasDados: 'Categorias e tipos de dados pessoais tratados',
    'categoriasEspeciais.aplicavel': 'Existem categorias especiais de dados pessoais (art. 9.º)?',
    'categoriasEspeciais.condicoesArt9': 'Condição do art. 9.º/2 aplicável',
    'categoriasEspeciais.identificar': 'Identifica as categorias especiais de dados tratadas',
    destinatarios: 'Destinatários ou categorias de destinatários',
    prazoConservacao: 'Prazo de conservação dos dados pessoais',
    subcontratantesContratados: 'Subcontratantes contratados pela organização (art. 28.º)',

    responsaveis: 'Responsáveis por conta de quem a organização atua',
    'responsaveis.nome': 'Nome do responsável pelo tratamento',
    'responsaveis.contacto': 'Contacto (opcional)',
    'responsaveis.categoriasTratamento': 'Categorias de tratamento efetuadas por conta deste responsável',

    'subcontratante.nome': 'Nome do subcontratante',
    'subcontratante.contacto': 'Contacto (opcional)',
    'subcontratante.dataContrato': 'Data do contrato (AAAA-MM-DD, opcional)',

    'categoriaDados.categoria': 'Categoria de dados',
    'categoriaDados.categoriaOutra': 'Especifica a categoria',
    'categoriaDados.tipos': 'Tipos de dados (um por linha)',
  },

  aipd: {
    sim: 'Sim',
    nao: 'Não',
    nao_aplicavel: 'Não aplicável',
  },

  passos: {
    identificacao: 'Identificação',
    finalidadeBase: 'Finalidade e base de licitude',
    titularesDados: 'Titulares e dados',
    destinatariosTransferencias: 'Destinatários e transferências',
    conservacaoSeguranca: 'Conservação e segurança',
    subcontratantesObservacoes: 'Subcontratantes e observações',
    responsaveisPorConta: 'Responsáveis por conta de quem se atua',
    transferencias: 'Transferências internacionais',
    segurancaObservacoes: 'Segurança e observações',
  },

  rascunho: {
    tituloDialogo: 'Rascunho encontrado',
    mensagem: (data: string) => `Encontrámos um rascunho de ${data}. Continuar ou começar de novo?`,
    botaoContinuar: 'Continuar rascunho',
    botaoComecarNovo: 'Começar de novo',
    botaoLimpar: 'Limpar rascunho local',
    confirmarLimpeza: 'Tens a certeza que queres limpar o rascunho guardado neste browser? Esta ação não pode ser desfeita.',
    aviso: 'O rascunho é guardado apenas no teu browser (localStorage), nunca enviado para nenhum servidor.',
  },
} as const
