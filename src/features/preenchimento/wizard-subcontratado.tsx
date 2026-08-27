import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Campo } from '@/components/form/campo'
import { PassosWizard, idPainelPasso } from '@/components/form/passos-wizard'
import { textos } from '@/i18n/pt'
import { NOME_ORGANIZACAO, DIRECAO_POR_OMISSAO, UNIDADES_COORDENACAO } from '@/config/organizacao'
import { registoSubcontratadoSchema, type RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { CampoSimNao } from '@/features/preenchimento/campos/campo-sim-nao'
import { CampoEscala } from '@/features/preenchimento/campos/campo-escala'
import { CampoAnexos } from '@/features/preenchimento/campos/campo-anexos'
import { avaliarRegisto } from '@/domain/rules/motor'
import { AcoesEstado } from '@/features/preenchimento/acoes-estado'

/**
 * Formulário do subcontratante (art. 30.º/2).
 *
 * Replica as sete secções do responsável, como pedido, com as diferenças
 * próprias desta qualidade: o responsável por conta de quem se atua, o
 * responsável conjunto, a recolha, os destinatários e a base legal.
 */
const PASSOS = [
  textos.passos.caracterizacao,
  textos.passos.ferramentas,
  textos.passos.subcontratados,
  textos.passos.baseLicitude,
  textos.passos.requisitosFuncionais,
  textos.passos.controlosOperacionais,
  textos.passos.observacoesGerais,
] as const

const CAMPOS_POR_PASSO: (keyof RegistoSubcontratado)[][] = [
  [
    'nomeResponsavelTratamento',
    'responsavelConjunto',
    'direcao',
    'unidadeCoordenacao',
    'nomeTratamento',
    'descricao',
    'finalidade',
    'operacoesTratamento',
    'recolhaDados',
    'dadosPessoais',
    'dadosNecessariosParaFinalidade',
    'categoriasDados',
    'categoriasEspeciais',
    'categoriasEspeciaisNecessarias',
    'categoriasTitulares',
    'entidadesQueEnviamDados',
    'destinatarios',
    'suportesFisicos',
    'localizacaoSuportesFisicos',
  ],
  [
    'ferramentasAplicacoes',
    'numeroCamposComDadosPessoais',
    'volumeDadosPessoais',
    'numeroUtilizadoresComAcesso',
  ],
  [
    'entidadesSubcontratadas',
    'operacoesTratamentoSubcontratadas',
    'existeContrato',
    'contratoComClausulasProtecaoDados',
    'anexosContrato',
    'transferenciasPaisesTerceiros',
    'paisesTerceiros',
    'auditoriasAoSubcontratado',
    'pedidoAutorizacaoCnpd',
  ],
  [
    'baseLegal',
    'consentimentoMecanismosDemonstracao',
    'consentimentoResponsabilidadeParental',
    'prazoConservacao',
    'criterioRetencao',
    'retencaoPorNormativosLegais',
  ],
  [
    'deverInformar',
    'direitoAcesso',
    'direitoRetificacao',
    'direitoApagamento',
    'direitoPortabilidade',
    'direitoLimitacao',
    'direitoDecisoesAutomatizadas',
    'direitoOposicao',
  ],
  [
    'procedimentosAcessosDocumentados',
    'procedimentosAcessosImplementados',
    'acessosFormalmenteAutorizados',
    'controlosAcessosPrivilegiados',
    'revisaoPeriodicaAcessos',
    'remocaoAcessosASaida',
    'detecaoNotificacaoViolacoes',
  ],
  ['medidasTecnicasOrganizativas', 'normativosAplicaveis', 'anexos', 'aipdRealizada', 'gestorProjeto', 'observacoes'],
]

const DIREITOS = [
  'deverInformar',
  'direitoAcesso',
  'direitoRetificacao',
  'direitoApagamento',
  'direitoPortabilidade',
  'direitoLimitacao',
  'direitoDecisoesAutomatizadas',
  'direitoOposicao',
] as const

const CONTROLOS = [
  'procedimentosAcessosDocumentados',
  'procedimentosAcessosImplementados',
  'acessosFormalmenteAutorizados',
  'controlosAcessosPrivilegiados',
  'revisaoPeriodicaAcessos',
  'remocaoAcessosASaida',
] as const

interface WizardSubcontratadoProps {
  registoInicial?: RegistoSubcontratado
  proximoNumero?: number
  onGuardar: (registo: RegistoSubcontratado) => void
  onCancelar: () => void
  permiteValidar?: boolean
}

export function WizardSubcontratado({
  registoInicial,
  proximoNumero = 1,
  onGuardar,
  onCancelar,
  permiteValidar,
}: WizardSubcontratadoProps) {
  const [passo, setPasso] = useState(0)

  const valoresIniciais = useMemo<RegistoSubcontratado>(
    () =>
      registoInicial ?? {
        id: crypto.randomUUID(),
        numero: proximoNumero,
        tipoRegisto: 'subcontratado',
        estado: 'rascunho',
        direcao: DIRECAO_POR_OMISSAO,
        nomeTratamento: '',
        gestorProjeto: { nome: '' },
        anexos: [],
        anexosContrato: [],
        anotacoes: [],
      },
    [registoInicial, proximoNumero],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistoSubcontratado>({
    resolver: zodResolver(registoSubcontratadoSchema),
    defaultValues: valoresIniciais,
  })

  const registoAtual = watch()
  const ocorrencias = useMemo(() => avaliarRegisto(registoAtual), [registoAtual])
  const erros = useMemo(() => ocorrencias.filter((o) => o.severidade === 'erro'), [ocorrencias])
  const temCategoriasEspeciais = watch('categoriasEspeciais') === 'sim'
  const temTransferencias = watch('transferenciasPaisesTerceiros') === 'sim'

  const passosComErro = new Set(
    CAMPOS_POR_PASSO.map((campos, indice) =>
      campos.some((campo) => Boolean((errors as Record<string, unknown>)[campo])) ? indice : -1,
    ).filter((i) => i >= 0),
  )

  const painel = (indice: number) => ({
    className: 'flex flex-col gap-4',
    role: 'tabpanel' as const,
    id: idPainelPasso('wizard-subcontratado', indice),
    'aria-labelledby': `wizard-subcontratado-tab-${indice}`,
  })

  return (
    <form
      onSubmit={handleSubmit((dados) => onGuardar({ ...dados, estado: 'submetido' }))}
      className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10"
    >
      <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <PassosWizard
          idBase="wizard-subcontratado"
          titulos={PASSOS}
          passoAtual={passo}
          passosComErro={passosComErro}
          onMudarPasso={setPasso}
        />
        <AcoesEstado
          estado={watch('estado')}
          erros={erros}
          permiteValidar={permiteValidar}
          onMudar={(novo) => setValue('estado', novo, { shouldDirty: true })}
        />
        <p className="hidden border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground lg:block">
          {textos.formulario.notaRascunho}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{textos.formulario.obrigatorio}</p>
          <p className="text-xs text-muted-foreground">
            {textos.campos.numero}: <strong>{watch('numero')}</strong>
          </p>
        </div>

        {passo === 0 ? (
          <div {...painel(0)}>
            <Campo
              id="nomeResponsavelTratamento"
              label={textos.campos.nomeResponsavelTratamento}
              obrigatorio
            >
              <Input id="nomeResponsavelTratamento" {...register('nomeResponsavelTratamento')} />
            </Campo>
            <Campo id="responsavelConjunto" label={textos.campos.responsavelConjunto} obrigatorio>
              <Input id="responsavelConjunto" {...register('responsavelConjunto')} />
            </Campo>
            <Campo id="direcao" label={textos.campos.direcao} obrigatorio>
              <Input id="direcao" {...register('direcao')} />
            </Campo>
            <Campo id="unidadeCoordenacao" label={textos.campos.unidadeCoordenacao} obrigatorio>
              {/* Um <select> sem escolha devolve '', que falharia o enum:
                  converte-se para undefined, que é "por responder". */}
              <Select
                id="unidadeCoordenacao"
                {...register('unidadeCoordenacao', { setValueAs: (v) => v || undefined })}
              >
                <option value="">{textos.respostas.porResponder}</option>
                {UNIDADES_COORDENACAO.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.sigla} — {unidade.nome}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo
              id="nomeTratamento"
              label={textos.campos.nomeTratamento}
              obrigatorio
              erro={errors.nomeTratamento?.message}
            >
              <Input id="nomeTratamento" {...register('nomeTratamento')} />
            </Campo>
            <Campo id="descricao" label={textos.campos.descricao} obrigatorio ajuda="descricao">
              <Textarea id="descricao" rows={5} {...register('descricao')} />
            </Campo>
            <Campo id="finalidade" label={textos.campos.finalidade} obrigatorio ajuda="finalidade">
              <Textarea id="finalidade" {...register('finalidade')} />
            </Campo>
            <Campo
              id="operacoesTratamento"
              label={textos.campos.operacoesTratamento}
              obrigatorio
              ajuda="operacoesTratamento"
            >
              <Textarea id="operacoesTratamento" {...register('operacoesTratamento')} />
            </Campo>
            <Campo id="recolhaDados" label={textos.campos.recolhaDados} obrigatorio>
              <Textarea id="recolhaDados" {...register('recolhaDados')} />
            </Campo>
            <Campo id="dadosPessoais" label={textos.campos.dadosPessoais} obrigatorio ajuda="dadosPessoais">
              <Textarea id="dadosPessoais" {...register('dadosPessoais')} />
            </Campo>
            <Controller
              control={control}
              name="dadosNecessariosParaFinalidade"
              render={({ field }) => (
                <CampoSimNao
                  id="dadosNecessariosParaFinalidade"
                  label={textos.campos.dadosNecessariosParaFinalidade}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            <Campo
              id="categoriasDados"
              label={textos.campos.categoriasDados}
              obrigatorio
              ajuda="categoriasDados"
            >
              <Textarea id="categoriasDados" rows={4} {...register('categoriasDados')} />
            </Campo>
            <Controller
              control={control}
              name="categoriasEspeciais"
              render={({ field }) => (
                <CampoSimNao
                  id="categoriasEspeciais"
                  label={textos.campos.categoriasEspeciais}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            {temCategoriasEspeciais ? (
              <Controller
                control={control}
                name="categoriasEspeciaisNecessarias"
                render={({ field }) => (
                  <CampoSimNao
                    id="categoriasEspeciaisNecessarias"
                    label={textos.campos.categoriasEspeciaisNecessarias}
                    valor={field.value}
                    onChange={field.onChange}
                    obrigatorio
                  />
                )}
              />
            ) : null}
            <Campo
              id="categoriasTitulares"
              label={textos.campos.categoriasTitulares}
              obrigatorio
              ajuda="categoriasTitulares"
            >
              <Textarea id="categoriasTitulares" {...register('categoriasTitulares')} />
            </Campo>
            <Campo id="entidadesQueEnviamDados" label={textos.campos.entidadesQueEnviamDados} obrigatorio>
              <Textarea id="entidadesQueEnviamDados" {...register('entidadesQueEnviamDados')} />
            </Campo>
            <Campo id="destinatarios" label={textos.campos.destinatarios} obrigatorio ajuda="destinatarios">
              <Textarea id="destinatarios" {...register('destinatarios')} />
            </Campo>
            <Campo id="suportesFisicos" label={textos.campos.suportesFisicos} obrigatorio>
              <Textarea id="suportesFisicos" {...register('suportesFisicos')} />
            </Campo>
            <Campo
              id="localizacaoSuportesFisicos"
              label={textos.campos.localizacaoSuportesFisicos}
              obrigatorio
            >
              <Input id="localizacaoSuportesFisicos" {...register('localizacaoSuportesFisicos')} />
            </Campo>
          </div>
        ) : null}

        {passo === 1 ? (
          <div {...painel(1)}>
            <Campo id="ferramentasAplicacoes" label={textos.campos.ferramentasAplicacoes} obrigatorio>
              <Textarea id="ferramentasAplicacoes" {...register('ferramentasAplicacoes')} />
            </Campo>
            {(
              [
                ['numeroCamposComDadosPessoais', textos.campos.numeroCamposComDadosPessoais],
                ['volumeDadosPessoais', textos.campos.volumeDadosPessoais],
                ['numeroUtilizadoresComAcesso', textos.campos.numeroUtilizadoresComAcesso],
              ] as const
            ).map(([campo, rotulo]) => (
              <Controller
                key={campo}
                control={control}
                name={campo}
                render={({ field }) => (
                  <CampoEscala
                    id={campo}
                    label={rotulo}
                    valor={field.value}
                    onChange={field.onChange}
                    obrigatorio
                  />
                )}
              />
            ))}
          </div>
        ) : null}

        {passo === 2 ? (
          <div {...painel(2)}>
            <Campo id="entidadesSubcontratadas" label={textos.campos.entidadesSubcontratadas} obrigatorio>
              <Textarea id="entidadesSubcontratadas" {...register('entidadesSubcontratadas')} />
            </Campo>
            <Campo
              id="operacoesTratamentoSubcontratadas"
              label={textos.campos.operacoesTratamentoSubcontratadas}
              obrigatorio
              ajuda="operacoesTratamentoSubcontratadas"
            >
              <Textarea
                id="operacoesTratamentoSubcontratadas"
                {...register('operacoesTratamentoSubcontratadas')}
              />
            </Campo>
            <Controller
              control={control}
              name="existeContrato"
              render={({ field }) => (
                <CampoSimNao
                  id="existeContrato"
                  label={textos.campos.existeContrato}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            <Controller
              control={control}
              name="contratoComClausulasProtecaoDados"
              render={({ field }) => (
                <CampoSimNao
                  id="contratoComClausulasProtecaoDados"
                  label={textos.campos.contratoComClausulasProtecaoDados}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            <Campo id="anexosContrato" label={textos.campos.anexosContrato}>
              <Controller
                control={control}
                name="anexosContrato"
                render={({ field }) => (
                  <CampoAnexos valor={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </Campo>
            <Controller
              control={control}
              name="transferenciasPaisesTerceiros"
              render={({ field }) => (
                <CampoSimNao
                  id="transferenciasPaisesTerceiros"
                  label={textos.campos.transferenciasPaisesTerceiros}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            {temTransferencias ? (
              <Campo id="paisesTerceiros" label={textos.campos.paisesTerceiros} obrigatorio ajuda="transferencias">
                <Input id="paisesTerceiros" {...register('paisesTerceiros')} />
              </Campo>
            ) : null}
            <Controller
              control={control}
              name="auditoriasAoSubcontratado"
              render={({ field }) => (
                <CampoSimNao
                  id="auditoriasAoSubcontratado"
                  label={textos.campos.auditoriasAoSubcontratado}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            <Controller
              control={control}
              name="pedidoAutorizacaoCnpd"
              render={({ field }) => (
                <CampoSimNao
                  id="pedidoAutorizacaoCnpd"
                  label={textos.campos.pedidoAutorizacaoCnpd}
                  valor={field.value}
                  onChange={field.onChange}
                  comNaoSei
                  obrigatorio
                />
              )}
            />
          </div>
        ) : null}

        {passo === 3 ? (
          <div {...painel(3)}>
            <Campo id="baseLegal" label={textos.campos.baseLegal} obrigatorio ajuda="baseLicitude">
              <Textarea id="baseLegal" rows={4} {...register('baseLegal')} />
            </Campo>

            <p className="rounded-md border border-primary-border bg-primary-soft p-3 text-sm text-primary-strong">
              {textos.formulario.notaConsentimento}
            </p>
            <Campo
              id="consentimentoMecanismosDemonstracao"
              label={textos.campos.consentimentoMecanismosDemonstracao}
            >
              <Textarea
                id="consentimentoMecanismosDemonstracao"
                {...register('consentimentoMecanismosDemonstracao')}
              />
            </Campo>
            <Controller
              control={control}
              name="consentimentoResponsabilidadeParental"
              render={({ field }) => (
                <CampoSimNao
                  id="consentimentoResponsabilidadeParental"
                  label={textos.campos.consentimentoResponsabilidadeParental}
                  valor={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Campo
              id="prazoConservacao"
              label={textos.campos.prazoConservacao}
              obrigatorio
              ajuda="prazoConservacao"
            >
              <Textarea id="prazoConservacao" {...register('prazoConservacao')} />
            </Campo>
            <Campo
              id="criterioRetencao"
              label={textos.campos.criterioRetencao(NOME_ORGANIZACAO)}
              obrigatorio
            >
              <Textarea id="criterioRetencao" {...register('criterioRetencao')} />
            </Campo>
            <Campo
              id="retencaoPorNormativosLegais"
              label={textos.campos.retencaoPorNormativosLegais}
              obrigatorio
            >
              <Textarea id="retencaoPorNormativosLegais" {...register('retencaoPorNormativosLegais')} />
            </Campo>
          </div>
        ) : null}

        {passo === 4 ? (
          <div {...painel(4)}>
            {DIREITOS.map((campo) => (
              <Campo key={campo} id={campo} label={textos.campos[campo]} obrigatorio ajuda={campo}>
                <Textarea id={campo} {...register(campo)} />
              </Campo>
            ))}
          </div>
        ) : null}

        {passo === 5 ? (
          <div {...painel(5)}>
            {CONTROLOS.map((campo) => (
              <Controller
                key={campo}
                control={control}
                name={campo}
                render={({ field }) => (
                  <CampoSimNao
                    id={campo}
                    label={textos.campos[campo]}
                    valor={field.value}
                    onChange={field.onChange}
                    obrigatorio
                  />
                )}
              />
            ))}
            {/* Movida dos direitos dos titulares para aqui, a pedido do
                utilizador. Mantém-se em texto livre, como os direitos. */}
            <Campo
              id="detecaoNotificacaoViolacoes"
              label={textos.campos.detecaoNotificacaoViolacoes}
              obrigatorio
            >
              <Textarea
                id="detecaoNotificacaoViolacoes"
                {...register('detecaoNotificacaoViolacoes')}
              />
            </Campo>
          </div>
        ) : null}

        {passo === 6 ? (
          <div {...painel(6)}>
            <Campo
              id="medidasTecnicasOrganizativas"
              label={textos.campos.medidasTecnicasOrganizativas}
              obrigatorio
              ajuda="medidasTecnicasOrganizativas"
            >
              <Textarea
                id="medidasTecnicasOrganizativas"
                rows={4}
                {...register('medidasTecnicasOrganizativas')}
              />
            </Campo>
            <Campo id="normativosAplicaveis" label={textos.campos.normativosAplicaveis} obrigatorio>
              <Textarea id="normativosAplicaveis" {...register('normativosAplicaveis')} />
            </Campo>
            <Campo id="anexos" label={textos.campos.anexos}>
              <Controller
                control={control}
                name="anexos"
                render={({ field }) => (
                  <CampoAnexos valor={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </Campo>
            <Controller
              control={control}
              name="aipdRealizada"
              render={({ field }) => (
                <CampoSimNao
                  id="aipdRealizada"
                  label={textos.campos.aipdRealizada}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                  destaque
                />
              )}
            />
            <Campo
              id="gestorProjeto.nome"
              label={textos.campos['gestorProjeto.nome']}
              obrigatorio
              erro={errors.gestorProjeto?.nome?.message}
            >
              <Input id="gestorProjeto.nome" {...register('gestorProjeto.nome')} />
            </Campo>
            <Campo id="gestorProjeto.contacto" label={textos.campos['gestorProjeto.contacto']}>
              <Input id="gestorProjeto.contacto" {...register('gestorProjeto.contacto')} />
            </Campo>
            <Campo id="observacoes" label={textos.campos.observacoes}>
              <Textarea id="observacoes" {...register('observacoes')} />
            </Campo>
          </div>
        ) : null}

        {ocorrencias.length > 0 ? (
          <div className="rounded-lg border border-warning-border bg-warning-soft p-4">
            <p className="text-sm font-semibold text-warning">{textos.formulario.avisosTitulo}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{textos.formulario.avisosDescricao}</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {ocorrencias.map((ocorrencia) => (
                <li
                  key={ocorrencia.regraId}
                  className={ocorrencia.severidade === 'erro' ? 'text-destructive' : 'text-foreground'}
                >
                  {ocorrencia.mensagem}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onCancelar}>
            {textos.formulario.botaoCancelar}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={passo === 0}
              onClick={() => setPasso((p) => Math.max(0, p - 1))}
            >
              {textos.formulario.botaoAnterior}
            </Button>
            {passo < PASSOS.length - 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasso((p) => Math.min(PASSOS.length - 1, p + 1))}
              >
                {textos.formulario.botaoSeguinte}
              </Button>
            ) : null}
            {/* Guardar está sempre disponível: quem edita um registo já
                preenchido não deve ter de percorrer todos os passos. */}
            <Button type="button" variant="outline" onClick={handleSubmit(onGuardar)}>
              {textos.formulario.botaoGuardar}
            </Button>
            {/* Submeter guarda e marca o registo de uma só vez — é o que a
                pessoa quer fazer quando chega ao fim do formulário. Fica
                indisponível enquanto faltar um campo obrigatório. */}
            <Button
              type="submit"
              disabled={erros.length > 0}
              title={erros.length > 0 ? textos.estado.submeterBloqueado : undefined}
            >
              {textos.estado.submeter}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
