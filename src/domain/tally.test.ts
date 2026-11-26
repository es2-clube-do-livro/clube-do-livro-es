import { describe, expect, it } from 'vitest';

import { aNomination, aRound } from '../test/factories';
import { decide, standings } from './tally';
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

    expect(decide(round)).toEqual({ nominationId: 'b', method: 'votes' });
  });

  it('no empate de votos, vence quem tem mais votos de 1ª opção (R11)', () => {
    const round = roundWith({ votes: { a: 2, b: 2, c: 1 }, firsts: { a: 1, b: 2 } });

    expect(decide(round)).toEqual({ nominationId: 'b', method: 'first-choices' });
  });

  it('não decide quando o empate continua na 1ª opção', () => {
    const round = roundWith({ votes: { a: 2, b: 2, c: 2 }, firsts: { a: 1, b: 1, c: 1 } });

    expect(decide(round)).toBeNull();
  });
});
