import { activeRound, replaceRound } from './club';
import { err, ok, type Result } from './result';
import { cleanSpaces, normalizeText } from './text';
import type { Book, ClubState, MemberId, NominationId, RoundId } from './types';

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

export const TITLE_MAX_LENGTH = 120;
export const AUTHOR_MAX_LENGTH = 80;

export type BookError = 'title-required' | 'title-too-long' | 'author-required' | 'author-too-long';

/** R4: título de 1 a 120 caracteres e autor de 1 a 80, sem os espaços das pontas. */
export function validateBook(book: Pick<Book, 'title' | 'author'>): BookError | null {
  const title = cleanSpaces(book.title);
  const author = cleanSpaces(book.author);
  if (title.length === 0) return 'title-required';
  if (title.length > TITLE_MAX_LENGTH) return 'title-too-long';
  if (author.length === 0) return 'author-required';
  if (author.length > AUTHOR_MAX_LENGTH) return 'author-too-long';
  return null;
}

/** R6: o mesmo livro, ignorando maiúsculas, acentos, pontuação e espaços extras. */
function sameBook(a: Book, b: Book): boolean {
  return (
    normalizeText(a.title) === normalizeText(b.title) &&
    normalizeText(a.author) === normalizeText(b.author)
  );
}

export type NominationError =
  BookError | 'not-nominating' | 'unknown-member' | 'already-nominated' | 'duplicate-book';

/** R5 e R6: uma indicação por membro e nenhum livro repetido na rodada. */
export function nominate(
  state: ClubState,
  memberId: MemberId,
  book: Book,
  id: NominationId,
): Result<ClubState, NominationError> {
  const round = activeRound(state);
  if (round?.status !== 'nominating') return err('not-nominating');
  if (!state.members.some((member) => member.id === memberId)) return err('unknown-member');
  const problem = validateBook(book);
  if (problem) return err(problem);
  if (round.nominations.some((nomination) => nomination.memberId === memberId)) {
    return err('already-nominated');
  }
  const clean = { ...book, title: cleanSpaces(book.title), author: cleanSpaces(book.author) };
  if (round.nominations.some((nomination) => sameBook(nomination.book, clean))) {
    return err('duplicate-book');
  }
  const nominations = [...round.nominations, { id, memberId, book: clean }];
  return ok(replaceRound(state, { ...round, nominations }));
}

export const MIN_NOMINATIONS = 2;

export type OpenVotingError = 'not-nominating' | 'not-enough-nominations';

/** R7: a votação abre com 2 ou mais indicações, e as indicações fecham. */
export function openVoting(state: ClubState): Result<ClubState, OpenVotingError> {
  const round = activeRound(state);
  if (round?.status !== 'nominating') return err('not-nominating');
  if (round.nominations.length < MIN_NOMINATIONS) return err('not-enough-nominations');
  const zeros = Object.fromEntries(round.nominations.map((nomination) => [nomination.id, 0]));
  return ok(
    replaceRound(state, {
      ...round,
      status: 'voting',
      results: { votes: { ...zeros }, firsts: { ...zeros } },
    }),
  );
}
