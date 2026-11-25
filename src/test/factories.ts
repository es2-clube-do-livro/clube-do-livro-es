import type { Book, ClubState, Member, Nomination, Round } from '../domain/types';

/** Dados de teste com valores padrão; cada teste muda só o que importa para ele. */

export function aMember(name = 'Ana', overrides: Partial<Member> = {}): Member {
  return { id: name.toLowerCase(), name, ...overrides };
}

export function aBook(overrides: Partial<Book> = {}): Book {
  return { title: 'Dom Casmurro', author: 'Machado de Assis', coverUrl: null, ...overrides };
}

export function aNomination(overrides: Partial<Nomination> = {}): Nomination {
  return { id: 'n1', memberId: 'ana', book: aBook(), ...overrides };
}

export function aRound(overrides: Partial<Round> = {}): Round {
  return {
    id: 'r1',
    number: 1,
    status: 'nominating',
    nominations: [],
    voters: [],
    results: { votes: {}, firsts: {} },
    winner: null,
    startedAt: '2026-03-01T19:00:00.000Z',
    closedAt: null,
    finishedAt: null,
    ...overrides,
  };
}

export function aClub(overrides: Partial<ClubState> = {}): ClubState {
  return { version: 1, members: [], rounds: [], ...overrides };
}
