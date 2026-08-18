import { Button } from '@/components/ui/button'
import { textos } from '@/i18n/pt'

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{textos.app.titulo}</h1>
      <p className="max-w-md text-muted-foreground">{textos.app.descricao}</p>
      <Button disabled>{textos.app.brevemente}</Button>
    </main>
  )
}

export default App
