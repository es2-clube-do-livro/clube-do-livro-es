# Clube do Livro ES

[![CI da main](https://github.com/es2-clube-do-livro/clube-do-livro-es/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/es2-clube-do-livro/clube-do-livro-es/actions/workflows/ci.yml?query=branch%3Amain)

Site para um clube do livro escolher a próxima leitura: indicações, votação secreta com 1ª e
2ª opção, apuração com desempate, leitura atual e histórico.

Trabalho prático de Engenharia de Software 2.

[Acessar o Clube do Livro em produção](https://clube-do-livro-es.web.app/)

## Integrantes

- Eduardo Assis Tomich
- Alvaro Candido de Oliveira Neto
- Lucas Vitor da Silva Ramos

## Sobre o sistema

O Clube do Livro ES ajuda um clube de leitura a escolher, de forma justa, o próximo livro. O
clube usa o site num aparelho só, durante o encontro, e os dados ficam salvos no navegador: não
há login nem servidor.

- **Membros:** cadastrar e remover quem participa, sem nomes repetidos.
- **Indicações:** cada membro indica um livro por rodada; o site busca a capa no Google Livros e
  recusa livros repetidos.
- **Votação secreta:** cada pessoa marca a 1ª e a 2ª opção, nunca o próprio livro. O site guarda
  só quem já votou e a soma dos votos.
- **Apuração:** vence o livro com mais votos; no empate, o que tem mais votos de 1ª opção; se
  ainda empatar, há sorteio. O resultado aparece em barras.
- **Leitura e histórico:** o vencedor vira a leitura atual e, ao terminar, vai para o histórico
  com o resultado da votação.
- **Clube de exemplo:** carrega membros e indicações prontos para experimentar o fluxo.

As histórias de usuário e as regras estão em [`docs/ESCOPO.md`](docs/ESCOPO.md), e a arquitetura
em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Tecnologias

React, TypeScript e Vite no site; Vitest, Testing Library e Playwright nos testes; GitHub
Actions no CI/CD; Firebase Hosting na produção.

## Execução dos testes

Use o Node.js 24 (versão indicada em `.nvmrc`) e execute `npm ci` na raiz do repositório
para instalar as dependências.

### Testes de unidade, componentes e cobertura

Use `npm test` para rodar a suíte do Vitest ou `npm run test:coverage` para rodar os mesmos
testes e medir a cobertura com V8.

Abra `coverage/index.html` para ver os resultados por arquivo. O resumo fica em
`coverage/summary.txt`. O comando exige pelo menos 80% de cobertura global em cada métrica
(linhas, funções, ramos e instruções).

### Testes de ponta a ponta

Na primeira execução, instale o Chromium do Playwright com `npx playwright install chromium`.
Em um Linux que também precise das bibliotecas do sistema, use
`npx playwright install --with-deps chromium`.

```sh
npm run test:e2e
```

O Playwright gera o build de produção e inicia o site localmente em `127.0.0.1:4173` durante
os testes. Para rodar apenas a jornada de leitura e histórico, use
`npm run test:e2e -- e2e/leitura-historico.spec.ts`.

## Como contribuir

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md).
