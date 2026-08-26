# CLAUDE.md — App de preenchimento de RAT (RGPD)

Este ficheiro é o contexto permanente do projeto. Lê-o antes de qualquer alteração.
O plano detalhado e a análise crítica do Excel original estão em `PLANO-RAT.md` —
consulta-o para fundamentação, mas as decisões vinculativas estão aqui.

---

## 1. O que é este projeto

Aplicação web **estática, sem backend**, para as equipas de uma organização
preencherem Registos de Atividades de Tratamento (RAT) no âmbito do art. 30.º
do RGPD, como alternativa aos ficheiros Excel atuais. É publicada em GitHub
Pages. O DPO/autor recebe os ficheiros exportados por email, importa-os para
os validar, corrige o que for necessário e reenvia.

```
Equipa (browser)                         DPO (browser)
────────────────                         ─────────────
preenche o formulário
validação em tempo real
exporta .json (+ .xlsx / .pdf) ────────► importa o .json
                                          modo validação: anota, corrige
                                ◄──────── exporta e devolve
importa, corrige, reenvia
```

## 2. Regras invioláveis (não negociáveis em nenhuma fase)

1. **Zero rede em runtime.** Nenhum `fetch`, `XMLHttpRequest`, `WebSocket`,
   *beacon* ou SDK que comunique com um servidor. Nenhuma dependência de CDN —
   tudo (fontes, ícones, bibliotecas) auto-hospedado no bundle.
2. **Zero persistência de servidor.** Não há backend, não há base de dados.
   A única persistência permitida é `localStorage`, local ao browser da
   pessoa, e apenas para o rascunho em curso (ver §6).
3. **O schema Zod em `src/domain/schema/` é a única fonte de verdade.** Um
   campo novo entra ali primeiro. Formulário, exports, validações e PDF
   derivam do schema — nunca duplicar a lista de campos noutro sítio.
4. **Toda a regra de validação é declarativa**, definida em
   `src/domain/rules/catalog.ts`, com um teste unitário com caso positivo e
   caso negativo. Nunca embutir lógica de validação diretamente nos
   componentes de UI.
5. **Nenhuma alteração ao formato do ficheiro JSON sem incrementar
   `schemaVersion` e escrever o migrador correspondente** em
   `src/domain/migrations/`.
6. **Português de Portugal** em toda a interface. Todas as *strings* visíveis
   ao utilizador vivem em `src/i18n/pt.ts` — nunca texto hardcoded em
   componentes.
7. **Licença MIT.** Sem logótipos institucionais nem dados de exemplo reais
   no repositório (usar sempre dados fictícios nos *fixtures* e capturas).
8. Não implementar autenticação, dashboard agregado persistente, nem
   qualquer noção de "utilizador" — isso está fora de âmbito.

## 3. Modelo de negócio do domínio (decisões já tomadas)

- **O RAT está separado da avaliação de controlos/maturidade.** São dois
  módulos distintos:
  - **Módulo RAT** (obrigatório) — o registo nos termos do art. 30.º.
  - **Módulo de avaliação** (opcional, ativável por *toggle*) — gestão de
    acessos, revisões periódicas, auditorias a subcontratados, capacidade de
    detetar violações, etc. Nunca aparece misturado no mesmo ecrã do RAT.

    *Implementado* em `src/domain/schema/avaliacao.ts` (campo opcional
    `avaliacao` no registo) e no ecrã próprio `/registos/:id/avaliacao`.
    Cobre as secções que o template Excel antigo misturava nas colunas do
    RAT: direitos dos titulares, gestão de acessos, ferramentas e
    suportes, contratos/auditorias a subcontratantes, e consentimento.
    A ausência do módulo nunca torna um RAT inválido.

- **Estado do registo, sem contas nem servidor.** Cada registo tem um
  `estado`: `rascunho` → `pronto` → `validado`. É apenas um marcador que
  viaja dentro do ficheiro exportado; não há submissão, aprovação nem
  autenticação (ver regra 8 e §2.2). "Submeter" continua a ser exportar o
  ficheiro e enviá-lo ao DPO, que o devolve com o estado `validado`.

- **Dentro do módulo RAT, há dois tipos de registo**, correspondentes às duas
  qualidades em que a organização pode atuar (isto substitui a ideia de um
  único formulário universal — são dois formulários com secções distintas,
  porque o art. 30.º/1 e o art. 30.º/2 pedem conteúdo diferente):
  - **RAT — Responsável de Tratamento** (art. 30.º/1): finalidades, base de
    licitude, categorias de titulares e dados, destinatários,
    transferências, prazo de conservação, medidas técnicas e organizativas,
    subcontratantes que a organização contrata.
  - **RAT — Subcontratado** (art. 30.º/2): identificação de cada responsável
    por conta de quem a organização atua, categorias de tratamento
    efetuadas para cada um, transferências, medidas técnicas e
    organizativas. **Não** repetir campos do outro tipo que não se aplicam
    (ex.: base de licitude é do responsável, não do subcontratado).
  - Um mesmo ficheiro pode conter registos dos dois tipos, misturados.

- **Um ficheiro = vários tratamentos da mesma equipa.** A estrutura do JSON
  é sempre `{ metadados-da-equipa, registos: [...] }`, nunca um único
  tratamento por ficheiro. Ver estrutura de referência em `PLANO-RAT.md §6`
  — adaptar essa estrutura para refletir os dois tipos de registo acima
  (campo `tipoRegisto: "responsavel" | "subcontratado"` em vez de
  `qualidade`, com os dois schemas Zod distintos e um *discriminated union*).

- **Glossário de termos do template original:**
  - `GP` = Gestor de Projeto → campo `gestorProjeto: { nome, contacto }`.
  - `AIPD para SI/BD` = Avaliação de Impacto sobre a Proteção de Dados,
    referente ao Sistema de Informação / Base de Dados em causa.

- **Não incluir nenhum aviso do tipo "não introduza dados pessoais de
  titulares neste formulário"** — nem como banner, nem como regra de
  validação heurística que procure dados pessoais reais nos campos de
  texto. Esta funcionalidade foi explicitamente excluída do âmbito.

## 4. Ajuda contextual

O template Excel original tinha orientação legal valiosa presa em
comentários de célula (fundamentação dos artigos 6.º, 9.º, 26.º, 27.º, 28.º,
44.º e 4.º/9 do RGPD, regras de conservação, exemplos de categorias e tipos
de dados). Estes textos já foram extraídos e devem ser reaproveitados como
conteúdo de ajuda contextual junto de cada campo (ex.: um ícone "?" com
popover), organizados em `src/domain/help/*.ts`, indexados pelo `id` do
campo do schema. Pede o texto completo desses comentários se precisares —
não os reescrevas de memória, cita a base legal com precisão.

## 5. Vocabulários controlados

Substituir todo o texto livre por listas fechadas onde o conteúdo é
enumerável, com opção "Outro (especificar)" quando fizer sentido:
- Base de licitude (art. 6.º/1, a–f)
- Condição do art. 9.º/2 para categorias especiais
- Categorias de titulares dos dados
- Categorias e tipos de dados pessoais (taxonomia de dois níveis:
  categoria → tipos, conforme os exemplos dos comentários do Excel)
- Mecanismo de garantia de transferência internacional (decisão de
  adequação, CCT, BCR, derrogação do art. 49.º)
- Medidas técnicas e organizativas (lista de exemplos, não exaustiva)

Ficam em `src/domain/vocabularios/*.json`, versionados no repositório.

## 6. Rascunho local (localStorage)

Implementar, **opcional e claramente sinalizado**:
- Guardar o estado do formulário em `localStorage` com *debounce* (~1s após
  a última alteração), sob uma chave própria da app.
- Ao abrir a app, se existir rascunho guardado, perguntar explicitamente
  "Encontrámos um rascunho de [data/hora]. Continuar ou começar de novo?" —
  nunca carregar silenciosamente.
- Botão visível "Limpar rascunho local".
- Isto é o único mecanismo de persistência em toda a aplicação — não deve
  ser confundido com submissão, aprovação, nem qualquer estado partilhado.

## 7. Import / Export

| Formato | Papel |
|---|---|
| **JSON** | Formato canónico de troca. Inclui `schemaVersion`. |
| **Excel** | Folha legível (um registo por linha) + folha `Listas` com os vocabulários + folha oculta `_dados` com o JSON completo, para *round-trip* sem perdas. |
| **PDF** | Apresentação/arquivo. Uma secção por registo, fundamentação legal em rodapé, sumário de validação. Não é reimportável. Usar biblioteca com fonte embebida — sem isto os acentos de PT-PT saem corrompidos. |
| **Excel legado** | Importador dedicado do template antigo (`Livro6.xlsx`, em anexo/fixtures), com relatório de mapeamento: campos mapeados, ignorados, por preencher. |

O download nunca é bloqueado por erros de validação — o estado de
validação viaja embutido no ficheiro e é visível no PDF exportado.

## 8. Stack técnica

Vite + React + TypeScript · Tailwind + shadcn/ui · react-hook-form + Zod ·
Vitest + Testing Library · `exceljs` para Excel (import dinâmico) ·
`pdfmake` com fonte embebida para PDF (import dinâmico) · GitHub Actions →
GitHub Pages · `HashRouter` (ou `404.html` de fallback) para as rotas
funcionarem no Pages.

## 9. Prova de "zero rede"

Escrever um teste automatizado (a correr no CI) que falha se o bundle de
produção contiver qualquer referência a `fetch(`, `XMLHttpRequest`,
`WebSocket`, ou a domínios de CDN conhecidos. Documentar este teste no
README como garantia verificável, não apenas declarada.

## 10. Estrutura de pastas

```
src/
  domain/
    schema/          # Zod: dois discriminated unions (responsavel | subcontratado)
    vocabularios/     # listas controladas (JSON)
    rules/            # motor de regras + catálogo declarativo
    migrations/       # v1 -> v2 ...
    help/             # ajuda contextual por campo
  io/
    json/             # export/import canónico
    excel/            # exceljs: export legível + _dados; importadores (nativo, legado)
    pdf/               # pdfmake
  features/
    preenchimento/    # wizard multi-secção, multi-registo, escolha de tipo de registo
    validacao/        # modo DPO: relatório, anotações, resumo multi-ficheiro da sessão
  components/         # UI genérica
  i18n/pt.ts
  app/
```

## 11. Faseamento — segue esta ordem, uma fase por sessão

0. **Fundações** — Vite+TS+React, Tailwind/shadcn, Vitest, CI, deploy Pages,
   CSP restritiva, este `CLAUDE.md`, README com a garantia de "zero rede".
1. **Modelo** — schemas Zod (os dois tipos de registo), vocabulários,
   *fixtures* (um registo mínimo e um completo de cada tipo, um inválido),
   migrações.
2. **Regras** — motor + catálogo de validação, sem UI. Cada regra com teste
   positivo e negativo. Consultar `PLANO-RAT.md §7` como ponto de partida,
   ajustando à separação por tipo de registo.
3. **Formulário** — *wizard* multi-secção, multi-registo, com escolha de
   tipo de registo (responsável / subcontratado) e ajuda contextual.
4. **Exports** — JSON, Excel (com `_dados`), PDF com acentuação correta.
   *Round-trip* JSON → Excel → JSON testado e idêntico.
5. **Import e edição** — JSON, Excel nativo, Excel legado (`Livro6.xlsx`),
   migração de versões, edição sem perdas.
6. **Modo validador** — relatório de validação, anotações por campo,
   resumo de sessão ao importar múltiplos ficheiros.
7. **Polimento** — acessibilidade (teclado, ARIA, contraste), impressão,
   guia de utilização, licença MIT.

Não avances de fase sem os testes da fase anterior a passar.

## 12. Comandos

```
npm run dev
npm run test
npm run build
npm run lint
```

## 13. Primeiro prompt a dar ao Claude Code

> Lê o CLAUDE.md e o PLANO-RAT.md na raiz do repositório. Implementa apenas
> a Fase 0 (Fundações): estrutura do projeto Vite+React+TypeScript,
> Tailwind e shadcn/ui, configuração de testes com Vitest, workflow de CI
> e deploy para GitHub Pages, CSP restritiva no `index.html`, e um README
> que documente as garantias de "zero rede" e "zero persistência de
> servidor". Não escrevas ainda nenhum código de domínio (schemas, regras,
> formulário) — isso é a Fase 1. No fim, corre `npm run test` e `npm run
> build` e confirma que ambos passam.
