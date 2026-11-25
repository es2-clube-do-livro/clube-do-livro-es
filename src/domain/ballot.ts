import type { MemberId, NominationId, Round } from './types';

/** Cada pessoa escolhe uma 1ª e uma 2ª opção. */
export const CHOICES_PER_BALLOT = 2;

/** As indicações em que a pessoa pode votar: todas, menos a que ela mesma fez. */
export function eligibleOptions(round: Round, voter: MemberId): NominationId[] {
  return round.nominations
    .filter((nomination) => nomination.memberId !== voter)
    .map((nomination) => nomination.id);
}

/** Quantas escolhas a cédula precisa ter: 2, ou 1 quando só sobra uma opção para a pessoa. */
export function requiredChoices(round: Round, voter: MemberId): number {
  return Math.min(CHOICES_PER_BALLOT, eligibleOptions(round, voter).length);
}

export type BallotError =
  'already-voted' | 'duplicate' | 'not-an-option' | 'own-nomination' | 'wrong-count';

/** Confere a cédula (R8): escolhas na ordem de preferência, a 1ª opção primeiro. */
export function validateBallot(
  round: Round,
  voter: MemberId,
  choices: readonly NominationId[],
): BallotError | null {
  const options = round.nominations.map((nomination) => nomination.id);
  if (round.voters.includes(voter)) return 'already-voted';
  if (new Set(choices).size !== choices.length) return 'duplicate';
  if (choices.some((choice) => !options.includes(choice))) return 'not-an-option';
  if (choices.some((choice) => !eligibleOptions(round, voter).includes(choice))) {
    return 'own-nomination';
  }
  if (choices.length !== requiredChoices(round, voter)) return 'wrong-count';
  return null;
}
