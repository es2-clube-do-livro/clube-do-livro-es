# Como contribuir

O fluxo de cada tarefa: **issue → branch → commits pequenos → pull request → revisão → merge**.

## Uma vez, ao clonar

```sh
git clone https://github.com/<organizacao>/clube-do-livro-es.git
cd clube-do-livro-es
npm install
git config user.name          # confira que é o seu nome
git config user.email         # e um email ligado à sua conta do GitHub
```

O email do commit precisa estar cadastrado na sua conta do GitHub (Settings → Emails). Se não
estiver, os seus commits não aparecem no seu perfil. Pode ser o email
`…@users.noreply.github.com` que o GitHub mostra nessa página.

## Passo a passo de uma tarefa

```sh
git switch main
git pull
git switch -c feat/indicacoes          # branch da tarefa
# ... código + testes de um commit ...
npm run check
git add <arquivos>
git commit -m "feat(indicacoes): recusa livro já indicado na rodada"
git push -u origin feat/indicacoes     # nos próximos commits, só git push
# ... repita: um commit, um push ...
```

Envie cada commit logo depois de fazê-lo: o CI roda em todo push, nos 3 sistemas, e assim cada
commit fica testado.

Quando a tarefa estiver pronta:

1. Abra o pull request no GitHub (ou `gh pr create`). O modelo traz o checklist; a descrição
   fecha a issue com `Closes #N`.
2. Espere o CI ficar verde no Linux, no macOS e no Windows.
3. Peça a revisão de outra pessoa do grupo.
4. Corrija o que a revisão pedir em **commits novos** na mesma branch; não reescreva os commits já
   enviados.
5. Com aprovação e CI verde, faça o merge com **Create a merge commit** e apague a branch.

Se a `main` andou enquanto você trabalhava, traga as mudanças para a sua branch:

```sh
git fetch origin
git merge origin/main
```

## Checklist de cada commit

- [ ] Faz **uma** coisa só.
- [ ] Os testes dessa mudança estão **no mesmo commit**.
- [ ] `npm run check` passou (tipos, lint, formatação e testes).
- [ ] Mensagem no padrão `tipo(escopo): descrição no presente`, até 72 caracteres.
- [ ] Sem arquivos gerados (`dist/`, `coverage/`, `playwright-report/`), sem `.env`, sem
      `console.log` esquecido.

O hook do Husky roda o lint e o Prettier nos arquivos do commit, e o commitlint confere a
mensagem. Não use `--no-verify`.

## Checklist do pull request

Está no modelo que abre junto com o PR (`.github/pull_request_template.md`):

- [ ] A descrição fecha a issue (`Closes #N`).
- [ ] CI verde no Linux, macOS e Windows.
- [ ] Cobertura continua ≥ 80%.
- [ ] Revisado e aprovado por outra pessoa do grupo.

## Regras de código

- TypeScript estrito; sem `any`, sem `as` para calar o compilador e sem `eslint-disable`. A
  exceção é dar tipo a um JSON vindo de fora com todos os campos opcionais, como a resposta do
  Google Livros.
- **Domínio puro** em `src/domain/`: funções que recebem o estado e devolvem o novo estado ou um
  erro. Sem React, sem `localStorage`, sem `Date.now()`, sem `Math.random()` e sem gerar ids lá
  dentro. Ids, hora e o número aleatório do sorteio chegam como argumento.
- Erros de regra são valores (`{ ok: false, error: 'duplicate-name' }`), não exceções; a tela
  traduz o código para uma mensagem em português. Exceção só para o que nunca deveria acontecer
  (um erro de programação, como apurar uma rodada sem indicações).
- Cada área de regra tem o seu arquivo (veja `docs/ARQUITETURA.md`), o que evita conflitos entre
  pull requests paralelos.
- Componentes pequenos e acessíveis: `<label>` em todo campo, botões com texto, foco visível.
- Limites do ESLint (complexidade 10, função até 80 linhas, arquivo até 300): se estourar,
  divida, não desligue a regra.
- Código e identificadores em inglês; textos da tela, nomes de testes e mensagens de commit em
  português.
- Sem dependências novas sem motivo claro. A única chamada externa é a busca de capa no Google
  Livros (R15), sempre atrás de `findCover` e trocada por um dublê nos testes.

## Regras de teste

- **Unidade (Vitest):** pela API pública do módulo, um comportamento por teste, nome que diz o
  comportamento em português (`it('recusa voto no próprio livro')`), formato
  preparar → agir → verificar, sem lógica (if/loop) dentro do teste. Dados de teste pelas
  fábricas de `src/test/factories.ts`.
- **Componentes (Testing Library):** consultas por papel e rótulo (`getByRole`,
  `getByLabelText`), interação com `user-event` e `renderWithClub` de `src/test/render.tsx`.
  Nada de classes CSS, ids de teste ou snapshots.
- **E2E (Playwright):** jornadas reais em `e2e/`, localizadores por papel e rótulo, asserções que
  esperam sozinhas (`await expect(...).toBeVisible()`), nenhum `waitForTimeout`. Cada teste
  começa com o navegador limpo e não depende de outro.
- **Cobertura ≥ 80%** em linhas, funções, ramos e instruções. Não exclua arquivos para subir o
  número: as únicas exclusões são `src/main.tsx`, `src/test/`, os arquivos de tipos e os
  próprios testes.

## Como revisar

- Baixe a branch (`git fetch` e `git switch <branch>`) e rode `npm run check` e `npm run dev`.
- Confira as regras de código e de teste acima.
- Comente o que precisa mudar e por quê. Sugestões opcionais começam com "Opcional:".
- Aprove só quando você entender a mudança.

## Mensagens de commit

```text
feat(indicacoes): recusa livro já indicado na rodada
fix(votacao): habilita confirmar só com as duas opções marcadas
test(e2e): conclui a leitura e mostra no histórico
refactor(apuracao): separa o desempate em uma função
docs: explica como rodar os testes e a cobertura
ci: roda os testes e2e nos três sistemas
```

| Tipo       | Quando                                  |
| ---------- | --------------------------------------- |
| `feat`     | funcionalidade nova para quem usa       |
| `fix`      | correção de defeito                     |
| `test`     | só testes                               |
| `refactor` | muda o código sem mudar o comportamento |
| `docs`     | documentação                            |
| `ci`       | workflows do GitHub Actions             |
| `chore`    | configuração, dependências, ferramentas |

## Regras da `main` (configuradas no GitHub)

- Ninguém envia direto para a `main`: tudo entra por pull request.
- O PR precisa de 1 aprovação e do CI verde nos 3 sistemas.
- Merge só por merge commit (squash e rebase desativados).
- Force push na `main` é bloqueado.
