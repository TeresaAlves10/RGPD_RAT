export const textos = {
  app: {
    titulo: 'Registo de Atividades de Tratamento (RGPD)',
    descricao: 'Aplicação de preenchimento de RAT nos termos do art. 30.º do RGPD.',
  },

  navegacao: {
    listaRegistos: 'Registos',
    novoRegisto: 'Novo registo',
    ajuda: 'Ajuda',
  },

  ajuda: {
    titulo: 'Guia de utilização',
    seccoes: [
      {
        titulo: '1. Preencher um registo',
        paragrafos: [
          'Em "Registos", clica em "+ Novo registo" e escolhe se a organização atua como Responsável pelo Tratamento (art. 30.º/1) ou como Subcontratado (art. 30.º/2) — os dois pedem campos diferentes.',
          'O formulário está dividido em passos. Navega entre eles clicando nas abas ou com as setas do teclado quando uma aba está selecionada. Campos com * são obrigatórios.',
          'Junto de alguns campos há um "?" com a fundamentação legal (artigo do RGPD relevante) — clica para abrir.',
          'Avisos e erros adicionais (para além dos campos obrigatórios) aparecem no fundo do formulário; não impedem guardar o registo, mas convém rever antes de exportar.',
        ],
      },
      {
        titulo: '2. Rascunho local',
        paragrafos: [
          'O ficheiro em edição é guardado automaticamente no browser (localStorage) cerca de 1 segundo depois de cada alteração — nunca é enviado para nenhum servidor.',
          'Ao reabrir a aplicação com um rascunho guardado, é sempre pedida confirmação explícita antes de o carregar.',
          'Usa "Limpar rascunho local" no cabeçalho para apagar este rascunho a qualquer momento.',
        ],
      },
      {
        titulo: '3. Exportar e enviar ao DPO',
        paragrafos: [
          'Em "Registos", os botões "Exportar JSON", "Exportar Excel" e "Exportar PDF" geram o ficheiro correspondente para download.',
          'JSON é o formato canónico — usa-o para reimportar e continuar a editar mais tarde, ou para o DPO validar.',
          'Excel inclui uma folha legível e uma folha com o JSON completo (oculta), para poderes voltar a importar sem perder nada.',
          'PDF é só para apresentação/arquivo — não pode ser reimportado.',
          'O download nunca é bloqueado por erros de validação por resolver.',
        ],
      },
      {
        titulo: '4. Importar',
        paragrafos: [
          '"Importar" aceita um JSON ou Excel exportado por esta aplicação, e substitui o ficheiro em edição (pede confirmação se já tiveres registos).',
          '"Importar (template antigo)" lê o template Excel anterior e mostra um relatório com os campos mapeados diretamente e os que ficam "por preencher" (porque usam listas fechadas que o template antigo não tinha) — o texto original desses campos fica guardado nas observações do registo.',
        ],
      },
      {
        titulo: '5. Modo validador (DPO)',
        paragrafos: [
          'Em "Modo validador", importa um ou mais ficheiros recebidos das equipas de uma vez.',
          'O resumo da sessão mostra, por ficheiro, o número de registos, erros e avisos. "Ver detalhe" abre os registos individuais, com as ocorrências do motor de regras e um espaço para anotar o que precisa de correção — geral ou associado a um campo específico das ocorrências.',
          'Exporta o ficheiro anotado (JSON/Excel/PDF) e envia de volta à equipa — as anotações viajam dentro do ficheiro.',
        ],
      },
    ],
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
    estadoAnotacoes: (n: number) => `${n} anotação${n === 1 ? '' : 'ões'} do DPO`,
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

  importar: {
    botaoImportar: 'Importar',
    botaoImportarLegado: 'Importar (template antigo)',
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
    titulo: 'Modo validador (DPO)',
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
