# Arquitetura

## Visão geral

```text
  telas (src/features)  ──usa──▶  estado do clube (src/app)  ──chama──▶  regras (src/domain)
          │                              │
          └──▶ capa (src/services)       └──salva/carrega──▶  dados (src/storage)
```

- **`src/domain`:** as regras do clube em funções puras. Recebem o estado e devolvem o novo
  estado ou um erro. É onde está a maior parte dos testes de unidade.
- **`src/app`:** o `ClubProvider`, que guarda o estado em React, aplica as funções do domínio e
  fornece ids, hora e números aleatórios.
- **`src/storage`:** a interface `ClubRepository` e duas implementações: `localStorage` (o site) e
  memória (os testes).
- **`src/services`:** a busca da capa no Google Livros.
- **`src/features`:** uma pasta por aba. As telas só falam com `useClub()`.
- **`src/ui`:** componentes genéricos (botão, campo, diálogo, aviso).

O domínio não conhece React nem o navegador, então os testes dele são rápidos e
determinísticos. As telas não conhecem o `localStorage` nem a internet, então os testes de
componente usam o estado em memória e um dublê da busca de capa.

## Pastas

Cada área de regra tem o seu arquivo, para pull requests paralelos não mexerem no mesmo lugar.

```text
src/
  domain/
    types.ts          tipos do clube
    result.ts         Result<T, E>: { ok: true, value } ou { ok: false, error }
    club.ts           clube vazio, rodada ativa, troca de rodada
    text.ts           limpar e normalizar textos
    members.ts        R1, R2
    nominations.ts    R3 a R7
    ballot.ts         R8, R9
    tally.ts          R10, R11
    reading.ts        R12, R13
  app/
    club-context.ts   useClub(), ClubEnvironment, ClubChange
    ClubProvider.tsx  o estado do clube em React
    browser-environment.ts  ids, hora e sorteio do navegador
    App.tsx           layout, abas e rodapé
  storage/            R14: repository.ts, memory.ts, local-storage.ts, validate.ts, sample.ts
  services/
    google-books.ts   R15: busca da capa
    cover-finder.ts   contexto da busca de capa (um dublê nos testes)
  features/
    round/            aba Rodada: RoundPage, NoRoundStep, NominationStep (NominationForm,
                      NominationList), VotingStep (Ballot, CloseVoting), ReadingStep, ResultChart
    members/          aba Membros (MembersPage, AddMemberForm)
    history/          aba Histórico
    data/             aviso de dados inválidos, carregar exemplo e apagar os dados
  ui/                 Button, TextField, EmptyState, ConfirmDialog
  styles/             tokens.css, global.css
  test/               setup.ts, factories.ts, render.tsx
e2e/                  testes Playwright e helpers
```

As três abas e as etapas da rodada nascem como telas vazias ("Em breve"). Cada funcionalidade
só troca o conteúdo do próprio arquivo, sem disputar as rotas.

## Modelo de dados

```ts
type MemberId = string; // ids gerados pelo ClubProvider (crypto.randomUUID)
type NominationId = string;
type RoundId = string;

interface Member {
  id: MemberId;
  name: string;
}

interface Book {
  title: string;
  author: string;
  coverUrl: string | null;
}

/** `memberId` existe só para barrar o voto no próprio livro (R8); a tela nunca o mostra. */
interface Nomination {
  id: NominationId;
  memberId: MemberId;
  book: Book;
}

type RoundStatus = 'nominating' | 'voting' | 'reading' | 'finished';

/** Somas por indicação; nunca cédulas (R9). */
interface Results {
  votes: Readonly<Record<NominationId, number>>;
  firsts: Readonly<Record<NominationId, number>>;
}

type DecisionMethod = 'votes' | 'first-choices' | 'draw';

interface Round {
  id: RoundId;
  number: number;
  status: RoundStatus;
  nominations: readonly Nomination[];
  /** Quem já votou (R8), sem o que escolheu (R9). */
  voters: readonly MemberId[];
  results: Results;
  winner: { nominationId: NominationId; method: DecisionMethod } | null;
  startedAt: string; // datas em ISO 8601, para caber no JSON
  closedAt: string | null;
  finishedAt: string | null;
}

interface ClubState {
  version: 1;
  members: readonly Member[];
  rounds: readonly Round[];
}
```

## O estado em React

```ts
interface ClubEnvironment {
  newId(): string;
  now(): string;
  random(): number;
}

// Nas telas:
const { state, apply } = useClub();
const result = apply((club, env) => addMember(club, name, env.newId()));
if (!result.ok) setError(messageFor(result.error));
```

`apply` roda a função do domínio com o estado atual. Se der certo, guarda o novo estado e avisa
`onChange` (que salva no navegador). Nos testes, `ClubProvider` recebe `initialState` e um
`environment` com ids, hora e sorteio fixos.

## Contrato entre as áreas

| Arquivo                    | Funções                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/club-context.ts`      | `useClub()` → `{ state, apply }`; `apply((club, env) => regra(club, …))`                                                                       |
| `domain/club.ts`           | `emptyClub()`, `activeRound(state)`, `isRoundOpen(state)`, `replaceRound(state, round)`                                                        |
| `domain/text.ts`           | `cleanSpaces(text)`, `normalizeText(text)`                                                                                                     |
| `domain/members.ts`        | `validateMemberName(name, members)`, `addMember(state, name, id)`, `removeMember(state, id)`                                                   |
| `domain/nominations.ts`    | `startRound(state, id, now)`, `validateBook(book)`, `nominate(state, memberId, book, id)`, `openVoting(state)`                                 |
| `domain/ballot.ts`         | `eligibleOptions(round, voter)`, `requiredChoices(round, voter)`, `validateBallot(round, voter, choices)`, `castBallot(state, voter, choices)` |
| `domain/tally.ts`          | `standings(round)`, `decide(round, random)`, `closeVoting(state, now, random)`                                                                 |
| `domain/reading.ts`        | `finishReading(state, now)`, `history(state)`, `winningNomination(round)`                                                                      |
| `storage/`                 | `ClubRepository`, `createMemoryRepository()`, `createLocalStorageRepository(storage)`, `isClubState(value)`, `sampleClub(env)`                 |
| `services/google-books.ts` | `findCover(book, fetcher, timeoutMs)`                                                                                                          |
| `services/cover-finder.ts` | `CoverFinderContext`, `useCoverFinder()`                                                                                                       |

Os erros são códigos em inglês (`duplicate-name`, `own-nomination`…), e cada tela os traduz
para uma mensagem em português.

## Persistência (R14)

- Chave `clube-do-livro-es` no `localStorage`, com o JSON do `ClubState`.
- Ao carregar, uma validação confere a forma dos dados. JSON inválido, outra versão ou formato
  errado: o clube começa vazio e a tela mostra um aviso.
- O `main.tsx` carrega o repositório antes de montar o `ClubProvider` e salva em `onChange`.

## Estratégia de testes

| Nível                      | Ferramenta                     | O que cobre                                                | Onde                                              |
| -------------------------- | ------------------------------ | ---------------------------------------------------------- | ------------------------------------------------- |
| Unidade (domínio)          | Vitest                         | cada regra, casos de erro e de borda                       | `src/domain/*.test.ts`                            |
| Unidade (dados e serviços) | Vitest                         | salvar, carregar, dados inválidos, busca da capa com dublê | `src/storage/*.test.ts`, `src/services/*.test.ts` |
| Unidade (componentes)      | Vitest, Testing Library, jsdom | formulários, mensagens de erro, estados vazios             | `src/**/*.test.tsx`                               |
| Ponta a ponta              | Playwright (Chromium)          | jornadas completas no build de produção                    | `e2e/*.spec.ts`                                   |

- **Cobertura:** `@vitest/coverage-v8`, com `include: ['src/**/*.{ts,tsx}']`, excluindo só
  `src/main.tsx`, os testes, `src/test/**` e `*.d.ts`. Os `thresholds` de 80 (linhas, funções,
  ramos e instruções) fazem o comando falhar abaixo disso.
- **Playwright:** o `webServer` roda `npm run build && npm run preview -- --port 4173
--strictPort`. Cada teste começa com o `localStorage` vazio. O Google Livros é interceptado
  com `page.route`.
- **Sorteio:** testado na unidade com um `random` falso. Os e2e não dependem de sorteio.

Testes e2e previstos:

- a página abre e troca entre as três abas;
- cadastra e remove membros;
- indica livros e recusa indicação repetida;
- vota até sair o vencedor;
- impede votar no próprio livro e votar duas vezes;
- conclui a leitura e mostra no histórico;
- mantém os dados depois de recarregar a página.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml`, a cada push, em qualquer branch:

```yaml
name: CI
on:
  push:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  testes:
    name: Testes (${{ matrix.os }})
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      # checkout, setup-node (versão do .nvmrc, cache npm), npm ci
      # npm run typecheck, lint, format:check
      # npm run test:coverage (falha abaixo de 80%) e o resumo da cobertura
      # npx playwright install --with-deps chromium e npm run test:e2e
  producao:
    needs: testes
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    # build e FirebaseExtended/action-hosting-deploy com channelId: live
```

- Todo push roda nos 3 sistemas, e o pull request mostra o resultado do último commit.
- A produção só recebe a `main`, e só depois dos 3 sistemas passarem.
- No GitHub, a variável de repositório `FIREBASE_PROJECT_ID` define o projeto de produção.
  O secret `FIREBASE_SERVICE_ACCOUNT_<ID>` contém o JSON da conta de serviço do Hosting.
  No nome do secret, o ID fica em maiúsculas e cada hífen vira um sublinhado. Do Firebase,
  só o Hosting é usado.

## Decisões

| Decisão                                             | Motivo                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Sem servidor, dados no navegador                    | Qualquer pessoa usa sem conta; nada de cota, custo ou segredo; testes determinísticos. |
| Domínio puro, com ids, hora e sorteio por argumento | Testes de unidade sem mocks de módulo e sem resultados que variam.                     |
| Voto secreto mesmo num aparelho só                  | Mantém a regra que dá sentido à votação, e ela é testável (R9).                        |
| Erros como valores (`Result`)                       | A tela escolhe a mensagem; o teste confere o código do erro.                           |
| Busca de capa atrás de uma função com `fetcher`     | Os testes trocam a internet por um dublê.                                              |
| Merge commit nos PRs                                | Preserva os commits pequenos e mostra cada PR no histórico.                            |
