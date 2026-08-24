import { textos } from '@/i18n/pt'

export function PaginaAjuda() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">{textos.ajuda.titulo}</h1>
      {textos.ajuda.seccoes.map((seccao) => (
        <section key={seccao.titulo} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{seccao.titulo}</h2>
          {seccao.paragrafos.map((paragrafo) => (
            <p key={paragrafo} className="text-sm text-muted-foreground">
              {paragrafo}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}
