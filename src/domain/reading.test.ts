import { describe, expect, it } from 'vitest';

import { aClub, aNomination, aRound } from '../test/factories';
import { activeRound } from './club';
import { finishReading, history, winningNomination } from './reading';

const closedAt = '2026-03-04T19:00:00.000Z';
const finishedAt = '2026-03-11T19:00:00.000Z';
const winner = aNomination({ id: 'n2', memberId: 'bia' });
const reading = aRound({
  status: 'reading',
  nominations: [aNomination(), winner],
  voters: ['ana'],
  results: { votes: { n1: 0, n2: 1 }, firsts: { n1: 0, n2: 1 } },
  winner: { nominationId: winner.id, method: 'votes' },
  closedAt,
});

describe('winningNomination', () => {
  it('encontra a indicação pelo id do vencedor da apuração (R12)', () => {
    expect(winningNomination(reading)).toEqual(winner);
  });

  it('devolve null enquanto não há vencedor', () => {
    expect(winningNomination(aRound())).toBeNull();
  });

  it('devolve null quando o vencedor não está entre as indicações', () => {
    expect(winningNomination({ ...reading, nominations: [] })).toBeNull();
  });
});

describe('finishReading', () => {
  it('guarda a conclusão sem mudar o vencedor ou a apuração (R12)', () => {
    const club = aClub({ rounds: [reading] });
    const result = finishReading(club, finishedAt);

    expect(result).toEqual({
      ok: true,
      value: { ...club, rounds: [{ ...reading, status: 'finished', finishedAt }] },
    });
    expect(activeRound(club)).toEqual(reading);
    expect(result.ok && activeRound(result.value)).toBeNull();
  });

  it.each(['nominating', 'voting', 'finished'] as const)(
    'recusa a conclusão de uma rodada em %s (R12)',
    (status) => {
      expect(finishReading(aClub({ rounds: [{ ...reading, status }] }), finishedAt)).toEqual({
        ok: false,
        error: 'not-reading',
      });
    },
  );

  it('recusa a conclusão em um clube sem rodadas', () => {
    expect(finishReading(aClub(), finishedAt)).toEqual({ ok: false, error: 'not-reading' });
  });
});

describe('history', () => {
  it('lista só as concluídas, da mais recente para a mais antiga (R13)', () => {
    const older = { ...reading, status: 'finished' as const, finishedAt };
    const newer = { ...older, id: 'r2', number: 2, finishedAt: '2026-04-01T19:00:00.000Z' };
    const current = { ...reading, id: 'r3', number: 3 };
    const club = aClub({ rounds: [older, current, newer] });

    expect(history(club)).toEqual([newer, older]);
    expect(club.rounds).toEqual([older, current, newer]);
  });

  it('lista vazia quando a primeira leitura ainda está em andamento (R13)', () => {
    expect(history(aClub({ rounds: [reading] }))).toEqual([]);
  });
});
