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
import { baseLicitude, categoriasTitulares } from '@/domain/schema/vocabularios'
import { registoResponsavelSchema, type RegistoResponsavel } from '@/domain/schema/responsavel'
import { SeletorMultiplo } from '@/features/preenchimento/campos/seletor-multiplo'
import { CampoMedidas } from '@/features/preenchimento/campos/campo-medidas'
import { CampoCategoriasDados } from '@/features/preenchimento/campos/campo-categorias-dados'
import { CampoSimNao } from '@/features/preenchimento/campos/campo-sim-nao'
import { CampoSubcontratados } from '@/features/preenchimento/campos/campo-subcontratados'
import { avaliarRegisto } from '@/domain/rules/motor'
import { AcoesEstado } from '@/features/preenchimento/acoes-estado'

/**
 * Formulário do responsável pelo tratamento.
 *
 * As sete secções e a ordem dos campos dentro de cada uma seguem a
 * especificação do utilizador — ver src/domain/schema/responsavel.ts.
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

const CAMPOS_POR_PASSO: (keyof RegistoResponsavel)[][] = [
  [
    'direcao',
    'unidadeCoordenacao',
    'nomeTratamento',
    'descricao',
    'finalidade',
    'operacoesTratamento',
    'trataDadosPessoais',
    'dadosNecessariosParaFinalidade',
    'categoriasEspeciais',
    'categoriasEspeciaisNecessarias',
    'categoriasTitulares',
    'categoriasDados',
    'entidadesQueEnviamDados',
    'entidadesParaQuemEnvioDados',
    'suportesFisicos',
    'localizacaoSuportesFisicos',
  ],
  [
    'ferramentasAplicacoes',
    'numeroCamposComDadosPessoais',
    'volumeDadosPessoais',
    'numeroUtilizadoresComAcesso',
  ],
  ['subcontratados'],
  [
    'baseLicitude',
    'consentimentoMecanismosDemonstracao',
    'consentimentoResponsabilidadeParental',
    'retencaoDefinidaPelaOrganizacao',
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
    'detecaoNotificacaoViolacoes',
  ],
  [
    'procedimentosAcessosDocumentados',
    'procedimentosAcessosImplementados',
    'acessosFormalmenteAutorizados',
    'controlosAcessosPrivilegiados',
    'revisaoPeriodicaAcessos',
    'remocaoAcessosASaida',
  ],
  [
    'medidasTecnicasOrganizativas',
    'normativosAplicaveis',
    'diagramaProcesso',
    'aipdRealizada',
    'gestorProjeto',
    'observacoes',
  ],
]

/** Os nove direitos dos titulares, na ordem da especificação. */
const DIREITOS = [
  'deverInformar',
  'direitoAcesso',
  'direitoRetificacao',
  'direitoApagamento',
  'direitoPortabilidade',
  'direitoLimitacao',
  'direitoDecisoesAutomatizadas',
  'direitoOposicao',
  'detecaoNotificacaoViolacoes',
] as const

/** Os seis controlos de gestão de acessos, na ordem da especificação. */
const CONTROLOS = [
  'procedimentosAcessosDocumentados',
  'procedimentosAcessosImplementados',
  'acessosFormalmenteAutorizados',
  'controlosAcessosPrivilegiados',
  'revisaoPeriodicaAcessos',
  'remocaoAcessosASaida',
] as const

interface WizardResponsavelProps {
  registoInicial?: RegistoResponsavel
  onGuardar: (registo: RegistoResponsavel) => void
  onCancelar: () => void
  /** Nome da organização, para o rótulo do período de retenção. */
  organizacao?: string
}

export function WizardResponsavel({
  registoInicial,
  onGuardar,
  onCancelar,
  organizacao,
}: WizardResponsavelProps) {
  const [passo, setPasso] = useState(0)

  const valoresIniciais = useMemo<RegistoResponsavel>(
    () =>
      registoInicial ?? {
        id: crypto.randomUUID(),
        tipoRegisto: 'responsavel',
        estado: 'rascunho',
        direcao: '',
        nomeTratamento: '',
        gestorProjeto: { nome: '' },
        categoriasTitulares: [],
        categoriasDados: [],
        medidasTecnicasOrganizativas: [],
        subcontratados: [],
        categoriasEspeciais: {},
        anotacoes: [],
      },
    [registoInicial],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistoResponsavel>({
    resolver: zodResolver(registoResponsavelSchema),
    defaultValues: valoresIniciais,
  })

  const registoAtual = watch()
  const ocorrencias = useMemo(() => avaliarRegisto(registoAtual), [registoAtual])
  const erros = useMemo(() => ocorrencias.filter((o) => o.severidade === 'erro'), [ocorrencias])
  const temCategoriasEspeciais = watch('categoriasEspeciais.aplicavel') === 'sim'
  const baseEhConsentimento = watch('baseLicitude') === 'consentimento'

  const passosComErro = new Set(
    CAMPOS_POR_PASSO.map((campos, indice) =>
      campos.some((campo) => Boolean((errors as Record<string, unknown>)[campo])) ? indice : -1,
    ).filter((i) => i >= 0),
  )

  const painel = (indice: number) => ({
    className: 'flex flex-col gap-4',
    role: 'tabpanel' as const,
    id: idPainelPasso('wizard-responsavel', indice),
    'aria-labelledby': `wizard-responsavel-tab-${indice}`,
  })

  return (
    <form
      onSubmit={handleSubmit(onGuardar)}
      className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10"
    >
      <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <PassosWizard
          idBase="wizard-responsavel"
          titulos={PASSOS}
          passoAtual={passo}
          passosComErro={passosComErro}
          onMudarPasso={setPasso}
        />
        <AcoesEstado
          estado={watch('estado')}
          erros={erros}
          onMudar={(novo) => setValue('estado', novo, { shouldDirty: true })}
        />
        <p className="hidden border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground lg:block">
          {textos.formulario.notaRascunho}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <p className="text-xs text-muted-foreground">{textos.formulario.obrigatorio}</p>

        {/* ── 1. Descrição do Processo / Caracterização ───────────── */}
        {passo === 0 ? (
          <div {...painel(0)}>
            <Campo id="direcao" label={textos.campos.direcao} obrigatorio erro={errors.direcao?.message}>
              <Input id="direcao" {...register('direcao')} />
            </Campo>
            <Campo id="unidadeCoordenacao" label={textos.campos.unidadeCoordenacao} obrigatorio>
              <Input id="unidadeCoordenacao" {...register('unidadeCoordenacao')} />
            </Campo>
            <Campo
              id="nomeTratamento"
              label={textos.campos.nomeTratamento}
              obrigatorio
              erro={errors.nomeTratamento?.message}
            >
              <Input id="nomeTratamento" {...register('nomeTratamento')} />
            </Campo>
            <Campo id="descricao" label={textos.campos.descricao} obrigatorio>
              <Textarea id="descricao" {...register('descricao')} />
            </Campo>
            <Campo id="finalidade" label={textos.campos.finalidade} obrigatorio ajuda="finalidades">
              <Textarea id="finalidade" {...register('finalidade')} />
            </Campo>
            <Campo id="operacoesTratamento" label={textos.campos.operacoesTratamento} obrigatorio>
              <Textarea id="operacoesTratamento" {...register('operacoesTratamento')} />
            </Campo>

            <Controller
              control={control}
              name="trataDadosPessoais"
              render={({ field }) => (
                <CampoSimNao
                  id="trataDadosPessoais"
                  label={textos.campos.trataDadosPessoais}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
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
            <Controller
              control={control}
              name="categoriasEspeciais.aplicavel"
              render={({ field }) => (
                <CampoSimNao
                  id="categoriasEspeciais.aplicavel"
                  label={textos.campos['categoriasEspeciais.aplicavel']}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            {temCategoriasEspeciais ? (
              <>
                <Campo
                  id="categoriasEspeciais.identificar"
                  label={textos.campos['categoriasEspeciais.identificar']}
                  obrigatorio
                  ajuda="categoriasEspeciais"
                >
                  <Textarea
                    id="categoriasEspeciais.identificar"
                    {...register('categoriasEspeciais.identificar')}
                  />
                </Campo>
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
              </>
            ) : null}

            <Campo
              id="categoriasTitulares"
              label={textos.campos.categoriasTitulares}
              obrigatorio
              ajuda="categoriasTitulares"
            >
              <Controller
                control={control}
                name="categoriasTitulares"
                render={({ field }) => (
                  <SeletorMultiplo
                    name="categoriasTitulares"
                    opcoes={categoriasTitulares}
                    valor={field.value ?? []}
                    onChange={field.onChange}
                    valorOutro={watch('categoriasTitularesOutra')}
                    onChangeOutro={(v) => setValue('categoriasTitularesOutra', v)}
                  />
                )}
              />
            </Campo>
            <Campo
              id="categoriasDados"
              label={textos.campos.categoriasDados}
              obrigatorio
              ajuda="categoriasDados"
            >
              <Controller
                control={control}
                name="categoriasDados"
                render={({ field }) => (
                  <CampoCategoriasDados valor={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </Campo>

            <Campo id="entidadesQueEnviamDados" label={textos.campos.entidadesQueEnviamDados} obrigatorio>
              <Textarea id="entidadesQueEnviamDados" {...register('entidadesQueEnviamDados')} />
            </Campo>
            <Campo
              id="entidadesParaQuemEnvioDados"
              label={textos.campos.entidadesParaQuemEnvioDados}
              obrigatorio
              ajuda="destinatarios"
            >
              <Textarea id="entidadesParaQuemEnvioDados" {...register('entidadesParaQuemEnvioDados')} />
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

        {/* ── 2. Ferramentas / Aplicações utilizadas ──────────────── */}
        {passo === 1 ? (
          <div {...painel(1)}>
            <Campo id="ferramentasAplicacoes" label={textos.campos.ferramentasAplicacoes} obrigatorio>
              <Textarea id="ferramentasAplicacoes" {...register('ferramentasAplicacoes')} />
            </Campo>
            <Campo
              id="numeroCamposComDadosPessoais"
              label={textos.campos.numeroCamposComDadosPessoais}
              obrigatorio
            >
              <Input id="numeroCamposComDadosPessoais" {...register('numeroCamposComDadosPessoais')} />
            </Campo>
            <Campo id="volumeDadosPessoais" label={textos.campos.volumeDadosPessoais} obrigatorio>
              <Input id="volumeDadosPessoais" {...register('volumeDadosPessoais')} />
            </Campo>
            <Campo
              id="numeroUtilizadoresComAcesso"
              label={textos.campos.numeroUtilizadoresComAcesso}
              obrigatorio
            >
              <Input id="numeroUtilizadoresComAcesso" {...register('numeroUtilizadoresComAcesso')} />
            </Campo>
          </div>
        ) : null}

        {/* ── 3. Subcontratados ───────────────────────────────────── */}
        {passo === 2 ? (
          <div {...painel(2)}>
            <Campo id="subcontratados" label={textos.campos.subcontratados} ajuda="subcontratantes">
              <Controller
                control={control}
                name="subcontratados"
                render={({ field }) => (
                  <CampoSubcontratados valor={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </Campo>
          </div>
        ) : null}

        {/* ── 4. Base de Licitude ─────────────────────────────────── */}
        {passo === 3 ? (
          <div {...painel(3)}>
            <Campo
              id="baseLicitude"
              label={textos.campos.baseLicitude}
              obrigatorio
              erro={errors.baseLicitude?.message}
              ajuda="baseLicitude"
            >
              <Select id="baseLicitude" {...register('baseLicitude')}>
                <option value="">{textos.respostas.porResponder}</option>
                {baseLicitude.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.label}
                  </option>
                ))}
              </Select>
            </Campo>

            {baseEhConsentimento ? (
              <>
                <p className="rounded-md border border-primary-border bg-primary-soft p-3 text-sm text-primary-strong">
                  {textos.formulario.notaConsentimento}
                </p>
                <Controller
                  control={control}
                  name="consentimentoMecanismosDemonstracao"
                  render={({ field }) => (
                    <CampoSimNao
                      id="consentimentoMecanismosDemonstracao"
                      label={textos.campos.consentimentoMecanismosDemonstracao}
                      valor={field.value}
                      onChange={field.onChange}
                      obrigatorio
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="consentimentoResponsabilidadeParental"
                  render={({ field }) => (
                    <CampoSimNao
                      id="consentimentoResponsabilidadeParental"
                      label={textos.campos.consentimentoResponsabilidadeParental}
                      valor={field.value}
                      onChange={field.onChange}
                      obrigatorio
                    />
                  )}
                />
              </>
            ) : null}

            <Controller
              control={control}
              name="retencaoDefinidaPelaOrganizacao"
              render={({ field }) => (
                <CampoSimNao
                  id="retencaoDefinidaPelaOrganizacao"
                  label={textos.campos.retencaoDefinidaPelaOrganizacao(organizacao || 'a organização')}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            <Controller
              control={control}
              name="retencaoPorNormativosLegais"
              render={({ field }) => (
                <CampoSimNao
                  id="retencaoPorNormativosLegais"
                  label={textos.campos.retencaoPorNormativosLegais}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
          </div>
        ) : null}

        {/* ── 5. Requisitos Funcionais / Direitos dos Titulares ───── */}
        {passo === 4 ? (
          <div {...painel(4)}>
            {DIREITOS.map((campo) => (
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
                    comParcial
                    obrigatorio
                  />
                )}
              />
            ))}
          </div>
        ) : null}

        {/* ── 6. Controlos Operacionais ───────────────────────────── */}
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
                    comParcial
                    obrigatorio
                  />
                )}
              />
            ))}
          </div>
        ) : null}

        {/* ── 7. Observações Gerais ───────────────────────────────── */}
        {passo === 6 ? (
          <div {...painel(6)}>
            <Campo
              id="medidasTecnicasOrganizativas"
              label={textos.campos.medidasTecnicasOrganizativas}
              obrigatorio
              ajuda="medidasTecnicasOrganizativas"
            >
              <Controller
                control={control}
                name="medidasTecnicasOrganizativas"
                render={({ field }) => (
                  <CampoMedidas valor={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </Campo>
            <Campo id="normativosAplicaveis" label={textos.campos.normativosAplicaveis} obrigatorio>
              <Textarea id="normativosAplicaveis" {...register('normativosAplicaveis')} />
            </Campo>
            <Campo id="diagramaProcesso" label={textos.campos.diagramaProcesso}>
              <Input id="diagramaProcesso" {...register('diagramaProcesso')} />
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
            <Button type="submit">{textos.formulario.botaoGuardar}</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
