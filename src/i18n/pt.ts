export const textos = {
  app: {
    marca: 'RAT',
    titulo: 'Registo de Atividades de Tratamento (RGPD)',
    descricao: 'Aplicação de preenchimento de RAT nos termos do art. 30.º do RGPD.',
    subtitulo: 'Registo de Atividades de Tratamento',
    rascunhoGuardado: 'Guardado neste computador',
    rodape:
      'Nada do que escreves aqui sai deste computador. Só os ficheiros que exportares, e só quando os enviares.',
  },

  inicio: {
    etiqueta: 'Artigo 30.º do RGPD',
    titulo: 'Registo de Atividades de Tratamento, mantido e validado num só sítio',
    subtitulo:
      'Substitui a folha de cálculo por um registo estruturado, com validação das regras de negócio, circuito de submissão e validação, e exportação para Excel e PDF.',
    botaoEntrar: 'Aceder aos registos',
    botaoNovoRegisto: 'Criar um registo',
    destaquesTitulo: 'O que a aplicação faz',
    matrizTitulo: 'Matriz completa',
    matrizTexto:
      'Todos os campos da matriz RAT organizados por secções: descrição do processo, ferramentas, subcontratados, base de licitude, requisitos funcionais e controlos operacionais.',
    circuitoTitulo: 'Circuito de validação',
    circuitoTexto:
      'O Gestor de Projeto submete o registo; o validador corrige qualquer campo e valida, ou devolve para correção.',
    importarTitulo: 'Importar e exportar',
    importarTexto:
      'Importa a matriz que já existe em Excel e exporta a lista consolidada em Excel e PDF, pronta a arquivar ou a enviar.',
    privacidadeTitulo: 'Os dados não saem do teu computador',
    privacidadeTexto:
      'Não há servidor nem base de dados: o preenchimento acontece no browser e só sai deste computador nos ficheiros que exportares, quando os enviares. É por isso que não há contas nem palavras-passe.',
  },

  navegacao: {
    inicio: 'Início',
    listaRegistos: 'Registos',
    novoRegisto: 'Novo registo',
    ajuda: 'Ajuda',
    principal: 'Navegação principal',
  },

  ajuda: {
    titulo: 'Guia de utilização',
    seccoes: [
      {
        titulo: '1. Quem faz o quê',
        paragrafos: [
          'O Gestor de Projeto (GP) cria o registo, preenche-o e submete-o para validação. O validador revê, corrige o que for preciso, e valida — ou devolve ao GP para correção.',
          'Não há contas nem servidor: o estado do registo (Rascunho, Submetido, Devolvido, Validado) viaja dentro do ficheiro. "Submeter" é marcar o registo e enviar o ficheiro exportado ao validador; "validar" é o validador fazer o mesmo no sentido inverso.',
        ],
      },
      {
        titulo: '2. Preencher um registo',
        paragrafos: [
          'Em "Registos", clica em "+ Novo registo" e escolhe se a organização atua como Responsável pelo Tratamento (art. 30.º/1) ou como Subcontratante (art. 30.º/2) — os dois pedem campos diferentes.',
          'O formulário do responsável está dividido nas sete secções do levantamento: Descrição do Processo / Caracterização, Ferramentas / Aplicações, Subcontratados, Base de Licitude, Requisitos Funcionais / Direitos dos Titulares, Controlos Operacionais e Observações Gerais.',
          'Navega entre secções clicando nas abas ou com as setas do teclado. Campos com * são obrigatórios para submeter a validação — não para guardar.',
          'Junto de vários campos há a fundamentação legal (artigo do RGPD relevante), sempre visível na coluna da direita.',
          'Algumas perguntas só aparecem quando fazem sentido: as duas do consentimento só surgem se a base de licitude for o consentimento, e a identificação das categorias especiais só se tiveres respondido que existem.',
        ],
      },
      {
        titulo: '3. Submeter para validação',
        paragrafos: [
          'O painel do estado, à esquerda do formulário, mostra quantos campos obrigatórios faltam. Enquanto faltar algum, "Submeter para validação" fica indisponível.',
          'Guardar e exportar nunca são bloqueados — só a submissão. Podes sair a meio do preenchimento sem perder nada.',
          'Depois de submeter, exporta o ficheiro e envia-o ao validador.',
        ],
      },
      {
        titulo: '4. Rascunho local',
        paragrafos: [
          'O ficheiro em edição é guardado automaticamente no browser (localStorage) cerca de 1 segundo depois de cada alteração — nunca é enviado para nenhum servidor.',
          'Ao reabrir a aplicação com um rascunho guardado, é sempre pedida confirmação explícita antes de o carregar.',
          'Usa "Limpar rascunho local" no cabeçalho para apagar este rascunho a qualquer momento.',
        ],
      },
      {
        titulo: '5. Exportar e importar',
        paragrafos: [
          'Excel: uma folha por qualidade (Responsável e Subcontratante), com os campos na mesma ordem do formulário, mais uma folha "Listas" com os vocabulários e uma folha oculta com o ficheiro completo — é essa que permite voltar a importar sem perder nada.',
          'PDF: para apresentação e arquivo, uma secção por registo, com as anotações do validador e o sumário de verificações. Não é reimportável.',
          'JSON: o formato de troca entre a equipa e o validador. É o mais fiável para reimportar e continuar a editar.',
          '"Importar" aceita um JSON ou Excel exportado por esta aplicação e substitui o ficheiro em edição (pede confirmação se já tiveres registos).',
          '"Template antigo" lê o Excel anterior e mostra um relatório com os campos mapeados e os que ficam por preencher — o texto original desses fica guardado nas observações do registo.',
        ],
      },
      {
        titulo: '6. Modo validador',
        paragrafos: [
          'Importa um ou mais ficheiros recebidos das equipas de uma vez. O resumo mostra, por ficheiro, o número de registos, erros e avisos.',
          '"Ver detalhe" abre os registos, com as verificações do motor de regras e espaço para anotar o que precisa de correção — geral ou associado a um campo.',
          'Escreve o teu nome em "Validado por" antes de validares: fica registado no ficheiro com a data.',
          'Em cada registo podes "Validar registo" ou "Devolver para correção". Para corrigires tu próprio os campos, usa "Corrigir no formulário" — carrega o ficheiro no formulário de preenchimento, onde tens o formulário completo.',
          'No fim, exporta o ficheiro anotado e envia de volta à equipa — as anotações e o estado viajam dentro do ficheiro.',
        ],
      },
    ],
  },

  lista: {
    titulo: 'Registos de Atividades de Tratamento',
    semRegistos: 'Ainda não existe nenhum registo neste ficheiro.',
    semRegistosSugestao: 'Cria o primeiro registo para começares.',
    botaoNovoRegisto: '+ Novo registo',
    botaoPrimeiroRegisto: 'Criar o primeiro registo',
    botaoCarregarExemplo: 'Carregar exemplo',
    confirmarCarregarExemplo:
      'Isto substitui os registos e os dados da equipa atuais por um exemplo fictício, pronto a explorar. Continuar?',
    colunaNome: 'Nome do tratamento',
    colunaTipo: 'Tipo',
    colunaDirecao: 'Direção',
    colunaEstado: 'Estado',
    tipoResponsavel: 'Responsável',
    tipoSubcontratado: 'Subcontratado',
    estadoSemProblemas: 'Sem problemas',
    estadoAvisos: (n: number) => `${n} aviso${n === 1 ? '' : 's'}`,
    estadoErros: (n: number) => `${n} erro${n === 1 ? '' : 's'}`,
    estadoAnotacoes: (n: number) => `${n} anotação${n === 1 ? '' : 'ões'} do validador`,
    botaoEditar: 'Editar',
    botaoRemover: 'Remover',
    confirmarRemocao: 'Tens a certeza que queres remover este registo? Esta ação não pode ser desfeita.',
    metadadosTitulo: 'Dados da equipa',
    campoEquipa: 'Direção responsável pelo ficheiro',
    campoContactoEquipa: 'Contacto (opcional)',
    subtitulo: (n: number) => `${n} registo${n === 1 ? '' : 's'} · artigo 30.º do RGPD`,
    pesquisar: 'Pesquisar por nome, unidade ou direção',
    filtroTodosEstados: 'Todos os estados',
    filtroTodasCompletudes: 'Completos e incompletos',
    filtroTodasQualidades: 'Todas as qualidades',
    filtroTodasDirecoes: 'Todas as direções',
    estadoCompleto: 'Completo',
    estadoIncompleto: 'Por completar',
    colunaUnidade: 'Unidade de Coordenação',
    colunaCamposEmFalta: 'Campos em falta',
    semResultados: 'Nenhum registo corresponde aos filtros aplicados.',
    limparFiltros: 'Limpar filtros',
    resumoProntos: (n: number) => `${n} sem problemas`,
    resumoAvisos: (n: number) => `${n} com avisos`,
    resumoErros: (n: number) => `${n} por completar`,
    atencaoTitulo: 'Precisa da tua atenção',
    atencaoDescricao: 'Tem de estar preenchido para submeteres o registo a validação.',
    atencaoResolver: 'Resolver',
  },

  escolhaTipo: {
    titulo: 'Em que qualidade atua a organização neste tratamento?',
    descricao:
      'A resposta muda o que o RGPD obriga a registar — por isso o formulário é diferente nos dois casos.',
    responsavelEtiqueta: 'Responsável pelo Tratamento',
    responsavelDescricao:
      'A pessoa singular ou coletiva, a autoridade pública, o serviço ou outro organismo que, individualmente ou em conjunto com outras, determina as finalidades e os meios de tratamento dos dados pessoais.',
    responsavelBaseLegal: 'Artigo 4.º, n.º 7',
    subcontratadoEtiqueta: 'Subcontratante',
    subcontratadoDescricao:
      'A pessoa singular ou coletiva, a autoridade pública, o serviço ou outro organismo que trate os dados pessoais por conta do responsável pelo tratamento.',
    subcontratadoBaseLegal: 'Artigo 4.º, n.º 8',
    colunaConceito: 'Conceito',
    colunaDefinicao: 'Definição',
    colunaRgpd: 'RGPD',
    botaoContinuar: 'Continuar',
    botaoCancelar: 'Cancelar',
  },

  formulario: {
    ajudaLegal: (base: string) => `Fundamentação legal (${base})`,
    ajudaVerTudo: 'Ver texto completo',
    ajudaVerMenos: 'Ver menos',
    passosAria: 'Secções do formulário',
    seccoes: 'Secções',
    porRever: 'Por rever',
    notaRascunho: 'Podes sair a meio. Nada se perde e nada é enviado.',
    notaConsentimento:
      'Estas duas perguntas só se aplicam porque a base de licitude escolhida é o consentimento (art. 7.º e art. 8.º).',
    notaSubcontratados:
      'Acrescenta uma entrada por cada entidade subcontratada. Se não houver nenhuma, deixa a lista vazia.',
    botaoAnterior: 'Anterior',
    botaoSeguinte: 'Seguinte',
    botaoGuardar: 'Guardar registo',
    botaoCancelar: 'Cancelar',
    obrigatorio: 'Campos assinalados com * são obrigatórios para submeter o registo a validação.',
    passo: (atual: number, total: number) => `Passo ${atual} de ${total}`,
    outroEspecificar: 'Outro (especificar)',
    adicionar: 'Adicionar',
    remover: 'Remover',
    porResponder: 'Por responder',
    avisosTitulo: 'Verificações',
    avisosDescricao:
      'Nada disto impede guardar ou exportar. Impede apenas submeter o registo a validação.',
  },

  campos: {
    // Comuns
    numero: 'ID',
    direcao: 'Nome da Direção',
    unidadeCoordenacao: 'Nome da Unidade de Coordenação',
    nomeTratamento: 'Nome Tratamento / Processo',
    descricao: 'Descrição do Processo',
    'gestorProjeto.nome': 'Nome do Gestor de Projeto (GP)',
    'gestorProjeto.contacto': 'Contacto do GP',
    medidasTecnicasOrganizativas: 'Medidas Técnicas e Organizativas implementadas',
    normativosAplicaveis: 'Quais os normativos legais ou regulamentares aplicáveis?',
    anexos: 'Documentos importantes',
    aipdRealizada: 'Foi realizada AIPD?',
    observacoes: 'Observações',

    // 1. Descrição do Processo / Caracterização
    finalidade: 'Qual a finalidade?',
    operacoesTratamento: 'Quais as operações de tratamento?',
    dadosPessoais: 'Dados pessoais',
    dadosNecessariosParaFinalidade: 'Todos os dados pessoais são necessários para a finalidade?',
    categoriasDados: 'Categorias de dados',
    categoriasEspeciais: 'São tratadas categorias especiais?',
    categoriasEspeciaisNecessarias:
      'Todas as categorias especiais de dados são necessárias para a finalidade?',
    categoriasTitulares: 'Qual a categoria de titular dos dados?',
    entidadesQueEnviamDados:
      'Quem são as entidades que me enviam dados pessoais para além do titular dos dados pessoais?',
    entidadesParaQuemEnvioDados:
      'Quem são as entidades a quem envio dados pessoais para além do seu titular?',
    suportesFisicos:
      'Lista de suportes físicos existentes que contêm dados pessoais (e.g. papel, disco externo)',
    localizacaoSuportesFisicos: 'Localização dos dados pessoais em suporte físico',

    // 2. Ferramentas / Aplicações utilizadas
    ferramentasAplicacoes: 'Ferramentas / Aplicações utilizadas',
    numeroCamposComDadosPessoais: 'N.º de campos que contêm dados pessoais',
    volumeDadosPessoais: 'Volume de dados pessoais',
    numeroUtilizadoresComAcesso: 'N.º de utilizadores com acesso a dados pessoais',

    // 3. Subcontratados
    entidadesSubcontratadas: 'Entidades Subcontratadas',
    operacoesTratamentoSubcontratadas: 'Quais as operações de tratamento?',
    existeContrato: 'Existe contrato com a entidade que fornece dados pessoais?',
    contratoComClausulasProtecaoDados:
      'O contrato contém cláusulas específicas sobre a privacidade e proteção de dados pessoais?',
    anexosContrato: 'Anexar contrato ou cláusulas',
    transferenciasPaisesTerceiros:
      'Os dados pessoais são transferidos para países terceiros fora da União Europeia?',
    paisesTerceiros: 'Para que país ou países?',
    auditoriasAoSubcontratado:
      'São realizadas auditorias/inspeções para validar que o subcontratado cumpre com as obrigações previstas?',
    pedidoAutorizacaoCnpd: 'Foi efetuado pedido de autorização/notificação à CNPD?',

    // 4. Base de Licitude
    baseLicitude: 'Qual é a base de licitude?',
    baseLegal: 'Qual é a base legal do tratamento?',
    consentimentoMecanismosDemonstracao:
      'Existem mecanismos para demonstrar a qualquer momento que o titular dos dados deu o seu consentimento?',
    consentimentoResponsabilidadeParental:
      'No caso de tratamentos de dados de menores de idade, o consentimento é obtido diretamente aos titulares da responsabilidade parental da criança?',
    retencaoDefinidaPelaOrganizacao: (organizacao: string) =>
      `Está definido um período de retenção dos dados pessoais pela ${organizacao}?`,
    criterioRetencao: (organizacao: string) =>
      `Está definido algum critério de retenção dos dados pessoais pela ${organizacao}?`,
    retencaoPorNormativosLegais:
      'Está estabelecido um período de retenção dos dados pessoais por normativos legais ou regulamentares?',

    // 5. Requisitos Funcionais / Direitos dos Titulares
    deverInformar: 'Foi exercido, antes do início do tratamento, o "dever de informar"?',
    direitoAcesso: 'Capacidade de exercer o "Direito de acesso"',
    direitoRetificacao: 'Capacidade de exercer o "Direito de retificação"',
    direitoApagamento: 'Capacidade de exercer o "Direito ao apagamento (esquecimento)"',
    direitoPortabilidade: 'Capacidade de exercer o "Direito à portabilidade"',
    direitoLimitacao: 'Capacidade de exercer o "Direito à Limitação do Tratamento"',
    direitoDecisoesAutomatizadas:
      'Capacidade de exercer o "Direito a não ficar sujeito a decisões individuais automatizadas, incluindo definição de perfis"',
    direitoOposicao: 'Capacidade de exercer o "Direito de Oposição"',
    detecaoNotificacaoViolacoes: 'Capacidade de detetar e notificar data breaches?',

    // 6. Controlos Operacionais
    procedimentosAcessosDocumentados:
      'Os procedimentos de gestão de acessos encontram-se documentados?',
    procedimentosAcessosImplementados:
      'Os procedimentos de gestão de acessos estão implementados / operacionalizados? (e.g. pedido, alteração, remoção)',
    acessosFormalmenteAutorizados: 'Os acessos são formalmente solicitados e devidamente autorizados?',
    controlosAcessosPrivilegiados:
      'Existem controlos sobre os utilizadores com acessos privilegiados e/ou genéricos? (e.g. revisões periódicas sobre as ações realizadas pelo utilizador)',
    revisaoPeriodicaAcessos: 'É realizada uma revisão periódica dos acessos dos utilizadores?',
    remocaoAcessosASaida: 'É feita a remoção de acessos após a saída de um colaborador?',

    // Subcontratante
    nomeResponsavelTratamento: 'Nome do Responsável pelo Tratamento',
    recolhaDados: 'Recolha dos dados (como é efetuada)',
    prazoConservacao: 'Prazo de conservação dos dados pessoais',
    existemOutrosSubcontratantes: 'Existem outros subcontratantes? (artigo 28.º do RGPD)',
  },


  estado: {
    etiqueta: 'Estado',
    rascunho: 'Rascunho',
    submetido: 'Submetido para validação',
    devolvido: 'Devolvido para correção',
    validado: 'Validado',
    rascunhoDescricao: 'Em preenchimento pelo Gestor de Projeto.',
    submetidoDescricao: 'O GP deu por concluído e enviou para validação.',
    devolvidoDescricao: 'O validador pediu correções ao GP antes de validar.',
    validadoDescricao: 'O validador reviu e deu como validado.',
    submeter: 'Submeter para validação',
    submeterBloqueado: 'Preenche os campos obrigatórios para submeter',
    devolver: 'Devolver para correção',
    validar: 'Validar registo',
    reabrir: 'Reabrir para edição',
    campoValidadoPor: 'Validado por',
    campoObservacoesValidacao: 'Observações do validador (opcional)',
    validadoEm: (quem: string, data: string) => `Validado por ${quem} em ${data}`,
    filtroTodos: 'Todos os estados',
    aviso:
      'O estado é um marcador dentro do ficheiro: viaja no Excel/JSON exportado e não depende de servidor nem de contas. "Submeter" é marcar o registo e enviar o ficheiro ao validador.',
  },


  respostas: {
    porResponder: 'Por responder',
    sim: 'Sim',
    nao: 'Não',
    nao_aplicavel: 'Não aplicável',
    nao_sei: 'Não sei',
  },

  escala: {
    porResponder: 'Por responder',
    baixo: 'Baixo (dezenas)',
    medio: 'Médio (centenas)',
    elevado: 'Elevado (milhares)',
    /** Campo livre ao lado da escala, para o número ou a nota exata. */
    valorRotulo: 'Número ou nota (opcional)',
    valorPlaceholder: 'ex.: 24',
  },

  totais: {
    titulo: 'Totais',
    total: 'Total de registos',
    totalDescricao: 'RAT no ficheiro aberto.',
    responsavel: 'Como Responsável',
    responsavelDescricao: 'Registos do art. 30.º/1.',
    subcontratante: 'Como Subcontratante',
    subcontratanteDescricao: 'Registos do art. 30.º/2.',
    emValidacao: 'Em validação',
    emValidacaoDescricao: 'Submetidos ou devolvidos para correção.',
    validados: 'Validados',
    validadosDescricao: 'Revistos e dados como válidos.',
    comAipd: 'Com AIPD',
    comAipdDescricao: 'Com avaliação de impacto realizada.',
    nota: 'Contagens sobre o ficheiro aberto neste computador. Nada é guardado num servidor.',
  },

  anexos: {
    adicionar: 'Anexar ficheiro',
    descarregar: 'Descarregar',
    nota: (porFicheiro: string, total: string) =>
      `Aceita imagem, PDF, Word e texto. Máximo ${porFicheiro} por ficheiro e ${total} por registo — os anexos viajam dentro do ficheiro exportado, por isso convém mantê-los pequenos.`,
    erroFicheiroGrande: (nome: string) => `"${nome}" é demasiado grande e não foi anexado.`,
    erroTotalGrande: 'Foi atingido o limite de anexos deste registo.',
    semAnexos: 'Sem anexos.',
    contagem: (n: number) => `${n} anexo${n === 1 ? '' : 's'}`,
  },

  passos: {
    // Responsável — as sete secções da especificação.
    caracterizacao: 'Descrição do Processo / Caracterização',
    ferramentas: 'Ferramentas / Aplicações utilizadas',
    subcontratados: 'Subcontratados',
    baseLicitude: 'Base de Licitude',
    requisitosFuncionais: 'Requisitos Funcionais / Direitos dos Titulares',
    controlosOperacionais: 'Controlos Operacionais',
    observacoesGerais: 'Observações Gerais',

    // Subcontratante — lista mais curta, cinco secções (art. 30.º/2
    // exige menos do que o art. 30.º/1).
    subIdentificacao: 'Identificação',
    subTratamentoBaseLegal: 'Tratamento e base legal',
    subTitularesDados: 'Titulares e dados',
    subTransferenciasConservacao: 'Transferências e conservação',
    subSegurancaObservacoes: 'Segurança e observações',
  },

  importar: {
    titulo: 'Importar',
    botaoImportar: 'JSON ou Excel',
    botaoImportarLegado: 'Template antigo',
    aImportar: 'A importar…',
    confirmarSubstituicao:
      'Já existem registos neste ficheiro. Importar vai substituí-los por completo. Continuar?',
    erroGenerico: 'Não foi possível importar este ficheiro. Confirma que é um JSON ou Excel válido.',
    tituloRelatorio: 'Relatório de importação do template antigo',
    descricaoRelatorio:
      'Os campos assinalados como "por preencher" usam vocabulários fechados que o template antigo não tinha — revê e completa cada registo no formulário. O texto original desses campos foi guardado nas observações.',
    colunaLinha: 'Linha',
    colunaNome: 'Nome do tratamento',
    colunaMapeados: 'Campos mapeados',
    colunaPorPreencher: 'Campos por preencher',
    botaoAdicionar: (n: number) => `Adicionar ${n} registo${n === 1 ? '' : 's'} ao ficheiro`,
    botaoFechar: 'Fechar sem adicionar',
  },

  exportar: {
    titulo: 'Exportar',
    botaoJson: 'Exportar JSON',
    botaoExcel: 'Exportar Excel',
    botaoPdf: 'Exportar PDF',
    aExportar: 'A exportar…',
    erro: 'Não foi possível gerar o ficheiro. Tenta novamente.',
  },

  validador: {
    tituloNav: 'Modo validador',
    titulo: 'Modo validador',
    descricao:
      'Importa um ou mais ficheiros exportados pelas equipas, revê os avisos/erros, anota o que precisa de correção e exporta de volta.',
    botaoImportar: 'Importar ficheiros',
    aImportar: 'A importar…',
    erroImportacao: (nome: string) => `Não foi possível importar "${nome}".`,
    semSessao: 'Ainda não importaste nenhum ficheiro nesta sessão de validação.',
    colunaFicheiro: 'Ficheiro',
    colunaEquipa: 'Equipa',
    colunaRegistos: 'Registos',
    colunaErros: 'Erros',
    colunaAvisos: 'Avisos',
    botaoVerDetalhe: 'Ver detalhe',
    botaoRemoverDaSessao: 'Remover da sessão',
    botaoVoltarSessao: '← Voltar ao resumo da sessão',
    ocorrenciasTitulo: 'Avisos e erros',
    semOcorrencias: 'Sem avisos nem erros neste registo.',
    anotacoesTitulo: 'Anotações',
    botaoAnotar: 'Anotar',
    botaoAnotarGeral: 'Adicionar anotação geral',
    placeholderAnotacao: 'Escreve a anotação para a equipa…',
    botaoGuardarAnotacao: 'Guardar anotação',
    botaoCancelarAnotacao: 'Cancelar',
    marcarResolvida: 'Marcar como resolvida',
    marcarPorResolver: 'Marcar como por resolver',
    campoGeral: 'Geral',
    resumoSessaoTitulo: 'Resumo da sessão',
    submetidosTitulo: 'Registos submetidos para validação',
    submetidosDescricao:
      'De todos os ficheiros importados nesta sessão. "Rever" abre o formulário completo, onde podes alterar qualquer campo antes de validar.',
    botaoRever: 'Rever',
    botaoEditar: 'Editar campos',
    botaoVoltarRegistos: '← Voltar aos registos',
    estadoTitulo: 'Decisão do validador',
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
