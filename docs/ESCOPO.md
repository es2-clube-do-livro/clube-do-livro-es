# Escopo

## Objetivo

Ajudar um clube do livro a escolher a próxima leitura de forma justa. Cada membro indica um
livro, todos votam em segredo com 1ª e 2ª opção, e o site apura o resultado com regras claras de
desempate. O livro vencedor vira a leitura atual e, ao terminar, vai para o histórico.

## Quem usa e como

- O clube usa o site num aparelho só, durante o encontro. Quem organiza cadastra os membros e
  conduz a rodada, e o aparelho passa de mão em mão para cada pessoa indicar e votar.
- Não há login: qualquer pessoa abre o link e usa. Os dados ficam no navegador
  (`localStorage`); em outro aparelho, o clube começa vazio.
- Quem avalia o trabalho pode carregar um **clube de exemplo** e percorrer uma rodada inteira
  sozinho.

O site tem três abas: **Rodada** (indicações, votação e leitura atual), **Membros** e
**Histórico**.

## Histórias de usuário

Os números das regras (R1 a R15) aparecem nos nomes e nos comentários dos testes.

### US01: Cadastrar membros

Como organizador, quero cadastrar e remover membros, para saber quem indica e vota.

- Um nome válido aparece na lista (R1).
- Nome curto, longo ou repetido mostra o erro e não entra (R1).
- Remover pede confirmação.
- Durante a indicação ou a votação, adicionar e remover ficam bloqueados, com um aviso (R2).

### US02: Indicar um livro

Como membro, quero indicar um livro para a rodada, para que o clube possa votar nele.

- Uma rodada só começa com 2 ou mais membros e sem outra em andamento (R3).
- A indicação tem título e autor, com limites de tamanho (R4).
- Cada membro indica no máximo um livro por rodada (R5).
- O mesmo livro não entra duas vezes na rodada (R6).
- O site busca a capa no Google Livros; sem capa, a indicação entra do mesmo jeito (R15).
- A lista mostra os livros, nunca quem indicou cada um.

### US03: Votar

Como membro, quero votar em segredo na 1ª e na 2ª opção, para escolher o que o clube lê.

- A votação abre com pelo menos 2 indicações; depois disso, não entram mais indicações (R7).
- A pessoa escolhe o próprio nome, marca a 1ª e a 2ª opção, diferentes, e confirma (R8).
- O próprio livro aparece desabilitado (R8).
- Se só houver uma opção possível para a pessoa, ela marca só a 1ª (R8).
- Quem já votou não vota de novo (R8).
- Ao confirmar, a tela mostra "Voto registrado" sem repetir as escolhas (R9).

### US04: Apurar

Como organizador, quero encerrar a votação e ver o vencedor, para começar a leitura.

- Só dá para encerrar com pelo menos um voto (R10).
- Vence o livro com mais votos; no empate, o que tem mais votos de 1ª opção; se continuar
  empatado, há um sorteio entre os empatados (R11).
- O resultado mostra o vencedor, o critério que decidiu e uma barra por livro, com votos e
  percentual (R11).

### US05: Acompanhar a leitura

Como membro, quero ver a leitura atual e marcá-la como concluída.

- Depois da apuração, a aba Rodada mostra o vencedor, com a capa, se houver (R12).
- "Concluir leitura" leva a rodada para o histórico e libera uma rodada nova (R12).

### US06: Ver o histórico

Como membro, quero ver as leituras passadas e como cada votação terminou.

- As rodadas concluídas aparecem da mais recente para a mais antiga, com o vencedor, o critério
  e o resultado da votação (R13).
- Sem rodadas concluídas, a aba mostra um aviso.

### US07: Guardar os dados

Como organizador, quero que o clube continue lá quando eu voltar ao site.

- Tudo o que muda é salvo no navegador e volta ao recarregar a página (R14).
- Dados salvos inválidos: o clube começa vazio e mostra um aviso (R14).
- "Apagar todos os dados" pede confirmação e deixa o clube vazio (R14).
- Com o clube vazio, "Carregar exemplo" cria 4 membros e uma rodada de indicações com 3 livros.

## Regras do domínio

| Regra | Descrição                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1    | Nome do membro: de 2 a 40 caracteres, sem os espaços das pontas; não pode repetir outro nome, ignorando maiúsculas e acentos.                                                                     |
| R2    | Membros só podem ser adicionados ou removidos quando não há rodada em indicação ou votação.                                                                                                       |
| R3    | Rodada nova: precisa de 2 ou mais membros e de nenhuma rodada em indicação, votação ou leitura. Recebe o próximo número.                                                                          |
| R4    | Livro: título de 1 a 120 caracteres e autor de 1 a 80, sem os espaços das pontas.                                                                                                                 |
| R5    | Um membro indica no máximo um livro por rodada.                                                                                                                                                   |
| R6    | Livro repetido na rodada é recusado: compara título e autor ignorando maiúsculas, acentos, pontuação e espaços extras.                                                                            |
| R7    | A votação abre com 2 ou mais indicações e fecha as indicações.                                                                                                                                    |
| R8    | Cédula: cada membro vota uma vez; 1ª e 2ª opção diferentes, só entre as indicações da rodada, nunca o próprio livro. São 2 escolhas, ou 1 quando só existe uma opção possível para aquela pessoa. |
| R9    | Voto secreto: o site guarda quem já votou e a soma dos votos, nunca o que cada pessoa escolheu.                                                                                                   |
| R10   | A votação só encerra com pelo menos um voto.                                                                                                                                                      |
| R11   | Apuração: 1ª e 2ª opção valem 1 voto cada. Vence quem tem mais votos; no empate, mais votos de 1ª opção; se ainda empatar, sorteio entre os empatados. O resultado registra o critério.           |
| R12   | O vencedor vira a leitura atual; concluir a leitura encerra a rodada.                                                                                                                             |
| R13   | O histórico lista as rodadas concluídas, da mais recente para a mais antiga, sem dizer quem indicou o quê.                                                                                        |
| R14   | O clube é salvo no navegador a cada mudança; dados inválidos são descartados com aviso.                                                                                                           |
| R15   | Ao indicar, o site busca a capa no Google Livros pelo título e pelo autor; se a busca falhar ou não achar, a indicação entra sem capa.                                                            |

## Decisões de escopo

O sistema é pequeno de propósito: cada coisa que ficou de fora traria complexidade sem ajudar a
mostrar como os testes sustentam a manutenção do código.

| Fica de fora                               | Por quê                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Login e contas                             | Qualquer pessoa usa sem cadastro, inclusive quem avalia; login exigiria servidor e guardar dados pessoais. |
| Servidor e banco de dados                  | Sem servidor não há custo, cota nem segredo, e os testes rodam iguais nos 3 sistemas.                      |
| Votação em vários aparelhos ao mesmo tempo | Exigiria servidor; o uso no encontro, com um aparelho, cobre o fluxo inteiro.                              |
| Sinopse e outros dados do livro            | Título, autor e capa bastam para votar.                                                                    |
| Prazos e avanço automático das fases       | Quem organiza avança as fases pelos botões; menos estado para testar.                                      |

A única chamada externa é a busca da capa (R15), que não usa chave e nunca bloqueia a indicação.
Nos testes de unidade ela é trocada por um dublê, e nos testes e2e o Playwright intercepta a
requisição, para nenhum teste depender da internet.

## Requisitos do trabalho e como o projeto atende

| Requisito do enunciado                                                     | Como atendemos                                                         | Onde conferir                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------- |
| Repositório com nome próprio                                               | `clube-do-livro-es`                                                    | GitHub                        |
| README com Integrantes, Sobre o sistema, Tecnologias e Execução dos testes | Seções com esses nomes                                                 | `README.md`                   |
| 30 ou mais testes de unidade                                               | Domínio, dados e componentes                                           | `npm run test:coverage`       |
| 5 ou mais testes e2e                                                       | 7 jornadas no Playwright                                               | `e2e/`, `npm run test:e2e`    |
| Cobertura ≥ 80%                                                            | Vitest com v8; o comando falha abaixo de 80%                           | resumo de cada execução do CI |
| CI em Linux, macOS e Windows a cada commit                                 | GitHub Actions com a matriz dos 3 sistemas, em todo push               | aba Actions                   |
| Commits pequenos, frequentes e descritivos (50 ou mais)                    | Conventional Commits, um push por commit, tudo por pull request        | histórico e PRs               |
| Sistema em produção                                                        | Firebase Hosting (plano gratuito), publicado pelo CI depois dos testes | link no README                |
