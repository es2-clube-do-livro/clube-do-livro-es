import { activeRound, replaceRound } from './club';
import { err, ok, type Result } from './result';
import type { ClubState, DecisionMethod, NominationId, Round, Tally, Winner } from './types';

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

/** Os critérios de desempate, na ordem da regra (R11): cada um fica só com os líderes. */
const CRITERIA: readonly { method: DecisionMethod; tally: (round: Round) => Tally }[] = [
  { method: 'votes', tally: (round) => round.results.votes },
  { method: 'first-choices', tally: (round) => round.results.firsts },
];

/** O sorteio entre os que continuam empatados; `random` vai de 0 a 1. */
function drawAmong(tied: readonly NominationId[], random: () => number): NominationId {
  const drawn = tied[Math.min(Math.floor(random() * tied.length), tied.length - 1)];
  if (drawn === undefined) throw new Error('A rodada não tem indicações para apurar.');
  return drawn;
}

/**
 * A regra do clube (R11): vence quem tem mais votos; no empate, quem tem mais votos de
 * 1ª opção; se ainda empatar, `random` (de 0 a 1) sorteia entre os empatados.
 */
export function decide(round: Round, random: () => number): Winner {
  let tied = round.nominations.map((nomination) => nomination.id);
  for (const { method, tally } of CRITERIA) {
    tied = leaders(tied, tally(round));
    const [only] = tied;
    if (tied.length === 1 && only !== undefined) return { nominationId: only, method };
  }
  return { nominationId: drawAmong(tied, random), method: 'draw' };
}

export type CloseError = 'not-voting' | 'no-ballots';

/** Encerra a votação (R10): apura o vencedor, que vira a leitura da rodada. */
export function closeVoting(
  state: ClubState,
  now: string,
  random: () => number,
): Result<ClubState, CloseError> {
  const round = activeRound(state);
  if (round?.status !== 'voting') return err('not-voting');
  if (round.voters.length === 0) return err('no-ballots');
  return ok(
    replaceRound(state, {
      ...round,
      status: 'reading',
      winner: decide(round, random),
      closedAt: now,
    }),
  );
}
