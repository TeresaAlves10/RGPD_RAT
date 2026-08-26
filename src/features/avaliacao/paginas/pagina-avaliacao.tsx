import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { textos } from '@/i18n/pt'
import { useFicheiro } from '@/features/preenchimento/store/ficheiro-context'
import { CampoResposta } from '@/features/avaliacao/campo-resposta'
import type { Registo } from '@/domain/schema/registo'
import type {
  AvaliacaoControlos,
  ControlosOperacionais,
  FerramentasSistemas,
  GovernoConsentimento,
  GovernoSubcontratacao,
  RequisitosFuncionais,
  RespostaControlo,
} from '@/domain/schema/avaliacao'

const CHAVES_REQUISITOS = [
  'deverInformar',
  'direitoAcesso',
  'direitoRetificacao',
  'direitoApagamento',
  'direitoPortabilidade',
  'direitoLimitacao',
  'direitoNaoDecisoesAutomatizadas',
  'direitoOposicao',
  'detecaoNotificacaoViolacoes',
] as const

const CHAVES_CONTROLOS = [
  'procedimentosAcessosDocumentados',
  'procedimentosAcessosImplementados',
  'acessosFormalmenteAutorizados',
  'controlosAcessosPrivilegiados',
  'revisaoPeriodicaAcessos',
  'remocaoAcessosASaida',
] as const

const CHAVES_SUBCONTRATACAO = [
  'existeContrato',
  'contratoComClausulasProtecaoDados',
  'auditoriasAoSubcontratado',
  'pedidoAutorizacaoCnpd',
] as const

const CHAVES_CONSENTIMENTO = [
  'mecanismosDemonstracaoConsentimento',
  'consentimentoResponsabilidadeParental',
] as const

const CHAVES_FERRAMENTAS = [
  'ferramentasAplicacoes',
  'numeroCamposComDadosPessoais',
  'volumeDadosPessoais',
  'numeroUtilizadoresComAcesso',
  'suportesFisicos',
  'localizacaoSuportesFisicos',
] as const

function Seccao({
  titulo,
  nota,
  children,
}: {
  titulo: string
  nota?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <h2 className="text-base font-semibold">{titulo}</h2>
          {nota ? <p className="text-sm text-muted-foreground">{nota}</p> : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export function PaginaAvaliacao() {
  const { id } = useParams<{ id: string }>()
  const { ficheiro } = useFicheiro()

  const registo = useMemo(
    () => ficheiro.registos.find((r) => r.id === id),
    [ficheiro.registos, id],
  )

  if (!registo) return null
  return <FormularioAvaliacao key={registo.id} registo={registo} />
}

function FormularioAvaliacao({ registo }: { registo: Registo }) {
  const navigate = useNavigate()
  const { guardarRegisto } = useFicheiro()
  const [avaliacao, setAvaliacao] = useState<AvaliacaoControlos | undefined>(registo.avaliacao)

  function atualizar(alteracao: Partial<AvaliacaoControlos>) {
    setAvaliacao((atual) => ({ ...(atual ?? {}), ...alteracao }))
  }

  function resposta<T extends Record<string, unknown>>(
    grupo: T | undefined,
    chave: string,
  ): RespostaControlo | undefined {
    return grupo?.[chave] as RespostaControlo | undefined
  }

  function guardarComAvaliacao(nova: AvaliacaoControlos | undefined) {
    // O spread mantém o discriminante `tipoRegisto`; a anotação explícita
    // é necessária porque o TypeScript alarga-o ao espalhar uma união.
    const atualizado = { ...registo, avaliacao: nova } as Registo
    guardarRegisto(atualizado)
    navigate(`/registos/${registo.id}/editar`)
  }

  function desativar() {
    if (!window.confirm(textos.avaliacao.confirmarDesativar)) return
    guardarComAvaliacao(undefined)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/registos/${registo.id}/editar`)}
          className="no-print self-start text-sm font-medium text-primary hover:underline"
        >
          {textos.avaliacao.voltarAoRegisto}
        </button>
        <div className="flex flex-col gap-1.5 border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {registo.nomeTratamento}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{textos.avaliacao.titulo}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {textos.avaliacao.descricao}
          </p>
        </div>
      </div>

      {!avaliacao ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-medium">{textos.avaliacao.naoAtivado}</p>
              <p className="max-w-md text-sm text-muted-foreground">
                {textos.avaliacao.naoAtivadoDescricao}
              </p>
            </div>
            <Button onClick={() => setAvaliacao({})}>{textos.avaliacao.ativar}</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Seccao
            titulo={textos.avaliacao.seccoes.requisitosFuncionais}
            nota={textos.avaliacao.seccoes.requisitosFuncionaisNota}
          >
            <div className="flex flex-col gap-4">
              {CHAVES_REQUISITOS.map((chave) => (
                <CampoResposta
                  key={chave}
                  id={`req-${chave}`}
                  label={textos.avaliacao.campos[chave]}
                  valor={resposta(avaliacao.requisitosFuncionais, chave)}
                  onChange={(valor) =>
                    atualizar({
                      requisitosFuncionais: {
                        ...(avaliacao.requisitosFuncionais ?? {}),
                        [chave]: valor,
                      } as RequisitosFuncionais,
                    })
                  }
                />
              ))}
            </div>
          </Seccao>

          <Seccao
            titulo={textos.avaliacao.seccoes.controlosOperacionais}
            nota={textos.avaliacao.seccoes.controlosOperacionaisNota}
          >
            <div className="flex flex-col gap-4">
              {CHAVES_CONTROLOS.map((chave) => (
                <CampoResposta
                  key={chave}
                  id={`ctrl-${chave}`}
                  label={textos.avaliacao.campos[chave]}
                  valor={resposta(avaliacao.controlosOperacionais, chave)}
                  onChange={(valor) =>
                    atualizar({
                      controlosOperacionais: {
                        ...(avaliacao.controlosOperacionais ?? {}),
                        [chave]: valor,
                      } as ControlosOperacionais,
                    })
                  }
                />
              ))}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ctrl-notas">{textos.avaliacao.campos.notas}</Label>
                <Textarea
                  id="ctrl-notas"
                  value={avaliacao.controlosOperacionais?.notas ?? ''}
                  onChange={(e) =>
                    atualizar({
                      controlosOperacionais: {
                        ...(avaliacao.controlosOperacionais ?? {}),
                        notas: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </Seccao>

          <Seccao
            titulo={textos.avaliacao.seccoes.ferramentasSistemas}
            nota={textos.avaliacao.seccoes.ferramentasSistemasNota}
          >
            <div className="flex flex-col gap-4">
              {CHAVES_FERRAMENTAS.map((chave) => (
                <div key={chave} className="flex flex-col gap-1.5">
                  <Label htmlFor={`ferr-${chave}`}>{textos.avaliacao.campos[chave]}</Label>
                  <Input
                    id={`ferr-${chave}`}
                    value={avaliacao.ferramentasSistemas?.[chave] ?? ''}
                    onChange={(e) =>
                      atualizar({
                        ferramentasSistemas: {
                          ...(avaliacao.ferramentasSistemas ?? {}),
                          [chave]: e.target.value,
                        } as FerramentasSistemas,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Seccao>

          <Seccao
            titulo={textos.avaliacao.seccoes.governoSubcontratacao}
            nota={textos.avaliacao.seccoes.governoSubcontratacaoNota}
          >
            <div className="flex flex-col gap-4">
              {CHAVES_SUBCONTRATACAO.map((chave) => (
                <CampoResposta
                  key={chave}
                  id={`sub-${chave}`}
                  label={textos.avaliacao.campos[chave]}
                  valor={resposta(avaliacao.governoSubcontratacao, chave)}
                  onChange={(valor) =>
                    atualizar({
                      governoSubcontratacao: {
                        ...(avaliacao.governoSubcontratacao ?? {}),
                        [chave]: valor,
                      } as GovernoSubcontratacao,
                    })
                  }
                />
              ))}
            </div>
          </Seccao>

          <Seccao
            titulo={textos.avaliacao.seccoes.governoConsentimento}
            nota={textos.avaliacao.seccoes.governoConsentimentoNota}
          >
            <div className="flex flex-col gap-4">
              {CHAVES_CONSENTIMENTO.map((chave) => (
                <CampoResposta
                  key={chave}
                  id={`cons-${chave}`}
                  label={textos.avaliacao.campos[chave]}
                  valor={resposta(avaliacao.governoConsentimento, chave)}
                  onChange={(valor) =>
                    atualizar({
                      governoConsentimento: {
                        ...(avaliacao.governoConsentimento ?? {}),
                        [chave]: valor,
                      } as GovernoConsentimento,
                    })
                  }
                />
              ))}
            </div>
          </Seccao>

          <Seccao titulo={textos.avaliacao.seccoes.outros}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="normativos">{textos.avaliacao.campos.normativosAplicaveis}</Label>
                <Textarea
                  id="normativos"
                  value={avaliacao.normativosAplicaveis ?? ''}
                  onChange={(e) => atualizar({ normativosAplicaveis: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="diagrama">{textos.avaliacao.campos.diagramaProcesso}</Label>
                <Input
                  id="diagrama"
                  value={avaliacao.diagramaProcesso ?? ''}
                  onChange={(e) => atualizar({ diagramaProcesso: e.target.value })}
                />
              </div>
            </div>
          </Seccao>

          <div className="no-print flex flex-wrap justify-between gap-3 border-t border-border pt-6">
            <Button variant="ghost" onClick={desativar}>
              {textos.avaliacao.desativar}
            </Button>
            <Button onClick={() => guardarComAvaliacao(avaliacao)}>{textos.avaliacao.guardar}</Button>
          </div>
        </>
      )}
    </div>
  )
}
