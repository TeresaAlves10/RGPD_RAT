import type { Regra } from '@/domain/rules/types'

/**
 * Catálogo declarativo de regras de validação de negócio, para além do que
 * o schema Zod já garante estruturalmente (tipos, obrigatoriedade, enums).
 * Nunca embutir esta lógica em componentes de UI (CLAUDE.md §2.4) — o
 * formulário e o modo validador consomem este catálogo através do motor
 * em src/domain/rules/motor.ts.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEFONE_RE = /^[+()0-9 .-]{9,}$/
const DATA_ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export const catalogoRegras: Regra[] = [
  {
    id: 'MTO_OUTRO_ESPECIFICADO',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'medidasTecnicasOrganizativas',
    descricao:
      'Quando se escolhe "Outro" numa medida técnica/organizativa, tem de se especificar qual.',
    verificar: (registo) =>
      registo.medidasTecnicasOrganizativas.every(
        (m) => m.medida !== 'outro' || Boolean(m.medidaOutra?.trim()),
      ),
    mensagem: 'Especifica a medida técnica/organizativa quando escolhes "Outro".',
  },
  {
    id: 'TRANSFERENCIA_MECANISMO_OBRIGATORIO',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'transferenciasInternacionais',
    descricao:
      'Se existem transferências internacionais de dados, o mecanismo de garantia (art. 44.º) é obrigatório.',
    verificar: (registo) => {
      const t = registo.transferenciasInternacionais
      return !t.existem || Boolean(t.mecanismo)
    },
    mensagem: 'Indica o mecanismo de garantia da transferência internacional (art. 44.º RGPD).',
  },
  {
    id: 'TRANSFERENCIA_MECANISMO_OUTRO_ESPECIFICADO',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'transferenciasInternacionais',
    descricao: 'Quando o mecanismo de transferência é "Outro", tem de se especificar qual.',
    verificar: (registo) => {
      const t = registo.transferenciasInternacionais
      return t.mecanismo !== 'outro' || Boolean(t.mecanismoOutro?.trim())
    },
    mensagem: 'Especifica o mecanismo de transferência quando escolhes "Outro".',
  },
  {
    id: 'TRANSFERENCIA_PAISES_OBRIGATORIO',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'transferenciasInternacionais',
    descricao: 'Se existem transferências internacionais, o(s) país(es)/organização(ões) de destino são obrigatórios.',
    verificar: (registo) => {
      const t = registo.transferenciasInternacionais
      return !t.existem || (t.paisesOuOrganizacoes?.length ?? 0) > 0
    },
    mensagem: 'Indica pelo menos um país ou organização internacional de destino.',
  },
  {
    id: 'TRANSFERENCIA_SEM_DADOS_QUANDO_NAO_EXISTEM',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'transferenciasInternacionais',
    descricao:
      'Se não existem transferências internacionais, não deve haver mecanismo nem países preenchidos (inconsistência a rever).',
    verificar: (registo) => {
      const t = registo.transferenciasInternacionais
      if (t.existem) return true
      return !t.mecanismo && (t.paisesOuOrganizacoes?.length ?? 0) === 0
    },
    mensagem: 'Há dados de transferência preenchidos apesar de "existem" estar como não. Confirma qual está correto.',
  },
  {
    id: 'GESTOR_PROJETO_CONTACTO_FORMATO',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'gestorProjeto',
    descricao: 'O contacto do GP deve parecer um email ou um número de telefone válido.',
    verificar: (registo) => {
      const contacto = registo.gestorProjeto.contacto.trim()
      // Campo vazio é assinalado pela obrigatoriedade do schema, não por esta regra de formato.
      if (!contacto) return true
      return EMAIL_RE.test(contacto) || TELEFONE_RE.test(contacto)
    },
    mensagem: 'O contacto do gestor de projeto não parece um email nem um telefone válido.',
  },
  {
    id: 'CATEGORIAS_ESPECIAIS_CONDICAO_OBRIGATORIA',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasEspeciais',
    descricao:
      'Se há categorias especiais de dados (art. 9.º), a condição que afasta a proibição e a identificação são obrigatórias.',
    verificar: (registo) => {
      if (registo.tipoRegisto !== 'responsavel') return true
      const ce = registo.categoriasEspeciais
      if (!ce.aplicavel) return true
      return (ce.condicoesArt9?.length ?? 0) > 0 && Boolean(ce.identificar?.trim())
    },
    mensagem:
      'Indica a condição do art. 9.º/2 aplicável e identifica as categorias especiais de dados tratadas.',
  },
  {
    id: 'CATEGORIAS_ESPECIAIS_SEM_DADOS_QUANDO_NAO_APLICAVEL',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'categoriasEspeciais',
    descricao:
      'Se não há categorias especiais de dados, não deve haver condição do art. 9.º nem identificação preenchidas.',
    verificar: (registo) => {
      if (registo.tipoRegisto !== 'responsavel') return true
      const ce = registo.categoriasEspeciais
      if (ce.aplicavel) return true
      return (ce.condicoesArt9?.length ?? 0) === 0 && !ce.identificar?.trim()
    },
    mensagem:
      'Há uma condição do art. 9.º ou identificação preenchidas apesar de não haver categorias especiais. Confirma qual está correto.',
  },
  {
    id: 'CATEGORIA_DADOS_OUTRO_ESPECIFICADA',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasDados',
    descricao: 'Quando uma categoria de dados é "Outro", tem de se especificar qual.',
    verificar: (registo) => {
      if (registo.tipoRegisto !== 'responsavel') return true
      return registo.categoriasDados.every(
        (c) => c.categoria !== 'outro' || Boolean(c.categoriaOutra?.trim()),
      )
    },
    mensagem: 'Especifica a categoria de dados pessoais quando escolhes "Outro".',
  },
  {
    id: 'CATEGORIAS_TITULARES_OUTRO_ESPECIFICADA',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'categoriasTitulares',
    descricao: 'Quando a categoria de titulares é "Outro", tem de se especificar qual.',
    verificar: (registo) => {
      if (registo.tipoRegisto !== 'responsavel') return true
      return (
        !registo.categoriasTitulares.includes('outro') ||
        Boolean(registo.categoriasTitularesOutra?.trim())
      )
    },
    mensagem: 'Especifica a categoria de titulares dos dados quando escolhes "Outro".',
  },
  {
    id: 'RESPONSAVEIS_CATEGORIAS_TRATAMENTO_DESCRITIVAS',
    escopo: 'registo',
    severidade: 'aviso',
    campo: 'responsaveis',
    descricao:
      'A descrição das categorias de tratamento efetuadas por conta de cada responsável deve ser suficientemente descritiva.',
    verificar: (registo) => {
      if (registo.tipoRegisto !== 'subcontratado') return true
      return registo.responsaveis.every((r) => r.categoriasTratamento.trim().length >= 10)
    },
    mensagem: 'A descrição das categorias de tratamento parece demasiado curta — detalha melhor.',
  },
  {
    id: 'SUBCONTRATANTE_DATA_CONTRATO_FORMATO',
    escopo: 'registo',
    severidade: 'erro',
    campo: 'subcontratantesContratados',
    descricao: 'A data do contrato de subcontratação, quando indicada, deve estar no formato AAAA-MM-DD.',
    verificar: (registo) => {
      if (registo.tipoRegisto !== 'responsavel') return true
      return (registo.subcontratantesContratados ?? []).every(
        (s) => !s.dataContrato || DATA_ISO_RE.test(s.dataContrato),
      )
    },
    mensagem: 'A data do contrato de subcontratação deve estar no formato AAAA-MM-DD.',
  },
  {
    id: 'REGISTOS_NOME_TRATAMENTO_UNICO',
    escopo: 'ficheiro',
    severidade: 'aviso',
    campo: 'nomeTratamento',
    descricao:
      'Dois registos com a mesma direção e o mesmo nome de tratamento são provavelmente um duplicado a rever.',
    avaliar: (ficheiro) => {
      const vistos = new Map<string, string>()
      const ocorrencias: Array<{ registoId: string | null; mensagem: string }> = []
      for (const registo of ficheiro.registos) {
        const chave = `${registo.direcao.trim().toLowerCase()}::${registo.nomeTratamento.trim().toLowerCase()}`
        if (vistos.has(chave)) {
          ocorrencias.push({
            registoId: registo.id,
            mensagem: `Já existe um registo com o mesmo nome de tratamento ("${registo.nomeTratamento}") na mesma direção.`,
          })
        } else {
          vistos.set(chave, registo.id)
        }
      }
      return ocorrencias
    },
  },
]
