import { describe, expect, it } from 'vitest';

import { aClub, aMember, aRound } from '../test/factories';
import { startRound } from './nominations';

const now = '2026-03-01T19:00:00.000Z';
const members = [aMember('Ana'), aMember('Bia'), aMember('Caio')];

describe('startRound', () => {
  it('abre a primeira rodada de indicações', () => {
    const result = startRound(aClub({ members }), 'r1', now);

    expect(result.ok && result.value.rounds).toEqual([
      aRound({ id: 'r1', number: 1, status: 'nominating', startedAt: now }),
    ]);
  });

  it('dá à rodada nova o número seguinte ao da última', () => {
    const club = aClub({ members, rounds: [aRound({ number: 3, status: 'finished' })] });

    const result = startRound(club, 'r4', now);

    expect(result.ok && result.value.rounds[1]?.number).toBe(4);
  });

  it('precisa de pelo menos 2 membros (R3)', () => {
    const club = aClub({ members: [aMember('Ana')] });

    expect(startRound(club, 'r1', now)).toEqual({ ok: false, error: 'not-enough-members' });
  });

  it('não abre com outra rodada em andamento (R3)', () => {
    const club = aClub({ members, rounds: [aRound({ status: 'reading' })] });

    expect(startRound(club, 'r2', now)).toEqual({ ok: false, error: 'round-in-progress' });
  });
});
