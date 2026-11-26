import { describe, expect, it } from 'vitest';

import { aClub, aNomination, aRound } from '../test/factories';
import { closeVoting, decide, standings } from './tally';
import type { Results } from './types';

function roundWith(results: Results) {
  return aRound({
    status: 'voting',
    nominations: [
      aNomination({ id: 'a', memberId: 'ana' }),
      aNomination({ id: 'b', memberId: 'bia' }),
      aNomination({ id: 'c', memberId: 'caio' }),
    ],
    voters: ['ana', 'bia', 'caio'],
    results,
  });
}

const neverDrawn = () => {
  throw new Error('não devia sortear');
};

describe('standings', () => {
  it('ordena do mais votado ao menos votado', () => {
    const round = roundWith({ votes: { a: 1, b: 3, c: 2 }, firsts: {} });

    expect(standings(round).map((standing) => standing.nominationId)).toEqual(['b', 'c', 'a']);
  });

  it('no empate de votos, põe antes quem tem mais votos de 1ª opção', () => {
    const round = roundWith({ votes: { a: 2, b: 2, c: 2 }, firsts: { c: 2, a: 1 } });

    expect(standings(round).map((standing) => standing.nominationId)).toEqual(['c', 'a', 'b']);
  });

  it('calcula o percentual de cada livro sobre todos os votos', () => {
    const round = roundWith({ votes: { a: 1, b: 3 }, firsts: { b: 2 } });

    expect(standings(round)).toEqual([
      { nominationId: 'b', votes: 3, firsts: 2, share: 0.75 },
      { nominationId: 'a', votes: 1, firsts: 0, share: 0.25 },
      { nominationId: 'c', votes: 0, firsts: 0, share: 0 },
    ]);
  });

  it('mostra percentual zero quando ninguém votou', () => {
    const round = roundWith({ votes: {}, firsts: {} });

    expect(standings(round).map((standing) => standing.share)).toEqual([0, 0, 0]);
  });
});

describe('decide', () => {
  it('dá a vitória a quem tem mais votos (R11)', () => {
    const round = roundWith({ votes: { a: 1, b: 3, c: 2 }, firsts: { a: 1 } });

    expect(decide(round, neverDrawn)).toEqual({ nominationId: 'b', method: 'votes' });
  });

  it('no empate de votos, vence quem tem mais votos de 1ª opção (R11)', () => {
    const round = roundWith({ votes: { a: 2, b: 2, c: 1 }, firsts: { a: 1, b: 2 } });

    expect(decide(round, neverDrawn)).toEqual({ nominationId: 'b', method: 'first-choices' });
  });

  it('se o empate continua, sorteia entre os empatados (R11)', () => {
    const round = roundWith({ votes: { a: 2, b: 2, c: 2 }, firsts: { a: 1, b: 1, c: 1 } });

    expect(decide(round, () => 0)).toEqual({ nominationId: 'a', method: 'draw' });
    expect(decide(round, () => 0.99)).toEqual({ nominationId: 'c', method: 'draw' });
  });

  it('sorteia só entre os livros que continuam empatados', () => {
    const round = roundWith({ votes: { a: 1, b: 2, c: 2 }, firsts: { b: 1, c: 1 } });

    expect(decide(round, () => 0)).toEqual({ nominationId: 'b', method: 'draw' });
    expect(decide(round, () => 0.99)).toEqual({ nominationId: 'c', method: 'draw' });
  });

  it('avisa quando a rodada não tem indicações', () => {
    expect(() => decide(aRound(), () => 0)).toThrow('não tem indicações');
  });
});

describe('closeVoting', () => {
  const now = '2026-03-08T21:00:00.000Z';

  it('encerra a votação e grava o vencedor, o critério e a hora', () => {
    const round = roundWith({ votes: { a: 1, b: 3, c: 2 }, firsts: {} });

    const result = closeVoting(aClub({ rounds: [round] }), now, neverDrawn);

    expect(result.ok && result.value.rounds[0]).toEqual({
      ...round,
      status: 'reading',
      winner: { nominationId: 'b', method: 'votes' },
      closedAt: now,
    });
  });

  it('não encerra sem nenhum voto (R10)', () => {
    const round = { ...roundWith({ votes: {}, firsts: {} }), voters: [] };

    expect(closeVoting(aClub({ rounds: [round] }), now, neverDrawn)).toEqual({
      ok: false,
      error: 'no-ballots',
    });
  });

  it('não encerra o que não está em votação', () => {
    const round = aRound({ status: 'nominating' });

    expect(closeVoting(aClub({ rounds: [round] }), now, neverDrawn)).toEqual({
      ok: false,
      error: 'not-voting',
    });
  });
});
