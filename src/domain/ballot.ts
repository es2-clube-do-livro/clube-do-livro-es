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
