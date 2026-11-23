import { describe, expect, it } from 'vitest';

import { aClub, aRound } from '../test/factories';
import { activeRound, emptyClub, isRoundOpen, replaceRound } from './club';

describe('emptyClub', () => {
  it('começa sem membros e sem rodadas', () => {
    expect(emptyClub()).toEqual({ version: 1, members: [], rounds: [] });
  });
});

describe('activeRound', () => {
  it('devolve a rodada que ainda não terminou', () => {
    const current = aRound({ id: 'r2', number: 2, status: 'voting' });
    const club = aClub({ rounds: [aRound({ status: 'finished' }), current] });

    expect(activeRound(club)).toBe(current);
  });

  it('devolve null quando todas as rodadas terminaram', () => {
    const club = aClub({ rounds: [aRound({ status: 'finished' })] });

    expect(activeRound(club)).toBeNull();
  });
});

describe('isRoundOpen', () => {
  it.each(['nominating', 'voting'] as const)('considera aberta a rodada em %s', (status) => {
    expect(isRoundOpen(aClub({ rounds: [aRound({ status })] }))).toBe(true);
  });

  it('não considera aberta a rodada em leitura', () => {
    expect(isRoundOpen(aClub({ rounds: [aRound({ status: 'reading' })] }))).toBe(false);
  });

  it('não considera aberta quando não há rodada', () => {
    expect(isRoundOpen(emptyClub())).toBe(false);
  });
});

describe('replaceRound', () => {
  it('troca só a rodada com o mesmo id', () => {
    const first = aRound({ id: 'r1', status: 'finished' });
    const second = aRound({ id: 'r2', number: 2 });
    const changed = { ...second, status: 'voting' as const };

    const club = replaceRound(aClub({ rounds: [first, second] }), changed);

    expect(club.rounds).toEqual([first, changed]);
  });
});
