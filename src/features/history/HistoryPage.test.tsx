import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { App } from '../../app/App';
import { aBook, aClub, aMember, aNomination, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { HistoryPage } from './HistoryPage';

const dune = aNomination({
  id: 'duna',
  memberId: 'bia',
  book: aBook({ title: 'Duna', author: 'Frank Herbert' }),
});
const sea = aNomination({
  id: 'mar',
  memberId: 'ana',
  book: aBook({ title: 'Mar Morto', author: 'Jorge Amado' }),
});
const reading = aRound({
  number: 2,
  id: 'r2',
  status: 'reading',
  nominations: [sea, dune],
  voters: ['ana', 'bia'],
  results: { votes: { mar: 1, duna: 1 }, firsts: { mar: 1, duna: 1 } },
  winner: { nominationId: dune.id, method: 'draw' },
  closedAt: '2026-03-04T19:00:00Z',
});

it('mostra o aviso enquanto a leitura ainda está em andamento (R13)', () => {
  renderWithClub(<HistoryPage />, { state: aClub({ rounds: [reading] }) });
  expect(screen.getByText('Nenhuma leitura concluída ainda.')).toBeVisible();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

it('lista primeiro a última leitura concluída pelo usuário, com vencedor e resultado (R12, R13)', async () => {
  const older = aRound({
    status: 'finished',
    nominations: [dune, sea],
    voters: ['bia'],
    results: { votes: { mar: 1, duna: 0 }, firsts: { mar: 1, duna: 0 } },
    winner: { nominationId: sea.id, method: 'votes' },
    startedAt: '2026-02-01T19:00:00Z',
    closedAt: '2026-02-03T19:00:00Z',
    finishedAt: '2026-02-20T19:00:00Z',
  });
  const state = aClub({ members: [aMember('Ana'), aMember('Bia')], rounds: [older, reading] });
  const { user } = renderWithClub(<App />, { state });
  await user.click(screen.getByRole('button', { name: 'Concluir leitura' }));
  await user.click(screen.getByRole('link', { name: 'Histórico' }));

  const list = screen.getByRole('list', { name: 'Leituras concluídas' });
  expect(
    within(list)
      .getAllByRole('heading')
      .map((heading) => heading.textContent),
  ).toEqual(['Rodada 2', 'Rodada 1']);
  const winners = within(list).getAllByRole('definition');
  expect(winners[0]).toHaveTextContent('Duna — Frank Herbert');
  expect(winners[1]).toHaveTextContent('Mar Morto — Jorge Amado');
  expect(within(list).getByText('Desempate por sorteio entre os livros empatados.')).toBeVisible();
  expect(within(list).getByText('Venceu pelo total de votos.')).toBeVisible();
  expect(within(list).getAllByRole('meter', { name: 'Duna — Frank Herbert' })[0]).toHaveAttribute(
    'aria-valuetext',
    '50%',
  );
  expect(list).not.toHaveTextContent(/\b(ana|bia)\b/i);
});

it('sinaliza quando a indicação vencedora de uma rodada concluída está ausente', () => {
  const round = aRound({
    ...reading,
    status: 'finished',
    nominations: [sea],
    finishedAt: '2026-03-08T19:00:00Z',
  });
  renderWithClub(<HistoryPage />, { state: aClub({ rounds: [round] }) });

  expect(screen.getByText('Livro vencedor indisponível.')).toBeVisible();
  expect(screen.queryByRole('definition')).not.toBeInTheDocument();
});
