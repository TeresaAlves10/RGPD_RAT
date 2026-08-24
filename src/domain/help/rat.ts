/**
 * Ajuda contextual por campo do RAT.
 *
 * As entradas marcadas `fonte: 'excel'` são o texto integral dos
 * comentários de célula do template legado (Livro6.xlsx, folha "Folha1",
 * linha 11), extraído programaticamente — não reescritas de memória (ver
 * CLAUDE.md §4). As marcadas `fonte: 'regulamento'` citam diretamente o
 * texto do Regulamento (UE) 2016/679 (RGPD) para vocabulários que o Excel
 * não documentava com um comentário próprio.
 */

export interface AjudaCampo {
  /** Identificador do campo no schema Zod (ver src/domain/schema/). */
  campo: string
  /** Base legal citada (artigo/número/alínea). */
  baseLegal: string
  texto: string
  fonte: 'excel' | 'regulamento'
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

export function obterAjudaCampo(campo: string): AjudaCampo | undefined {
  return ajudaRat.find((entrada) => entrada.campo === campo)
}
