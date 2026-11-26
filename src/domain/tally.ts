import type { NominationId, Round, Tally } from './types';

export interface Standing {
  nominationId: NominationId;
  votes: number;
  firsts: number;
  /** Parte de todos os votos da rodada, de 0 a 1. */
  share: number;
}

function count(tally: Tally, nomination: NominationId): number {
  return tally[nomination] ?? 0;
}

/** O resultado de cada indicação, do mais votado ao menos votado (empate: mais 1ª opção). */
export function standings(round: Round): Standing[] {
  const ids = round.nominations.map((nomination) => nomination.id);
  const total = ids.reduce((sum, id) => sum + count(round.results.votes, id), 0);
  return ids
    .map((nominationId) => {
      const votes = count(round.results.votes, nominationId);
      const firsts = count(round.results.firsts, nominationId);
      return { nominationId, votes, firsts, share: total === 0 ? 0 : votes / total };
    })
    .sort((a, b) => b.votes - a.votes || b.firsts - a.firsts);
}
