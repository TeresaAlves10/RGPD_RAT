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

  navegacao: {
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
    campoEquipa: 'Equipa / Direção responsável pelo ficheiro',
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
    titulo: 'Neste tratamento, quem decide o que se faz com os dados?',
    descricao:
      'A resposta muda o que o RGPD obriga a registar — por isso o formulário é diferente nos dois casos. Podes trocar mais tarde sem perder o que já preencheste.',
    responsavelTitulo: 'Decidimos nós para que servem os dados e como são usados',
    responsavelEtiqueta: 'Responsável pelo tratamento',
    responsavelDescricao:
      'Ninguém de fora nos deu instruções: a finalidade e os meios do tratamento são escolha da organização.',
    responsavelExemplos: [
      'Recrutamento e gestão de colaboradores',
      'Um portal ou serviço que a equipa criou e gere',
      'Videovigilância das nossas instalações',
    ],
    responsavelMeta: '7 secções · art. 30.º/1',
    subcontratadoTitulo: 'Tratamos dados por conta de outra entidade, seguindo as instruções dela',
    subcontratadoEtiqueta: 'Subcontratado',
    subcontratadoDescricao:
      'Há um cliente, um parceiro ou outro serviço que decide a finalidade; nós executamos o que foi contratado.',
    subcontratadoExemplos: [
      'Alojar a base de dados de um cliente',
      'Helpdesk contratado por outra entidade',
      'Processar salários por conta de outro serviço',
    ],
    subcontratadoMeta: '6 secções · art. 30.º/2',
    exemplosTitulo: 'Por exemplo',
    botaoContinuar: 'Continuar',
    botaoCancelar: 'Cancelar',
    duvidaTitulo: 'Não tens a certeza?',
    duvidaTexto:
      'Faz esta pergunta: se amanhã decidissem usar estes dados para outra coisa, podiam fazê-lo sozinhos? Se sim, a equipa é responsável. Se tivessem de pedir autorização a quem vos entregou os dados, é subcontratado.',
    duvidaNota:
      'A mesma equipa pode ser as duas coisas em tratamentos diferentes — nesse caso cria um registo para cada.',
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
    direcao: 'Direção',
    unidadeCoordenacao: 'Unidade de Coordenação',
    nomeTratamento: 'Nome do tratamento / processo',
    descricao: 'Descrição do processo',
    'gestorProjeto.nome': 'Nome do Gestor de Projeto (GP)',
    'gestorProjeto.contacto': 'Contacto do GP',
    medidasTecnicasOrganizativas: 'Medidas técnicas e organizativas implementadas',
    aipdRealizada: 'Foi realizada AIPD?',
    observacoes: 'Observações',

    // 1. Descrição do Processo / Caracterização
    finalidade: 'Qual a finalidade?',
    operacoesTratamento: 'Quais as operações de tratamento?',
    trataDadosPessoais: 'Dados pessoais?',
    dadosNecessariosParaFinalidade: 'Todos os dados pessoais são necessários para a finalidade?',
    'categoriasEspeciais.aplicavel': 'Categorias especiais de dados?',
    'categoriasEspeciais.identificar': 'Identifica as categorias especiais de dados',
    categoriasEspeciaisNecessarias:
      'Todas as categorias especiais de dados são necessárias para a finalidade?',
    categoriasTitulares: 'Qual a categoria de titular dos dados?',
    categoriasTitularesOutra: 'Especifica a categoria de titular',
    categoriasDados: 'Categorias e tipos de dados pessoais',
    entidadesQueEnviamDados:
      'Quem são as entidades que me enviam dados pessoais para além do titular dos dados pessoais?',
    entidadesParaQuemEnvioDados:
      'Quem são as entidades a quem envio dados pessoais para além do seu titular?',
    suportesFisicos:
      'Lista de suportes físicos existentes que contêm dados pessoais (e.g. papel, disco externo)',
    localizacaoSuportesFisicos: 'Localização dos dados pessoais em suporte físico',

    // 2. Ferramentas / Aplicações utilizadas
    ferramentasAplicacoes: 'Ferramentas / aplicações utilizadas',
    numeroCamposComDadosPessoais: 'N.º de campos que contêm dados pessoais',
    volumeDadosPessoais: 'Volume de dados pessoais',
    numeroUtilizadoresComAcesso: 'N.º de utilizadores com acesso a dados pessoais',

    // 3. Subcontratados
    subcontratados: 'Entidades subcontratadas',
    'subcontratado.nome': 'Nome da entidade subcontratada',
    'subcontratado.operacoesTratamento': 'Quais as operações de tratamento?',
    'subcontratado.existeContrato': 'Existe contrato com a entidade que fornece dados pessoais?',
    'subcontratado.contratoComClausulasProtecaoDados':
      'O contrato contém cláusulas específicas sobre a privacidade e proteção de dados pessoais?',
    'subcontratado.transferenciasPaisesTerceiros':
      'Os dados pessoais são transferidos para países terceiros fora da União Europeia?',
    'subcontratado.auditoriasAoSubcontratado':
      'São realizadas auditorias/inspeções para validar que o subcontratado cumpre com as obrigações previstas?',
    'subcontratado.pedidoAutorizacaoCnpd': 'Foi efetuado pedido de autorização/notificação à CNPD?',

    // 4. Base de Licitude
    baseLicitude: 'Qual é a base de licitude?',
    consentimentoMecanismosDemonstracao:
      'Existem mecanismos para demonstrar a qualquer momento que o titular dos dados deu o seu consentimento?',
    consentimentoResponsabilidadeParental:
      'No caso de tratamentos de dados de menores de idade, o consentimento é obtido diretamente aos titulares da responsabilidade parental da criança?',
    retencaoDefinidaPelaOrganizacao: (organizacao: string) =>
      `Está definido um período de retenção dos dados pessoais pel${organizacao === 'a organização' ? '' : 'a '}${organizacao}?`,
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

    // 7. Observações Gerais
    normativosAplicaveis: 'Quais os normativos legais ou regulamentares aplicáveis?',
    diagramaProcesso: 'Imagem / diagrama do processo (referência ou ligação)',

    // Subcontratante
    nomeResponsavelTratamento: 'Nome do Responsável pelo Tratamento',
    finalidadeSubcontratado: 'Finalidade do tratamento de dados pessoais',
    responsavelConjunto: 'Identificação do responsável conjunto pelo tratamento (identificar ou N/A)',
    baseLegal: 'Base legal do tratamento (art. 6.º do RGPD)',
    recolhaDados: 'Recolha dos dados (como é efetuada)',
    destinatarios: 'Destinatários ou categorias de destinatários',
    'transferencias.existem':
      'Transferências para países terceiros ou organizações internacionais (art. 44.º do RGPD)?',
    'transferencias.identificar': 'Identifica o país ou países / organizações de destino',
    prazoConservacao: 'Prazo de conservação dos dados pessoais',
    outrosSubcontratantes: 'Nome de outros subcontratantes (art. 28.º do RGPD)',
    'outroSubcontratante.nome': 'Nome',
    'outroSubcontratante.contacto': 'Contacto',
    'outroSubcontratante.dataContrato': 'Data do contrato de subcontratação (AAAA-MM-DD)',
    diagramaEcosistema: 'Imagem / diagrama / ecossistema (referência ou ligação)',

    // Sub-campos de listas
    'categoriaDados.categoria': 'Categoria de dados',
    'categoriaDados.categoriaOutra': 'Especifica a categoria',
    'categoriaDados.tipos': 'Tipos de dados (um por linha)',
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
    parcial: 'Parcialmente',
    nao: 'Não',
    nao_aplicavel: 'Não aplicável',
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

    // Subcontratante
    identificacaoSubcontratado: 'Identificação',
    tratamentoSubcontratado: 'Tratamento e base legal',
    dadosSubcontratado: 'Titulares e dados',
    destinatariosSubcontratado: 'Destinatários e transferências',
    segurancaSubcontratado: 'Conservação e segurança',
    observacoesSubcontratado: 'Observações Gerais',
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
    botaoCorrigir: 'Corrigir no formulário',
    confirmarCorrigir:
      'Isto carrega este ficheiro no formulário de preenchimento, substituindo o que lá estiver. As correções que fizeres ficam nesse ficheiro — volta aqui depois para validar e exportar. Continuar?',
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
