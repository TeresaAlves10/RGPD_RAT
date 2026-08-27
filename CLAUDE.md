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
7. **Licença MIT.** Nada de dados de exemplo reais no repositório — usar
   sempre dados fictícios nos *fixtures* e capturas. A identidade da
   organização (nome, Direção, Unidades de Coordenação, logótipo) vive
   toda em `src/config/organizacao.ts` e em `public/`, para o código
   continuar genérico e outra organização adotar a aplicação mudando só
   esse ficheiro.
8. Não implementar autenticação, dashboard agregado persistente, nem
   qualquer noção de "utilizador" — isso está fora de âmbito.

## 3. Modelo de negócio do domínio (decisões já tomadas)

- **Circuito Gestor de Projeto → validador, sem contas nem servidor.**
  O GP cria o registo, preenche-o e submete-o; o validador revê, corrige
  e valida (ou devolve para correção). Cada registo tem um `estado`:

  `rascunho` → `submetido` → `validado`, com `devolvido` como caminho de
  volta quando o validador prefere que seja o GP a corrigir.

  É apenas um marcador que viaja dentro do ficheiro exportado. Não há
  submissão em rede, aprovação nem autenticação (ver regra 8 e §2.2):
  "submeter" é marcar o registo e enviar o ficheiro; "validar" é o
  validador fazer o mesmo no sentido inverso, deixando `validacao`
  (quem validou e quando) dentro do registo.

  A separação de papéis é **por ecrã**, não por utilizador: o formulário
  de preenchimento oferece submeter/reabrir; o modo validador oferece
  validar/devolver/anotar. Não existe noção de utilizador em lado nenhum.

- **Os campos da especificação são obrigatórios no catálogo de regras,
  não no schema Zod.** O schema só exige o que é preciso para o registo
  existir na lista (`id`, `tipoRegisto`, `estado`, `direcao`,
  `nomeTratamento`, `gestorProjeto.nome`); tudo o resto é `optional()`.

  A obrigatoriedade é imposta por uma regra declarativa por campo em
  `src/domain/rules/catalog.ts`, com severidade `erro`, e tem um único
  efeito prático: **`podeSubmeter()` é falso enquanto houver erros**.
  Guardar, importar e exportar nunca são bloqueados (§7). É isto que
  permite guardar um rascunho a meio sem inventar valores.

- **Dois tipos de registo, com listas de campos distintas** — as duas
  qualidades em que a organização pode atuar, conforme a especificação
  do utilizador:

  - **Responsável pelo Tratamento** (art. 30.º/1) — organizado em sete
    secções, que são também os sete passos do wizard e a ordem das
    colunas no Excel e das secções no PDF:
    1. Descrição do Processo / Caracterização
    2. Ferramentas / Aplicações utilizadas
    3. Subcontratados
    4. Base de Licitude
    5. Requisitos Funcionais / Direitos dos Titulares
    6. Controlos Operacionais
    7. Observações Gerais

  - **Subcontratante** (art. 30.º/2) — lista própria e claramente mais
    curta, porque o art. 30.º/2 exige menos do subcontratante do que o
    art. 30.º/1 exige de quem determina as finalidades e os meios: caem
    por completo as secções de Ferramentas/Aplicações, Direitos dos
    Titulares e Controlos Operacionais. Cinco secções, não sete, também
    a ordem das colunas no Excel e das secções no PDF:
    1. Identificação (inclui `nomeResponsavelTratamento` — por conta de
       quem se trata — e a caracterização base)
    2. Tratamento e base legal
    3. Titulares e dados
    4. Transferências (art. 44.º) e conservação
    5. Segurança e observações (inclui outros subcontratantes do
       art. 28.º e AIPD)

  Um mesmo ficheiro pode conter registos dos dois tipos, misturados.
  `tipoRegisto: "responsavel" | "subcontratado"` é o discriminante do
  *discriminated union*.

- **Um ficheiro = vários tratamentos da mesma equipa.** A estrutura do
  JSON é sempre `{ metadados, registos: [...] }`.

- **Numeração automática.** Cada registo tem um `numero` sequencial
  dentro do ficheiro, atribuído na criação. É o "ID" que aparece na
  lista, no Excel e no PDF; o `id` UUID continua a ser a chave interna.

- **O validador pode alterar qualquer campo, a qualquer momento.** No
  modo validador, "Editar campos" abre o mesmo formulário do GP sobre o
  registo do ficheiro da sessão, com validar/devolver disponíveis. Não é
  uma permissão de utilizador (continua a não haver utilizadores): é o
  que aquele ecrã oferece.

- **Anexos.** Documentos importantes (imagem, diagrama, Word, PDF) e o
  contrato de subcontratação podem ser anexados ao registo. Sem servidor,
  o conteúdo viaja em base64 dentro do ficheiro — daí os limites de
  `src/domain/schema/anexo.ts` e o cuidado no rascunho local, que guarda
  os nomes mas não o conteúdo quando a quota estoira.

- **Totais, não dashboard.** O painel de totais conta os registos do
  ficheiro aberto no browser. Não contraria a regra 8: não há agregação
  persistente, não há servidor, e os números desaparecem ao fechar.

- **Perguntas condicionais.** Só aparecem quando se aplicam, e só então
  são obrigatórias: as duas do consentimento (arts. 7.º e 8.º) apenas se
  a base de licitude for o consentimento; a identificação das categorias
  especiais apenas se a resposta for "sim"; a identificação do destino
  das transferências apenas se existirem.

- **Duas escalas de resposta fechada.** `respostaSimNao`
  (sim/não/não aplicável) para perguntas factuais; `respostaControlo`
  (com "parcialmente") para perguntas de capacidade e de controlo, onde
  a nuance é o que interessa ao validador. `undefined` significa sempre
  "por responder" — nunca se assume um "não" que ninguém deu.

- **Nome da organização.** O rótulo do período de retenção interno é
  parametrizado por `metadados.organizacao` em vez de trazer o nome de
  uma instituição escrito no código (ver regra 7). Sem esse valor, lê-se
  "pela organização".

- **Glossário:**
  - `GP` = Gestor de Projeto → `gestorProjeto: { nome, contacto? }`.
  - `AIPD` = Avaliação de Impacto sobre a Proteção de Dados.

- **Não incluir nenhum aviso do tipo "não introduza dados pessoais de
  titulares neste formulário"** — nem como banner, nem como regra de
  validação heurística. Excluído do âmbito.

## 4. Ajuda contextual

O template Excel original tinha orientação legal valiosa presa em
comentários de célula (fundamentação dos artigos 6.º, 9.º, 26.º, 27.º, 28.º,
44.º e 4.º/9 do RGPD, regras de conservação, exemplos de categorias e tipos
de dados). Estes textos já foram extraídos e devem ser reaproveitados como
conteúdo de ajuda contextual junto de cada campo (ex.: um ícone "?" com
popover), organizados em `src/domain/help/*.ts`, indexados pelo `id` do
campo do schema. Pede o texto completo desses comentários se precisares —
não os reescrevas de memória, cita a base legal com precisão.

## 5. Texto livre com orientação, não listas fechadas

A versão inicial usava vocabulários controlados para categorias de
titulares, categorias de dados, base de licitude e medidas técnicas. O
utilizador substituiu-os por **texto livre com orientação de
preenchimento**: a realidade de cada processo raramente cabe numa
taxonomia, e uma lista fechada leva a escolher a opção menos errada em
vez de descrever o que realmente acontece.

As listas fechadas que restam são as que têm respostas genuinamente
enumeráveis:
- `respostaSimNao` — sim / não / não aplicável;
- `respostaCnpd` — acrescenta "não sei", porque quem preenche pode
  genuinamente não saber, e isso é diferente de "não";
- `escalaGrandeza` — Baixo (dezenas) / Médio (centenas) / Elevado
  (milhares). Vem acompanhada de um campo livre para o número ou a nota
  exata (`contagemSchema`): a escala sozinha perde precisão, o número
  sozinho envelhece no dia seguinte, por isso guardam-se os dois e é a
  escala que conta para a validação;
- Unidade de Coordenação, que vem da configuração da organização.

As orientações fornecidas pelo utilizador estão em
`src/domain/help/rat.ts` (`ajudaOrientacoes`) e aparecem ao lado de cada
campo. Têm precedência sobre a fundamentação legal extraída do template
antigo, que serve de reserva.

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
npm run typecheck   # tsc -b --force
npm run build
npm run lint
npm run test:zero-rede
```

Atenção: `npx tsc --noEmit` **não verifica nada** neste projeto — o
`tsconfig.json` da raiz tem `files: []` e só agrega referências. Usa
sempre `npm run typecheck`.

## 13. Primeiro prompt a dar ao Claude Code

> Lê o CLAUDE.md e o PLANO-RAT.md na raiz do repositório. Implementa apenas
> a Fase 0 (Fundações): estrutura do projeto Vite+React+TypeScript,
> Tailwind e shadcn/ui, configuração de testes com Vitest, workflow de CI
> e deploy para GitHub Pages, CSP restritiva no `index.html`, e um README
> que documente as garantias de "zero rede" e "zero persistência de
> servidor". Não escrevas ainda nenhum código de domínio (schemas, regras,
> formulário) — isso é a Fase 1. No fim, corre `npm run test` e `npm run
> build` e confirma que ambos passam.
