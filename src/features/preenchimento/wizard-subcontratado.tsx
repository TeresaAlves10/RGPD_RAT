import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Campo } from '@/components/form/campo'
import { textos } from '@/i18n/pt'
import { mecanismoTransferencia } from '@/domain/schema/vocabularios'
import { registoSubcontratadoSchema, type RegistoSubcontratado } from '@/domain/schema/subcontratado'
import { CampoMedidas } from '@/features/preenchimento/campos/campo-medidas'
import { CampoResponsaveis } from '@/features/preenchimento/campos/campo-responsaveis'
import { avaliarRegisto } from '@/domain/rules/motor'

const PASSOS = [
  textos.passos.identificacao,
  textos.passos.responsaveisPorConta,
  textos.passos.transferencias,
  textos.passos.segurancaObservacoes,
] as const

const CAMPOS_POR_PASSO: (keyof RegistoSubcontratado)[][] = [
  ['direcao', 'unidadeCoordenacao', 'nomeTratamento', 'descricao', 'gestorProjeto'],
  ['responsaveis'],
  ['transferenciasInternacionais'],
  ['medidasTecnicasOrganizativas', 'aipdRealizada', 'observacoes'],
]

function novoIdentificador(): string {
  return crypto.randomUUID()
}

interface WizardSubcontratadoProps {
  registoInicial?: RegistoSubcontratado
  onGuardar: (registo: RegistoSubcontratado) => void
  onCancelar: () => void
}

export function WizardSubcontratado({ registoInicial, onGuardar, onCancelar }: WizardSubcontratadoProps) {
  const [passo, setPasso] = useState(0)

  const valoresIniciais = useMemo<RegistoSubcontratado>(
    () =>
      registoInicial ?? {
        id: novoIdentificador(),
        tipoRegisto: 'subcontratado',
        direcao: '',
        nomeTratamento: '',
        medidasTecnicasOrganizativas: [],
        transferenciasInternacionais: { existem: false },
        aipdRealizada: 'nao_aplicavel',
        gestorProjeto: { nome: '', contacto: '' },
        responsaveis: [],
      },
    [registoInicial],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistoSubcontratado>({
    resolver: zodResolver(registoSubcontratadoSchema),
    defaultValues: valoresIniciais,
  })

  const registoAtual = watch()
  const avisos = useMemo(() => avaliarRegisto(registoAtual), [registoAtual])
  const transferenciasExistem = watch('transferenciasInternacionais.existem')
  const mecanismoEscolhido = watch('transferenciasInternacionais.mecanismo')

  const passosComErro = new Set(
    CAMPOS_POR_PASSO.map((campos, indice) =>
      campos.some((campo) => Boolean((errors as Record<string, unknown>)[campo])) ? indice : -1,
    ).filter((i) => i >= 0),
  )

  function submeter(dados: RegistoSubcontratado) {
    onGuardar(dados)
  }

  return (
    <form onSubmit={handleSubmit(submeter)} className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Passos do formulário">
        {PASSOS.map((titulo, indice) => (
          <button
            key={titulo}
            type="button"
            role="tab"
            aria-selected={passo === indice}
            onClick={() => setPasso(indice)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              passo === indice
                ? 'border-primary bg-primary text-primary-foreground'
                : passosComErro.has(indice)
                  ? 'border-destructive text-destructive'
                  : 'border-border text-muted-foreground'
            }`}
          >
            {indice + 1}. {titulo}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{textos.formulario.obrigatorio}</p>

      {passo === 0 ? (
        <div className="flex flex-col gap-4">
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
        <Campo
          id="responsaveis"
          label={textos.campos.responsaveis}
          obrigatorio
          erro={errors.responsaveis?.message}
          ajuda="responsaveis"
        >
          <Controller
            name="responsaveis"
            control={control}
            render={({ field }) => <CampoResponsaveis valor={field.value} onChange={field.onChange} />}
          />
        </Campo>
      ) : null}

      {passo === 2 ? (
        <div className="flex flex-col gap-4">
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

      {passo === 3 ? (
        <div className="flex flex-col gap-4">
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
        <div className="rounded-md border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium">{textos.formulario.avisosTitulo}</p>
          <p className="text-xs text-muted-foreground">{textos.formulario.avisosDescricao}</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {avisos.map((ocorrencia) => (
              <li key={ocorrencia.regraId} className={ocorrencia.severidade === 'erro' ? 'text-destructive' : ''}>
                {ocorrencia.mensagem}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>
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
    </form>
  )
}
