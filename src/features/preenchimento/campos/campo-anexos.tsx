import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { textos } from '@/i18n/pt'
import {
  formatarTamanho,
  tamanhoTotal,
  TAMANHO_MAXIMO_ANEXO,
  TAMANHO_MAXIMO_ANEXOS_REGISTO,
  TIPOS_ANEXO_ACEITES,
  type Anexo,
} from '@/domain/schema/anexo'

interface CampoAnexosProps {
  valor: Anexo[]
  onChange: (valor: Anexo[]) => void
}

/** Lê um ficheiro para base64, sem o prefixo `data:`. */
function lerComoBase64(ficheiro: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onerror = () => reject(leitor.error)
    leitor.onload = () => {
      const resultado = String(leitor.result)
      resolve(resultado.slice(resultado.indexOf(',') + 1))
    }
    leitor.readAsDataURL(ficheiro)
  })
}

/**
 * Anexos do registo. Como não há servidor (CLAUDE.md §2.2), o conteúdo
 * viaja embebido no ficheiro exportado — daí os limites de tamanho, que
 * são verificados aqui, no momento de anexar.
 */
export function CampoAnexos({ valor, onChange }: CampoAnexosProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function anexar(ficheiros: FileList | null) {
    if (!ficheiros || ficheiros.length === 0) return
    setErro(null)

    const novos: Anexo[] = []
    let total = tamanhoTotal(valor)

    for (const ficheiro of Array.from(ficheiros)) {
      if (ficheiro.size > TAMANHO_MAXIMO_ANEXO) {
        setErro(textos.anexos.erroFicheiroGrande(ficheiro.name))
        continue
      }
      if (total + ficheiro.size > TAMANHO_MAXIMO_ANEXOS_REGISTO) {
        setErro(textos.anexos.erroTotalGrande)
        break
      }
      novos.push({
        id: crypto.randomUUID(),
        nome: ficheiro.name,
        tipo: ficheiro.type || undefined,
        tamanho: ficheiro.size,
        conteudo: await lerComoBase64(ficheiro),
      })
      total += ficheiro.size
    }

    if (novos.length > 0) onChange([...valor, ...novos])
    if (inputRef.current) inputRef.current.value = ''
  }

  /**
   * Descarrega o anexo a partir do conteúdo em memória. Não há pedido de
   * rede: o `blob:` é construído localmente.
   */
  function descarregar(anexo: Anexo) {
    const bytes = Uint8Array.from(atob(anexo.conteudo), (c) => c.charCodeAt(0))
    const url = URL.createObjectURL(new Blob([bytes], { type: anexo.tipo || 'application/octet-stream' }))
    const link = document.createElement('a')
    link.href = url
    link.download = anexo.nome
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      {valor.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {valor.map((anexo) => (
            <li
              key={anexo.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="min-w-0 break-all">
                {anexo.nome}{' '}
                <span className="text-muted-foreground">({formatarTamanho(anexo.tamanho)})</span>
              </span>
              <span className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => descarregar(anexo)}>
                  {textos.anexos.descarregar}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange(valor.filter((a) => a.id !== anexo.id))}
                >
                  {textos.formulario.remover}
                </Button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept={TIPOS_ANEXO_ACEITES}
        onChange={(e) => void anexar(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => inputRef.current?.click()}
      >
        {textos.anexos.adicionar}
      </Button>

      <p className="text-xs text-muted-foreground">
        {textos.anexos.nota(formatarTamanho(TAMANHO_MAXIMO_ANEXO), formatarTamanho(TAMANHO_MAXIMO_ANEXOS_REGISTO))}
      </p>

      {erro ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {erro}
        </p>
      ) : null}
    </div>
  )
}
