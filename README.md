# RAT — Registo de Atividades de Tratamento (RGPD)

Aplicação web **estática, sem backend**, para preencher Registos de
Atividades de Tratamento (RAT) nos termos do art. 30.º do RGPD, como
alternativa aos ficheiros Excel atualmente usados. Publicada em GitHub
Pages. Ver `CLAUDE.md` para o contexto completo do projeto e as decisões
vinculativas de arquitetura e domínio.

> **Estado atual:** Fase 0 (Fundações). Ainda não existe código de
> domínio (schemas, regras de validação, formulário) — apenas o
> esqueleto do projeto.

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

### 2. Zero persistência de servidor

Não há *backend*, não há base de dados. A única persistência é
`localStorage`, local ao browser de cada pessoa, e apenas para o
rascunho do formulário em curso — nunca para submissão, aprovação, ou
qualquer estado partilhado entre pessoas. A partilha de dados entre a
equipa e o DPO é feita exclusivamente por ficheiros exportados/importados
(JSON, Excel, PDF) trocados fora da aplicação (ex.: email).

## Stack técnica

Vite + React + TypeScript · Tailwind CSS + shadcn/ui · Vitest + Testing
Library · GitHub Actions → GitHub Pages.

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
