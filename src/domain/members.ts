import { cleanSpaces, normalizeText } from './text';
import type { Member } from './types';

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
