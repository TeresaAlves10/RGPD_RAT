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
import { registoSubcontratadoSchema, type RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { SeletorMultiplo } from '@/features/preenchimento/campos/seletor-multiplo'
import { CampoMedidas } from '@/features/preenchimento/campos/campo-medidas'
import { CampoCategoriasDados } from '@/features/preenchimento/campos/campo-categorias-dados'
import { CampoSimNao } from '@/features/preenchimento/campos/campo-sim-nao'
import { CampoOutrosSubcontratantes } from '@/features/preenchimento/campos/campo-outros-subcontratantes'
import { avaliarRegisto } from '@/domain/rules/motor'
import { AcoesEstado } from '@/features/preenchimento/acoes-estado'

/**
 * Formulário do subcontratante (art. 30.º/2), com a lista de campos
 * indicada pelo utilizador para esta qualidade.
 */
const PASSOS = [
  textos.passos.identificacaoSubcontratado,
  textos.passos.tratamentoSubcontratado,
  textos.passos.dadosSubcontratado,
  textos.passos.destinatariosSubcontratado,
  textos.passos.segurancaSubcontratado,
  textos.passos.observacoesSubcontratado,
] as const

const CAMPOS_POR_PASSO: (keyof RegistoSubcontratado)[][] = [
  ['nomeResponsavelTratamento', 'direcao', 'unidadeCoordenacao', 'nomeTratamento', 'descricao'],
  ['finalidade', 'responsavelConjunto', 'baseLegal', 'recolhaDados'],
  ['categoriasTitulares', 'categoriasDados', 'categoriasEspeciais'],
  ['destinatarios', 'transferencias'],
  ['prazoConservacao', 'medidasTecnicasOrganizativas', 'outrosSubcontratantes'],
  ['observacoes', 'diagramaEcosistema', 'aipdRealizada', 'gestorProjeto'],
]

interface WizardSubcontratadoProps {
  registoInicial?: RegistoSubcontratado
  onGuardar: (registo: RegistoSubcontratado) => void
  onCancelar: () => void
}

export function WizardSubcontratado({
  registoInicial,
  onGuardar,
  onCancelar,
}: WizardSubcontratadoProps) {
  const [passo, setPasso] = useState(0)

  const valoresIniciais = useMemo<RegistoSubcontratado>(
    () =>
      registoInicial ?? {
        id: crypto.randomUUID(),
        tipoRegisto: 'subcontratado',
        estado: 'rascunho',
        direcao: '',
        nomeTratamento: '',
        gestorProjeto: { nome: '' },
        categoriasTitulares: [],
        categoriasDados: [],
        medidasTecnicasOrganizativas: [],
        outrosSubcontratantes: [],
        categoriasEspeciais: {},
        transferencias: {},
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
  } = useForm<RegistoSubcontratado>({
    resolver: zodResolver(registoSubcontratadoSchema),
    defaultValues: valoresIniciais,
  })

  const registoAtual = watch()
  const ocorrencias = useMemo(() => avaliarRegisto(registoAtual), [registoAtual])
  const erros = useMemo(() => ocorrencias.filter((o) => o.severidade === 'erro'), [ocorrencias])
  const temCategoriasEspeciais = watch('categoriasEspeciais.aplicavel') === 'sim'
  const temTransferencias = watch('transferencias.existem') === 'sim'

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
      onSubmit={handleSubmit(onGuardar)}
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
          onMudar={(novo) => setValue('estado', novo, { shouldDirty: true })}
        />
        <p className="hidden border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground lg:block">
          {textos.formulario.notaRascunho}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <p className="text-xs text-muted-foreground">{textos.formulario.obrigatorio}</p>

        {passo === 0 ? (
          <div {...painel(0)}>
            <Campo
              id="nomeResponsavelTratamento"
              label={textos.campos.nomeResponsavelTratamento}
              obrigatorio
              ajuda="responsaveis"
            >
              <Input id="nomeResponsavelTratamento" {...register('nomeResponsavelTratamento')} />
            </Campo>
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
          </div>
        ) : null}

        {passo === 1 ? (
          <div {...painel(1)}>
            <Campo
              id="finalidade"
              label={textos.campos.finalidadeSubcontratado}
              obrigatorio
              ajuda="finalidades"
            >
              <Textarea id="finalidade" {...register('finalidade')} />
            </Campo>
            <Campo
              id="responsavelConjunto"
              label={textos.campos.responsavelConjunto}
              obrigatorio
              ajuda="responsavelConjunto"
            >
              <Input id="responsavelConjunto" {...register('responsavelConjunto')} />
            </Campo>
            <Campo id="baseLegal" label={textos.campos.baseLegal} obrigatorio ajuda="baseLicitude">
              <Select id="baseLegal" {...register('baseLegal')}>
                <option value="">{textos.respostas.porResponder}</option>
                {baseLicitude.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.label}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo id="recolhaDados" label={textos.campos.recolhaDados} obrigatorio>
              <Textarea id="recolhaDados" {...register('recolhaDados')} />
            </Campo>
          </div>
        ) : null}

        {passo === 2 ? (
          <div {...painel(2)}>
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
            ) : null}
          </div>
        ) : null}

        {passo === 3 ? (
          <div {...painel(3)}>
            <Campo
              id="destinatarios"
              label={textos.campos.destinatarios}
              obrigatorio
              ajuda="destinatarios"
            >
              <Textarea id="destinatarios" {...register('destinatarios')} />
            </Campo>
            <Controller
              control={control}
              name="transferencias.existem"
              render={({ field }) => (
                <CampoSimNao
                  id="transferencias.existem"
                  label={textos.campos['transferencias.existem']}
                  valor={field.value}
                  onChange={field.onChange}
                  obrigatorio
                />
              )}
            />
            {temTransferencias ? (
              <Campo
                id="transferencias.identificar"
                label={textos.campos['transferencias.identificar']}
                obrigatorio
                ajuda="transferencias"
              >
                <Textarea id="transferencias.identificar" {...register('transferencias.identificar')} />
              </Campo>
            ) : null}
          </div>
        ) : null}

        {passo === 4 ? (
          <div {...painel(4)}>
            <Campo
              id="prazoConservacao"
              label={textos.campos.prazoConservacao}
              obrigatorio
              ajuda="prazoConservacao"
            >
              <Textarea id="prazoConservacao" {...register('prazoConservacao')} />
            </Campo>
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
            <Campo
              id="outrosSubcontratantes"
              label={textos.campos.outrosSubcontratantes}
              ajuda="subcontratantes"
            >
              <Controller
                control={control}
                name="outrosSubcontratantes"
                render={({ field }) => (
                  <CampoOutrosSubcontratantes valor={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </Campo>
          </div>
        ) : null}

        {passo === 5 ? (
          <div {...painel(5)}>
            <Campo id="observacoes" label={textos.campos.observacoes}>
              <Textarea id="observacoes" {...register('observacoes')} />
            </Campo>
            <Campo id="diagramaEcosistema" label={textos.campos.diagramaEcosistema}>
              <Input id="diagramaEcosistema" {...register('diagramaEcosistema')} />
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
            <Button type="submit">{textos.formulario.botaoGuardar}</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
