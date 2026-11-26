import { activeRound } from './club';
import { err, ok, type Result } from './result';
import type { ClubState, RoundId } from './types';

export const MIN_MEMBERS = 2;

export type StartRoundError = 'not-enough-members' | 'round-in-progress';

/** R3: rodada nova com 2 ou mais membros e nenhuma outra em andamento; recebe o próximo número. */
export function startRound(
  state: ClubState,
  id: RoundId,
  now: string,
): Result<ClubState, StartRoundError> {
  if (activeRound(state)) return err('round-in-progress');
  if (state.members.length < MIN_MEMBERS) return err('not-enough-members');
  const number = state.rounds.reduce((last, round) => Math.max(last, round.number), 0) + 1;
  return ok({
    ...state,
    rounds: [
      ...state.rounds,
      {
        id,
        number,
        status: 'nominating',
        nominations: [],
        voters: [],
        results: { votes: {}, firsts: {} },
        winner: null,
        startedAt: now,
        closedAt: null,
        finishedAt: null,
      },
    ],
  });
}
