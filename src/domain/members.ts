import { isRoundOpen } from './club';
import { err, ok, type Result } from './result';
import { cleanSpaces, normalizeText } from './text';
import type { ClubState, Member, MemberId } from './types';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 40;

export type MemberNameError = 'name-too-short' | 'name-too-long' | 'duplicate-name';

/** R1: de 2 a 40 caracteres, sem repetir outro nome (ignorando maiúsculas e acentos). */
export function validateMemberName(
  name: string,
  members: readonly Member[],
): MemberNameError | null {
  const clean = cleanSpaces(name);
  if (clean.length < NAME_MIN_LENGTH) return 'name-too-short';
  if (clean.length > NAME_MAX_LENGTH) return 'name-too-long';
  const key = normalizeText(clean);
  if (members.some((member) => normalizeText(member.name) === key)) return 'duplicate-name';
  return null;
}

export type AddMemberError = MemberNameError | 'round-open';

/** Adiciona o membro com o nome já limpo. R2: não durante a indicação ou a votação. */
export function addMember(
  state: ClubState,
  name: string,
  id: MemberId,
): Result<ClubState, AddMemberError> {
  if (isRoundOpen(state)) return err('round-open');
  const problem = validateMemberName(name, state.members);
  if (problem) return err(problem);
  return ok({ ...state, members: [...state.members, { id, name: cleanSpaces(name) }] });
}

export type RemoveMemberError = 'round-open' | 'not-found';

/** R2: a lista de membros não muda durante a indicação ou a votação. */
export function removeMember(state: ClubState, id: MemberId): Result<ClubState, RemoveMemberError> {
  if (isRoundOpen(state)) return err('round-open');
  if (!state.members.some((member) => member.id === id)) return err('not-found');
  return ok({ ...state, members: state.members.filter((member) => member.id !== id) });
}
