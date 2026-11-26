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

> Em construção. O escopo completo está em [`docs/ESCOPO.md`](docs/ESCOPO.md).

O clube usa o site num aparelho só, durante o encontro: quem organiza cadastra os membros, cada
pessoa indica um livro, todos votam em segredo e o site apura o vencedor. Os dados ficam no
navegador, sem login.

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
