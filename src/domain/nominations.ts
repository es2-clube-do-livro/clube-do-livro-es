import { activeRound } from './club';
import { err, ok, type Result } from './result';
import { cleanSpaces } from './text';
import type { Book, ClubState, RoundId } from './types';

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
