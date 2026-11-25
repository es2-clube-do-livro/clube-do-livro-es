import { expect, it } from 'vitest';

import { aClub, aMember, aNomination, aRound } from '../test/factories';
import { isClubState } from './validate';

const winner = { nominationId: 'n1', method: 'draw' };
const closedAt = '2026-03-09T19:00:00Z';

it.each([
  aRound(),
  aRound({ status: 'voting', nominations: [aNomination()] }),
  {
    ...aRound(),
    status: 'finished',
    nominations: [aNomination()],
    winner,
    closedAt,
    finishedAt: closedAt,
  },
])('aceita dados de rodadas em etapas compatíveis', (round) => {
  expect(isClubState({ ...aClub(), rounds: [round] })).toBe(true);
});

it.each([
  { number: 0 },
  { status: 'perdida' },
  { startedAt: 'ontem' },
  { voters: [false] },
  { results: { votes: { n1: -1 }, firsts: {} } },
  { results: [] },
  { status: 'reading', closedAt, winner: { nominationId: 'n1', method: 'desconhecido' } },
  { status: 'finished', closedAt, winner, finishedAt: null },
  { nominations: [{ ...aNomination(), book: null }] },
  {
    nominations: [
      {
        ...aNomination(),
        book: { title: 'Livro', author: 'Ana', coverUrl: 'http://exemplo.org/capa' },
      },
    ],
  },
])('recusa conteúdo inválido dentro de uma rodada: %j', (fields) => {
  expect(isClubState({ ...aClub(), rounds: [{ ...aRound(), ...fields }] })).toBe(false);
});

it('recusa membros com nome ausente', () => {
  expect(isClubState({ ...aClub(), members: [{ id: 'ana' }] })).toBe(false);
});

it('aceita uma capa https e membros válidos', () => {
  const nomination = aNomination();
  nomination.book.coverUrl = 'https://exemplo.org/capa.jpg';
  expect(
    isClubState(aClub({ members: [aMember()], rounds: [aRound({ nominations: [nomination] })] })),
  ).toBe(true);
});
