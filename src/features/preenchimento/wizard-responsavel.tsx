import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Campo } from '@/components/form/campo'
import { PassosWizard, idPainelPasso } from '@/components/form/passos-wizard'
import { textos } from '@/i18n/pt'
import {
  baseLicitude,
  categoriasTitulares,
  condicaoArt9,
  mecanismoTransferencia,
} from '@/domain/schema/vocabularios'
import { registoResponsavelSchema, type RegistoResponsavel } from '@/domain/schema/responsavel'
import { SeletorMultiplo } from '@/features/preenchimento/campos/seletor-multiplo'
import { CampoMedidas } from '@/features/preenchimento/campos/campo-medidas'
import { CampoCategoriasDados } from '@/features/preenchimento/campos/campo-categorias-dados'
import { CampoSubcontratantes } from '@/features/preenchimento/campos/campo-subcontratantes'
import { avaliarRegisto } from '@/domain/rules/motor'

const PASSOS = [
  textos.passos.identificacao,
  textos.passos.finalidadeBase,
  textos.passos.titularesDados,
  textos.passos.destinatariosTransferencias,
  textos.passos.conservacaoSeguranca,
  textos.passos.subcontratantesObservacoes,
] as const

const CAMPOS_POR_PASSO: (keyof RegistoResponsavel)[][] = [
  ['direcao', 'unidadeCoordenacao', 'nomeTratamento', 'descricao', 'gestorProjeto'],
  ['finalidades', 'responsavelConjunto', 'representante', 'baseLicitude', 'recolhaDados'],
  ['categoriasTitulares', 'categoriasDados', 'categoriasEspeciais'],
  ['destinatarios', 'transferenciasInternacionais'],
  ['prazoConservacao', 'medidasTecnicasOrganizativas'],
  ['subcontratantesContratados', 'aipdRealizada', 'observacoes'],
]

function novoIdentificador(): string {
  return crypto.randomUUID()
}

interface WizardResponsavelProps {
  registoInicial?: RegistoResponsavel
  onGuardar: (registo: RegistoResponsavel) => void
  onCancelar: () => void
}

export function WizardResponsavel({ registoInicial, onGuardar, onCancelar }: WizardResponsavelProps) {
  const [passo, setPasso] = useState(0)

  const valoresIniciais = useMemo<RegistoResponsavel>(
    () =>
      registoInicial ?? {
        id: novoIdentificador(),
        tipoRegisto: 'responsavel',
        direcao: '',
        nomeTratamento: '',
        medidasTecnicasOrganizativas: [],
        transferenciasInternacionais: { existem: false },
        aipdRealizada: 'nao_aplicavel',
        gestorProjeto: { nome: '', contacto: '' },
        finalidades: '',
        baseLicitude: baseLicitude[0].id as RegistoResponsavel['baseLicitude'],
        recolhaDados: '',
        categoriasTitulares: [],
        categoriasDados: [],
        categoriasEspeciais: { aplicavel: false },
        prazoConservacao: '',
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
  const avisos = useMemo(() => avaliarRegisto(registoAtual), [registoAtual])
  const transferenciasExistem = watch('transferenciasInternacionais.existem')
  const mecanismoEscolhido = watch('transferenciasInternacionais.mecanismo')
  const categoriasEspeciaisAplicavel = watch('categoriasEspeciais.aplicavel')

  const passosComErro = new Set(
    CAMPOS_POR_PASSO.map((campos, indice) =>
      campos.some((campo) => Boolean((errors as Record<string, unknown>)[campo])) ? indice : -1,
    ).filter((i) => i >= 0),
  )

  function submeter(dados: RegistoResponsavel) {
    onGuardar(dados)
  }

  return (
    <form
      onSubmit={handleSubmit(submeter)}
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
        <p className="hidden border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground lg:block">
          {textos.formulario.notaRascunho}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
      <p className="text-xs text-muted-foreground">{textos.formulario.obrigatorio}</p>

      {passo === 0 ? (
        <div
          className="flex flex-col gap-4"
          role="tabpanel"
          id={idPainelPasso('wizard-responsavel', 0)}
          aria-labelledby="wizard-responsavel-tab-0"
        >
          <Campo id="direcao" label={textos.campos.direcao} obrigatorio erro={errors.direcao?.message}>
            <Input id="direcao" {...register('direcao')} />
          </Campo>
          <Campo id="unidadeCoordenacao" label={textos.campos.unidadeCoordenacao}>
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
          <Campo id="descricao" label={textos.campos.descricao}>
            <Textarea id="descricao" {...register('descricao')} />
          </Campo>
          <Campo
            id="gestorProjeto.nome"
            label={textos.campos['gestorProjeto.nome']}
            obrigatorio
            erro={errors.gestorProjeto?.nome?.message}
          >
            <Input id="gestorProjeto.nome" {...register('gestorProjeto.nome')} />
          </Campo>
          <Campo
            id="gestorProjeto.contacto"
            label={textos.campos['gestorProjeto.contacto']}
            obrigatorio
            erro={errors.gestorProjeto?.contacto?.message}
          >
            <Input id="gestorProjeto.contacto" {...register('gestorProjeto.contacto')} />
          </Campo>
        </div>
      ) : null}

      {passo === 1 ? (
        <div
          className="flex flex-col gap-4"
          role="tabpanel"
          id={idPainelPasso('wizard-responsavel', 1)}
          aria-labelledby="wizard-responsavel-tab-1"
        >
          <Campo
            id="finalidades"
            label={textos.campos.finalidades}
            obrigatorio
            erro={errors.finalidades?.message}
            ajuda="finalidades"
          >
            <Textarea id="finalidades" {...register('finalidades')} />
          </Campo>
          <Campo
            id="responsavelConjunto"
            label={textos.campos.responsavelConjunto}
            ajuda="responsavelConjunto"
          >
            <Input id="responsavelConjunto" {...register('responsavelConjunto')} />
          </Campo>
          <Campo id="representante" label={textos.campos.representante} ajuda="representante">
            <Input id="representante" {...register('representante')} />
          </Campo>
          <Campo
            id="baseLicitude"
            label={textos.campos.baseLicitude}
            obrigatorio
            erro={errors.baseLicitude?.message}
            ajuda="baseLicitude"
          >
            <Select id="baseLicitude" {...register('baseLicitude')}>
              <option value="" disabled>
                —
              </option>
              {baseLicitude.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.label}
                </option>
              ))}
            </Select>
          </Campo>
          <Campo
            id="recolhaDados"
            label={textos.campos.recolhaDados}
            obrigatorio
            erro={errors.recolhaDados?.message}
          >
            <Textarea id="recolhaDados" {...register('recolhaDados')} />
          </Campo>
        </div>
      ) : null}

      {passo === 2 ? (
        <div
          className="flex flex-col gap-4"
          role="tabpanel"
          id={idPainelPasso('wizard-responsavel', 2)}
          aria-labelledby="wizard-responsavel-tab-2"
        >
          <Campo
            id="categoriasTitulares"
            label={textos.campos.categoriasTitulares}
            obrigatorio
            erro={errors.categoriasTitulares?.message}
          >
            <Controller
              name="categoriasTitulares"
              control={control}
              render={({ field }) => (
                <SeletorMultiplo
                  name="categoriasTitulares"
                  opcoes={categoriasTitulares}
                  valor={field.value}
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
            erro={errors.categoriasDados?.message}
            ajuda="categoriasDados"
          >
            <Controller
              name="categoriasDados"
              control={control}
              render={({ field }) => <CampoCategoriasDados valor={field.value} onChange={field.onChange} />}
            />
          </Campo>

          <Campo
            id="categoriasEspeciais.aplicavel"
            label={textos.campos['categoriasEspeciais.aplicavel']}
            ajuda="categoriasEspeciais"
          >
            <label className="flex items-center gap-2 text-sm">
              <Checkbox {...register('categoriasEspeciais.aplicavel')} />
              {textos.formulario.simNao.sim}
            </label>
          </Campo>

          {categoriasEspeciaisAplicavel ? (
            <>
              <Campo
                id="categoriasEspeciais.condicoesArt9"
                label={textos.campos['categoriasEspeciais.condicoesArt9']}
                ajuda="categoriasEspeciais.condicoesArt9"
              >
                <Controller
                  name="categoriasEspeciais.condicoesArt9"
                  control={control}
                  render={({ field }) => (
                    <SeletorMultiplo
                      name="categoriasEspeciais.condicoesArt9"
                      opcoes={condicaoArt9}
                      valor={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Campo>
              <Campo
                id="categoriasEspeciais.identificar"
                label={textos.campos['categoriasEspeciais.identificar']}
              >
                <Textarea id="categoriasEspeciais.identificar" {...register('categoriasEspeciais.identificar')} />
              </Campo>
            </>
          ) : null}
        </div>
      ) : null}

      {passo === 3 ? (
        <div
          className="flex flex-col gap-4"
          role="tabpanel"
          id={idPainelPasso('wizard-responsavel', 3)}
          aria-labelledby="wizard-responsavel-tab-3"
        >
          <Campo id="destinatarios" label={textos.campos.destinatarios} ajuda="destinatarios">
            <Textarea id="destinatarios" {...register('destinatarios')} />
          </Campo>
          <Campo
            id="transferenciasInternacionais.existem"
            label={textos.campos['transferenciasInternacionais.existem']}
            ajuda="transferenciasInternacionais"
          >
            <label className="flex items-center gap-2 text-sm">
              <Checkbox {...register('transferenciasInternacionais.existem')} />
              {textos.formulario.simNao.sim}
            </label>
          </Campo>
          {transferenciasExistem ? (
            <>
              <Campo
                id="transferenciasInternacionais.paisesOuOrganizacoes"
                label={textos.campos['transferenciasInternacionais.paisesOuOrganizacoes']}
                erro={errors.transferenciasInternacionais?.paisesOuOrganizacoes?.message}
              >
                <Controller
                  name="transferenciasInternacionais.paisesOuOrganizacoes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="transferenciasInternacionais.paisesOuOrganizacoes"
                      value={(field.value ?? []).join('\n')}
                      onChange={(e) =>
                        field.onChange(e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))
                      }
                    />
                  )}
                />
              </Campo>
              <Campo
                id="transferenciasInternacionais.mecanismo"
                label={textos.campos['transferenciasInternacionais.mecanismo']}
                erro={errors.transferenciasInternacionais?.mecanismo?.message}
              >
                <Select id="transferenciasInternacionais.mecanismo" {...register('transferenciasInternacionais.mecanismo')}>
                  <option value="">—</option>
                  {mecanismoTransferencia.map((opcao) => (
                    <option key={opcao.id} value={opcao.id}>
                      {opcao.label}
                    </option>
                  ))}
                </Select>
              </Campo>
              {mecanismoEscolhido === 'outro' ? (
                <Campo
                  id="transferenciasInternacionais.mecanismoOutro"
                  label={textos.campos['transferenciasInternacionais.mecanismoOutro']}
                >
                  <Input
                    id="transferenciasInternacionais.mecanismoOutro"
                    {...register('transferenciasInternacionais.mecanismoOutro')}
                  />
                </Campo>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {passo === 4 ? (
        <div
          className="flex flex-col gap-4"
          role="tabpanel"
          id={idPainelPasso('wizard-responsavel', 4)}
          aria-labelledby="wizard-responsavel-tab-4"
        >
          <Campo
            id="prazoConservacao"
            label={textos.campos.prazoConservacao}
            obrigatorio
            erro={errors.prazoConservacao?.message}
            ajuda="prazoConservacao"
          >
            <Textarea id="prazoConservacao" {...register('prazoConservacao')} />
          </Campo>
          <Campo
            id="medidasTecnicasOrganizativas"
            label={textos.campos.medidasTecnicasOrganizativas}
            obrigatorio
            erro={errors.medidasTecnicasOrganizativas?.message}
            ajuda="medidasTecnicasOrganizativas"
          >
            <Controller
              name="medidasTecnicasOrganizativas"
              control={control}
              render={({ field }) => <CampoMedidas valor={field.value} onChange={field.onChange} />}
            />
          </Campo>
        </div>
      ) : null}

      {passo === 5 ? (
        <div
          className="flex flex-col gap-4"
          role="tabpanel"
          id={idPainelPasso('wizard-responsavel', 5)}
          aria-labelledby="wizard-responsavel-tab-5"
        >
          <Campo
            id="subcontratantesContratados"
            label={textos.campos.subcontratantesContratados}
            ajuda="subcontratantesContratados"
          >
            <Controller
              name="subcontratantesContratados"
              control={control}
              render={({ field }) => (
                <CampoSubcontratantes valor={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </Campo>
          <Campo id="aipdRealizada" label={textos.campos.aipdRealizada}>
            <Select id="aipdRealizada" {...register('aipdRealizada')}>
              <option value="sim">{textos.aipd.sim}</option>
              <option value="nao">{textos.aipd.nao}</option>
              <option value="nao_aplicavel">{textos.aipd.nao_aplicavel}</option>
            </Select>
          </Campo>
          <Campo id="observacoes" label={textos.campos.observacoes}>
            <Textarea id="observacoes" {...register('observacoes')} />
          </Campo>
        </div>
      ) : null}

      {avisos.length > 0 ? (
        <div className="rounded-lg border border-warning-border bg-warning-soft p-4">
          <p className="text-sm font-semibold text-warning">{textos.formulario.avisosTitulo}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{textos.formulario.avisosDescricao}</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {avisos.map((ocorrencia) => (
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
            <Button type="button" onClick={() => setPasso((p) => Math.min(PASSOS.length - 1, p + 1))}>
              {textos.formulario.botaoSeguinte}
            </Button>
          ) : (
            <Button type="submit">{textos.formulario.botaoGuardar}</Button>
          )}
        </div>
      </div>
      </div>
    </form>
  )
}
