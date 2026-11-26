import type { NominationId, Round, Tally, Winner } from './types';

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

/** As indicações com a maior contagem, na ordem em que chegaram. */
function leaders(ids: readonly NominationId[], tally: Tally): NominationId[] {
  const best = Math.max(...ids.map((id) => count(tally, id)));
  return ids.filter((id) => count(tally, id) === best);
}

/**
 * A regra do clube (R11): vence quem tem mais votos; no empate, quem tem mais votos de
 * 1ª opção; se ainda empatar, `random` (de 0 a 1) sorteia entre os empatados.
 */
export function decide(round: Round, random: () => number): Winner {
  const byVotes = leaders(
    round.nominations.map((nomination) => nomination.id),
    round.results.votes,
  );
  const [mostVoted] = byVotes;
  if (byVotes.length === 1 && mostVoted !== undefined) {
    return { nominationId: mostVoted, method: 'votes' };
  }
  const byFirsts = leaders(byVotes, round.results.firsts);
  const [mostFirsts] = byFirsts;
  if (byFirsts.length === 1 && mostFirsts !== undefined) {
    return { nominationId: mostFirsts, method: 'first-choices' };
  }
  const drawn = byFirsts[Math.min(Math.floor(random() * byFirsts.length), byFirsts.length - 1)];
  if (drawn === undefined) throw new Error('A rodada não tem indicações para apurar.');
  return { nominationId: drawn, method: 'draw' };
}
