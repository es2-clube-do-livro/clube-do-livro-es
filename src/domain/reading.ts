import { activeRound, replaceRound } from './club';
import { err, ok, type Result } from './result';
import type { ClubState, Nomination, Round } from './types';

export function winningNomination(round: Round): Nomination | null {
  const id = round.winner?.nominationId;
  return round.nominations.find((nomination) => nomination.id === id) ?? null;
}

/** R12: concluir a leitura preserva a apuração e libera a próxima rodada. */
export function finishReading(state: ClubState, now: string): Result<ClubState, 'not-reading'> {
  const round = activeRound(state);
  if (round?.status !== 'reading') return err('not-reading');
  return ok(replaceRound(state, { ...round, status: 'finished', finishedAt: now }));
}

/** R13: os números crescem a cada rodada e as leituras nunca se sobrepõem. */
export function history(state: ClubState): Round[] {
  return state.rounds
    .filter((round) => round.status === 'finished')
    .sort((a, b) => b.number - a.number);
}
