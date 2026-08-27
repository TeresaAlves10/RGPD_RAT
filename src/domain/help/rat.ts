/**
 * Ajuda contextual por campo do RAT.
 *
 * As entradas marcadas `fonte: 'excel'` são o texto integral dos
 * comentários de célula do template legado (Livro6.xlsx, folha "Folha1",
 * linha 11), extraído programaticamente — não reescritas de memória (ver
 * CLAUDE.md §4). As marcadas `fonte: 'regulamento'` citam diretamente o
 * texto do Regulamento (UE) 2016/679 (RGPD) para vocabulários que o Excel
 * não documentava com um comentário próprio. As marcadas
 * `fonte: 'orientacao'` são as orientações de preenchimento escritas pelo
 * utilizador para as equipas desta organização.
 */

export interface AjudaCampo {
  /** Identificador do campo no schema Zod (ver src/domain/schema/). */
  campo: string
  /** Base legal citada (artigo/número/alínea). */
  baseLegal: string
  texto: string
  fonte: 'excel' | 'regulamento' | 'orientacao'
}

export const ajudaRat: AjudaCampo[] = [
  {
    campo: 'finalidades',
    baseLegal: 'art. 30.º/1, b)',
    fonte: 'excel',
    texto:
      'A(s) finalidade(s) ou o objetivo do tratamento de dados pessoais devem ser determinadas, explícitas e legítimas.',
  },
  {
    campo: 'responsavelConjunto',
    baseLegal: 'art. 26.º',
    fonte: 'excel',
    texto:
      '1. Quando dois ou mais responsáveis pelo tratamento determinem conjuntamente as finalidades e os meios desse tratamento, ambos são responsáveis conjuntos pelo tratamento. Estes determinam, por acordo entre si e de modo transparente, as respetivas responsabilidades pelo cumprimento do presente regulamento, nomeadamente no que diz respeito ao exercício dos direitos do titular dos dados e aos respetivos deveres de fornecer as informações referidas nos artigos 13.º e 14.º, a menos e na medida em que as suas responsabilidades respetivas sejam determinadas pelo direito da União ou do Estado-Membro a que se estejam sujeitos. O acordo pode designar um ponto de contacto para os titulares dos dados. 2. O acordo a que se refere o n.º 1 reflete devidamente as funções e relações respetivas dos responsáveis conjuntos pelo tratamento em relação aos titulares dos dados. A essência do acordo é disponibilizada ao titular dos dados. 3. Independentemente dos termos do acordo a que se refere o n.º 1, o titular dos dados pode exercer os direitos que lhe confere o presente regulamento em relação a cada um dos responsáveis pelo tratamento.',
  },
  {
    campo: 'representante',
    baseLegal: 'art. 4.º/17 e art. 27.º',
    fonte: 'excel',
    texto:
      '«Representante», uma pessoa singular ou coletiva estabelecida na União que, designada por escrito pelo responsável pelo tratamento ou subcontratante, nos termos do artigo 27.º, representa o responsável pelo tratamento ou o subcontratante no que se refere às suas obrigações respetivas nos termos do presente regulamento.',
  },
  {
    campo: 'baseLicitude',
    baseLegal: 'art. 6.º/1',
    fonte: 'excel',
    texto:
      '1. O tratamento só é lícito se e na medida em que se verifique pelo menos uma das seguintes situações: a) O titular dos dados tiver dado o seu consentimento para o tratamento dos seus dados pessoais para uma ou mais finalidades específicas; b) O tratamento for necessário para a execução de um contrato no qual o titular dos dados é parte, ou para diligências pré-contratuais a pedido do titular dos dados; c) O tratamento for necessário para o cumprimento de uma obrigação jurídica a que o responsável pelo tratamento esteja sujeito; d) O tratamento for necessário para a defesa de interesses vitais do titular dos dados ou de outra pessoa singular; e) O tratamento for necessário ao exercício de funções de interesse público ou ao exercício da autoridade pública de que está investido o responsável pelo tratamento; f) O tratamento for necessário para efeito dos interesses legítimos prosseguidos pelo responsável pelo tratamento ou por terceiros, exceto se prevalecerem os interesses ou direitos e liberdades fundamentais do titular que exijam a proteção dos dados pessoais, em especial se o titular for uma criança.',
  },
  {
    campo: 'categoriasDados',
    baseLegal: 'art. 30.º/1, c)',
    fonte: 'excel',
    texto:
      'Exemplos de categorias (com exemplos de tipos de dados): Dados de identificação civil (vg. nome, email, morada, género, data de nascimento, assinatura); Dados de identificação fiscal (vg. número de identificação fiscal, código da repartição das finanças, dados do cartão crédito); Dados de identificação digital (vg. endereço de IP, coordenadas geográficas); Outros dados identificativos (vg. nome do pai, nome da mãe, social media); Dados de morada e contacto (vg. morada fiscal, morada de correspondência); Dados profissionais e habilitações académicas (vg. profissão, entidade patronal, rendimento, cargos públicos, ENI); Dados contratuais e patrimoniais (vg. dados de conta bancária, valor dos bens, número de conta, IBAN); Dados de registo de voz e imagem (vg. gravações de chamadas, de vídeo, fotografias); Dados de saúde (vg. grau de deficiência, dados clínicos, relatório médico ou clínico); Dados de situação pessoal (vg. emigrante, não residente [NIF e país], reformado, títulos).',
  },
  {
    campo: 'categoriasEspeciais',
    baseLegal: 'art. 9.º',
    fonte: 'excel',
    texto:
      'É proibido o tratamento de dados pessoais que revelem a origem racial ou étnica, as opiniões políticas, as convicções religiosas ou filosóficas, ou a filiação sindical, bem como o tratamento de dados genéticos, dados biométricos para identificar uma pessoa de forma inequívoca, dados relativos à saúde ou dados relativos à vida sexual ou orientação sexual de uma pessoa. Exceções a esta regra: ver o artigo 9.º do RGPD.',
  },
  {
    campo: 'categoriasEspeciais.condicoesArt9',
    baseLegal: 'art. 9.º/2',
    fonte: 'regulamento',
    texto:
      'A proibição do n.º 1 não se aplica se se verificar um dos seguintes casos: a) consentimento explícito do titular; b) cumprimento de obrigações e exercício de direitos em matéria de direito laboral, segurança social e proteção social; c) defesa de interesses vitais do titular ou de outra pessoa singular, quando o titular estiver incapacitado de dar o seu consentimento; d) atividades legítimas de fundação, associação ou outro organismo sem fins lucrativos, com finalidade política, filosófica, religiosa ou sindical; e) dados manifestamente tornados públicos pelo titular; f) declaração, exercício ou defesa de um direito num processo judicial, ou sempre que os tribunais atuem no exercício da sua função jurisdicional; g) interesse público importante, com base no direito da União ou de um Estado-Membro; h) medicina preventiva ou do trabalho, diagnóstico médico, prestação de cuidados de saúde ou de ação social, ou gestão de sistemas e serviços de saúde; i) interesse público no domínio da saúde pública; j) fins de arquivo de interesse público, investigação científica ou histórica, ou fins estatísticos.',
  },
  {
    campo: 'destinatarios',
    baseLegal: 'art. 4.º/9',
    fonte: 'excel',
    texto:
      'O artigo 4.º, ponto 9, define «destinatário» como "uma pessoa singular ou coletiva, a autoridade pública, agência ou outro organismo que recebem comunicações de dados pessoais, independentemente de se tratar ou não de um terceiro. Contudo, as autoridades públicas que possam receber dados pessoais no âmbito de inquéritos específicos nos termos do direito da União ou dos Estados-Membros não são consideradas destinatários; o tratamento desses dados por essas autoridades públicas deve cumprir as regras de proteção de dados aplicáveis em função das finalidades do tratamento." A definição abrange qualquer pessoa que receba dados pessoais, quer seja um terceiro ou não. Por exemplo, quando um responsável pelo tratamento envia dados pessoais a outra entidade, um subcontratante ou um terceiro, esta entidade é um destinatário.',
  },
  {
    campo: 'prazoConservacao',
    baseLegal: 'art. 5.º/1, e) e art. 89.º/1',
    fonte: 'excel',
    texto:
      'Os dados pessoais devem ser conservados de uma forma que permita a identificação dos titulares dos dados apenas durante o período necessário para as finalidades para as quais são tratados; os dados pessoais podem ser conservados durante períodos mais longos, desde que sejam tratados exclusivamente para fins de arquivo de interesse público, ou para fins de investigação científica ou histórica ou para fins estatísticos, em conformidade com o artigo 89.º, n.º 1 do RGPD, sujeitos à aplicação das medidas técnicas e organizativas. Caso não exista prazo legal, deve ser determinado o prazo ou critério da conservação.',
  },
  {
    campo: 'medidasTecnicasOrganizativas',
    baseLegal: 'considerando 78',
    fonte: 'excel',
    texto:
      'Considerando 78 do RGPD: A defesa dos direitos e liberdades das pessoas singulares relativamente ao tratamento dos seus dados pessoais exige a adoção de medidas técnicas e organizativas adequadas, a fim de assegurar o cumprimento dos requisitos do presente regulamento. Para poder comprovar a conformidade com o presente regulamento, o responsável pelo tratamento deverá adotar orientações internas e aplicar medidas que respeitem, em especial, os princípios da proteção de dados desde a conceção e da proteção de dados por defeito.\n\ni) Medidas técnicas: podem ser definidas como as medidas e os controlos concedidos aos sistemas e a qualquer aspeto tecnológico de uma organização, tais como dispositivos, redes e hardware. A proteção desses aspetos é crucial para a segurança dos dados pessoais e constitui a melhor linha de defesa contra as violações de dados. Algumas das medidas técnicas mais comuns: cibersegurança, encriptação, anonimização ou pseudonimização, segurança física (câmaras, alarmes, check-in de visitantes de acordo com um determinado procedimento, por exemplo), destruição segura de papel, armários com chave, passwords, direitos de acesso.\n\nii) Medidas organizativas: podem consistir em políticas internas (privacidade, passwords, uso responsável), métodos ou normas organizacionais, e controlos e auditorias, que a organização pode aplicar para garantir a segurança dos dados pessoais. Constituem exemplos de medidas organizativas, sem excluir outras: políticas diversas e procedimentos, formação de colaboradores, due diligence (por exemplo, modelo de avaliação de fornecedores), acessos com password, plataforma cloud com password, pastas com perfis de acesso.',
  },
  {
    campo: 'subcontratantesContratados',
    baseLegal: 'art. 4.º/8 e art. 28.º',
    fonte: 'excel',
    texto:
      '«Subcontratante», uma pessoa singular ou coletiva, a autoridade pública, agência ou outro organismo que trate os dados pessoais por conta do responsável pelo tratamento destes.',
  },
  {
    campo: 'transferenciasInternacionais',
    baseLegal: 'art. 44.º',
    fonte: 'regulamento',
    texto:
      'Só é permitida uma transferência de dados pessoais para um país terceiro ou uma organização internacional se, sob reserva das restantes disposições do RGPD, forem respeitadas pelo responsável pelo tratamento e pelo subcontratante as condições estabelecidas no capítulo V do Regulamento (decisão de adequação, garantias apropriadas — como cláusulas contratuais-tipo ou regras vinculativas aplicáveis às empresas — ou derrogações específicas para situações específicas, nos termos do art. 49.º), de forma a assegurar que o nível de proteção das pessoas singulares garantido pelo RGPD não é comprometido.',
  },
  {
    campo: 'responsaveis',
    baseLegal: 'art. 28.º e art. 30.º/2',
    fonte: 'regulamento',
    texto:
      'Quando a organização atua como subcontratante, o registo das atividades de tratamento deve identificar o(s) responsável(is) pelo tratamento por conta de quem atua, e as categorias de tratamentos efetuados por conta de cada responsável — nos termos do art. 30.º/2 do RGPD.',
  },
]

export const ajudaOrientacoes: AjudaCampo[] = [
  {
    campo: 'descricao',
    baseLegal: 'Orientação de preenchimento',
    fonte: 'orientacao',
    texto:
      'Descrever, de forma clara e objetiva, o processo ou atividade de tratamento de dados pessoais, indicando o que é realizado com os dados, em que contexto e com que objetivo. A descrição deve permitir compreender o percurso dos dados desde a sua recolha ou receção até à sua utilização, partilha, conservação e, quando aplicável, eliminação.',
  },
  {
    campo: 'finalidade',
    baseLegal: 'art. 30.º/1, b)',
    fonte: 'orientacao',
    texto:
      'A(s) finalidade(s) ou o objetivo do tratamento de dados pessoais devem ser determinadas, explícitas e legítimas.',
  },
  {
    campo: 'operacoesTratamento',
    baseLegal: 'Orientação de preenchimento',
    fonte: 'orientacao',
    texto:
      'Qualquer ação, manual ou automatizada, realizada sobre dados pessoais, incluindo a recolha, registo, validação, organização, conservação, consulta, atualização, utilização e partilha dos dados com sistemas ou entidades autorizadas.',
  },
  {
    campo: 'dadosPessoais',
    baseLegal: 'art. 4.º/1',
    fonte: 'orientacao',
    texto:
      'Dados pessoais são quaisquer informações relacionadas com uma pessoa singular identificada ou identificável, direta ou indiretamente. Exemplos: nome, NIF, número de utente.',
  },
  {
    campo: 'categoriasDados',
    baseLegal: 'Orientação de preenchimento',
    fonte: 'orientacao',
    texto:
      'Identificar as categorias de dados pessoais tratados no âmbito do processo, de acordo com o tipo de informação recolhida ou utilizada. Exemplos: dados de identificação; dados de contacto; dados profissionais; dados de localização; dados de autenticação e acesso; dados relativos a equipamentos ou dispositivos; dados de saúde; dados genéticos; dados biométricos.',
  },
  {
    campo: 'categoriasEspeciais',
    baseLegal: 'art. 9.º',
    fonte: 'orientacao',
    texto:
      'Dados pessoais que, pela sua natureza, beneficiam de proteção reforçada nos termos do RGPD. Incluem dados sobre origem racial ou étnica, opiniões políticas, convicções religiosas ou filosóficas, filiação sindical, dados genéticos, dados biométricos para identificação inequívoca, dados relativos à saúde e dados relativos à vida sexual ou orientação sexual.',
  },
  {
    campo: 'categoriasTitulares',
    baseLegal: 'Orientação de preenchimento',
    fonte: 'orientacao',
    texto:
      'Identificar os grupos ou tipos de pessoas singulares a quem respeitam os dados pessoais tratados no âmbito do processo. Exemplos: utentes/doentes; profissionais de saúde; colaboradores; cidadãos; candidatos; fornecedores/prestadores de serviços; representantes legais; visitantes/utilizadores de portais e aplicações; outros.',
  },
  {
    campo: 'operacoesTratamentoSubcontratadas',
    baseLegal: 'Orientação de preenchimento',
    fonte: 'orientacao',
    texto: 'Ações manuais ou automatizadas executadas pelas entidades subcontratadas.',
  },
  {
    campo: 'baseLicitude',
    baseLegal: 'art. 6.º/1',
    fonte: 'orientacao',
    texto:
      'Base de licitude é o fundamento jurídico que permite à organização tratar os dados pessoais de forma legal, de acordo com o RGPD. Consentimento — o titular dos dados autorizou, de forma livre, específica, informada e inequívoca, o tratamento dos seus dados. Execução de contrato — o tratamento é necessário para celebrar ou executar um contrato com o titular dos dados. Cumprimento de obrigação jurídica — o tratamento é necessário para cumprir uma obrigação legal aplicável ao responsável pelo tratamento. Interesses vitais — o tratamento é necessário para proteger a vida ou a integridade física de uma pessoa. Interesse público / exercício de autoridade pública — o tratamento é necessário para o exercício de funções de interesse público ou de autoridade pública atribuídas ao responsável pelo tratamento. Interesses legítimos — o tratamento é necessário para prosseguir interesses legítimos do responsável pelo tratamento ou de terceiros, desde que não prevaleçam os direitos e liberdades do titular dos dados.',
  },
  {
    campo: 'direitoAcesso',
    baseLegal: 'art. 15.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular obter confirmação sobre se os seus dados pessoais são tratados e, em caso afirmativo, aceder aos mesmos e a informação sobre o respetivo tratamento.',
  },
  {
    campo: 'direitoRetificacao',
    baseLegal: 'art. 16.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular solicitar a correção ou atualização dos seus dados pessoais que estejam incorretos ou incompletos.',
  },
  {
    campo: 'direitoApagamento',
    baseLegal: 'art. 17.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular solicitar a eliminação dos seus dados pessoais, quando estejam reunidas as condições previstas no RGPD.',
  },
  {
    campo: 'direitoPortabilidade',
    baseLegal: 'art. 20.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular receber os seus dados pessoais, num formato estruturado e de uso corrente, e transmiti-los a outro responsável pelo tratamento, quando aplicável.',
  },
  {
    campo: 'direitoLimitacao',
    baseLegal: 'art. 18.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular solicitar a limitação da utilização dos seus dados pessoais em determinadas situações previstas no RGPD.',
  },
  {
    campo: 'direitoDecisoesAutomatizadas',
    baseLegal: 'art. 22.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular não ficar sujeito a uma decisão baseada exclusivamente em tratamento automatizado, incluindo definição de perfis, quando esta produza efeitos jurídicos ou efeitos similares significativos, salvo nas situações previstas no RGPD.',
  },
  {
    campo: 'direitoOposicao',
    baseLegal: 'art. 21.º',
    fonte: 'orientacao',
    texto:
      'Permite ao titular opor-se ao tratamento dos seus dados pessoais em determinadas situações, nomeadamente quando o tratamento tenha por base o interesse público ou interesses legítimos.',
  },
]

/**
 * As orientações do utilizador vêm primeiro: são as que a organização
 * escreveu para as suas equipas. A fundamentação legal extraída do
 * template antigo serve de reserva para os campos que elas não cobrem.
 */
export function obterAjudaCampo(campo: string): AjudaCampo | undefined {
  return (
    ajudaOrientacoes.find((entrada) => entrada.campo === campo) ??
    ajudaRat.find((entrada) => entrada.campo === campo)
  )
}
