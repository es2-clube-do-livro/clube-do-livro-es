# Clube do Livro ES

Site para um clube do livro escolher a próxima leitura: indicações, votação secreta com 1ª e
2ª opção, apuração com desempate, leitura atual e histórico.

Trabalho prático de Engenharia de Software 2.

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

```sh
npm install
npm run test:coverage   # testes de unidade e cobertura
npm run test:e2e        # testes de ponta a ponta (Playwright)
```

## Como contribuir

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md).
