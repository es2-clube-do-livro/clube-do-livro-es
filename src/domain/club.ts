import type { ClubState, Round } from './types';

export function emptyClub(): ClubState {
  return { version: 1, members: [], rounds: [] };
}

/** A rodada que ainda não terminou (indicação, votação ou leitura). Existe no máximo uma. */
export function activeRound(state: ClubState): Round | null {
  return state.rounds.find((round) => round.status !== 'finished') ?? null;
}

/** Indicação ou votação em andamento: enquanto isso, a lista de membros não muda. */
export function isRoundOpen(state: ClubState): boolean {
  const status = activeRound(state)?.status;
  return status === 'nominating' || status === 'voting';
}

export function replaceRound(state: ClubState, round: Round): ClubState {
  return {
    ...state,
    rounds: state.rounds.map((current) => (current.id === round.id ? round : current)),
  };
}
