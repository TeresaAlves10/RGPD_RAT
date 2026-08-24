# RAT — Registo de Atividades de Tratamento (RGPD)

Aplicação web **estática, sem backend**, para preencher Registos de
Atividades de Tratamento (RAT) nos termos do art. 30.º do RGPD, como
alternativa aos ficheiros Excel atualmente usados. Publicada em GitHub
Pages. Ver `CLAUDE.md` para o contexto completo do projeto e as decisões
vinculativas de arquitetura e domínio.

> **Estado atual:** Fases 0–7 do faseamento do `CLAUDE.md` implementadas:
> fundações, modelo de dados, motor de regras, formulário, exportação
> (JSON/Excel/PDF), importação (nativa e do template legado), modo
> validador do DPO, e polimento (acessibilidade, impressão, guia).

## Garantias de privacidade (verificáveis, não apenas declaradas)

### 1. Zero rede em runtime

A aplicação nunca comunica com um servidor. Não há `fetch`,
`XMLHttpRequest`, `WebSocket`, `sendBeacon`/*beacon*, nem qualquer SDK que
envie dados para fora do browser. Isto é garantido por duas camadas
independentes:

- **CSP restritiva** injetada no `<head>` do build de produção (ver
  `vite.config.ts`, plugin `csp-restritiva`), com `connect-src 'none'` e
  `script-src 'self'` — o próprio browser bloqueia qualquer tentativa de
  chamada de rede ou de script de terceiros, mesmo que um bug ou uma
  dependência futura a introduza.
- **Teste automatizado** (`src/test/zero-rede.test.ts`), executado no CI
  a cada *push* e *pull request*, que analisa o bundle de produção em
  `dist/` e falha se encontrar qualquer referência a `fetch(`,
  `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, ou a
  domínios de CDN conhecidos (unpkg, jsDelivr, cdnjs, Google
  Fonts/APIs, etc.). Corre-lo localmente com:

  ```bash
  npm run test:zero-rede
  ```

  (O bundle de terceiros do `pdfmake` — usado só para gerar PDF — tem uma
  capacidade opcional e não usada de carregar imagens remotas; é
  explicitamente desativada em runtime com `setUrlAccessPolicy(() =>
  false)` em `src/io/pdf/exportar.ts`, e por isso excluída do *scan* de
  padrões de rede, mas não do *scan* de domínios de CDN. Ver comentário
  em `src/test/zero-rede.test.ts`.)

### 2. Zero persistência de servidor

Não há *backend*, não há base de dados. A única persistência é
`localStorage`, local ao browser de cada pessoa, e apenas para o
rascunho do formulário em curso — nunca para submissão, aprovação, ou
qualquer estado partilhado entre pessoas. A partilha de dados entre a
equipa e o DPO é feita exclusivamente por ficheiros exportados/importados
(JSON, Excel, PDF) trocados fora da aplicação (ex.: email).

## Guia de utilização

Também disponível dentro da aplicação, em **Ajuda**.

1. **Preencher um registo** — em "Registos", "+ Novo registo", escolhe
   Responsável pelo Tratamento (art. 30.º/1) ou Subcontratado (art.
   30.º/2). O formulário é um *wizard* por passos, navegável por clique ou
   pelas setas do teclado; campos com `*` são obrigatórios; o ícone "?"
   junto de alguns campos mostra a fundamentação legal.
2. **Rascunho local** — o ficheiro em edição é guardado automaticamente no
   browser ~1s depois de cada alteração. Nunca é carregado silenciosamente
   ao reabrir a app — é sempre pedida confirmação explícita. "Limpar
   rascunho local" apaga-o.
3. **Exportar** — JSON (canónico, para reimportar), Excel (folha legível +
   `_dados` oculta para *round-trip* sem perdas) ou PDF (só para
   apresentação/arquivo, não reimportável). O download nunca é bloqueado
   por erros de validação por resolver.
4. **Importar** — um JSON/Excel exportado por esta app substitui o
   ficheiro em edição; o template Excel legado tem um importador dedicado
   que mostra um relatório dos campos mapeados e dos que ficam "por
   preencher" (vocabulários controlados que o template antigo não tinha).
5. **Modo validador (DPO)** — em "Modo validador", importa vários
   ficheiros de uma vez, vê o resumo por ficheiro (registos/erros/avisos),
   abre o detalhe para rever as ocorrências do motor de regras e anotar o
   que precisa de correção, e exporta de volta com as anotações incluídas.

## Acessibilidade e impressão

- Navegação por teclado nos passos do formulário segue o padrão ARIA de
  *tabs* (setas, Home/End, `roving tabindex`).
- Diálogos modais (rascunho, relatório de importação) usam Radix Dialog:
  focam automaticamente ao abrir, prendem o foco dentro (*focus trap*), e
  fecham com Escape quando a ação não é uma decisão obrigatória.
- `@media print` esconde as ações interativas (botões, barras de
  importação/exportação) e força texto legível em fundo claro
  independentemente do tema.

## Stack técnica

Vite + React + TypeScript · Tailwind CSS + shadcn/ui (Radix) ·
react-hook-form + Zod · react-router (`HashRouter`) · `exceljs` (Excel,
*import* dinâmico) · `pdfmake` com fonte Roboto embebida (PDF, *import*
dinâmico) · Vitest + Testing Library · GitHub Actions → GitHub Pages.

## Comandos

```bash
npm run dev             # servidor de desenvolvimento
npm run test            # testes unitários
npm run test:zero-rede  # build de produção + prova de "zero rede"
npm run build           # build de produção (tsc + vite build)
npm run lint            # linting (oxlint)
```

## CI/CD

O workflow `.github/workflows/ci.yml` corre em cada *push*/*pull
request*: lint, testes unitários, build de produção e a prova de "zero
rede" sobre o bundle gerado. Em *push* para `main`, com todas as
verificações a passar, publica automaticamente `dist/` no GitHub Pages.

Para ativar o deploy, em **Settings → Pages** do repositório, define a
origem ("Source") como **GitHub Actions**.

## Licença

MIT. Sem logótipos institucionais ou dados reais no repositório — os
*fixtures* e capturas de ecrã usam sempre dados fictícios.
