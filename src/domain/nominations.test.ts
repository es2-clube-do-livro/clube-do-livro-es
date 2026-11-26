import { describe, expect, it } from 'vitest';

import { aBook, aClub, aMember, aNomination, aRound } from '../test/factories';
import { nominate, openVoting, startRound, validateBook } from './nominations';

const now = '2026-03-01T19:00:00.000Z';
const members = [aMember('Ana'), aMember('Bia'), aMember('Caio')];

describe('startRound', () => {
  it('abre a primeira rodada de indicações', () => {
    const result = startRound(aClub({ members }), 'r1', now);

    expect(result.ok && result.value.rounds).toEqual([
      aRound({ id: 'r1', number: 1, status: 'nominating', startedAt: now }),
    ]);
  });

  it('dá à rodada nova o número seguinte ao da última', () => {
    const club = aClub({ members, rounds: [aRound({ number: 3, status: 'finished' })] });

    const result = startRound(club, 'r4', now);

    expect(result.ok && result.value.rounds[1]?.number).toBe(4);
  });

  it('precisa de pelo menos 2 membros (R3)', () => {
    const club = aClub({ members: [aMember('Ana')] });

    expect(startRound(club, 'r1', now)).toEqual({ ok: false, error: 'not-enough-members' });
  });

  it('não abre com outra rodada em andamento (R3)', () => {
    const club = aClub({ members, rounds: [aRound({ status: 'reading' })] });

    expect(startRound(club, 'r2', now)).toEqual({ ok: false, error: 'round-in-progress' });
  });
});

describe('validateBook', () => {
  it('aceita título e autor', () => {
    expect(validateBook(aBook())).toBeNull();
  });

  it.each([
    [{ title: '   ', author: 'Machado de Assis' }, 'title-required'],
    [{ title: 'A'.repeat(121), author: 'Machado de Assis' }, 'title-too-long'],
    [{ title: 'Dom Casmurro', author: '' }, 'author-required'],
    [{ title: 'Dom Casmurro', author: 'M'.repeat(81) }, 'author-too-long'],
  ])('recusa %o com %s (R4)', (book, error) => {
    expect(validateBook(book)).toBe(error);
  });
});

describe('nominate', () => {
  const club = aClub({ members, rounds: [aRound({ status: 'nominating' })] });

  it('acrescenta a indicação com título e autor sem espaços sobrando', () => {
    const book = aBook({ title: '  Dom   Casmurro ', author: 'Machado de Assis ' });

    const result = nominate(club, 'ana', book, 'n1');

    expect(result.ok && result.value.rounds[0]?.nominations).toEqual([
      { id: 'n1', memberId: 'ana', book: aBook({ title: 'Dom Casmurro' }) },
    ]);
  });

  it('aceita uma indicação só por membro (R5)', () => {
    const first = nominate(club, 'ana', aBook(), 'n1');
    const second = first.ok
      ? nominate(first.value, 'ana', aBook({ title: 'Memorial' }), 'n2')
      : first;

    expect(second).toEqual({ ok: false, error: 'already-nominated' });
  });

  it('recusa o mesmo livro escrito de outro jeito (R6)', () => {
    const withBook = aClub({
      ...club,
      rounds: [aRound({ nominations: [aNomination({ memberId: 'ana', book: aBook() })] })],
    });
    const sameBook = aBook({ title: 'dom casmurro!', author: 'MACHADO DE ASSIS' });

    expect(nominate(withBook, 'bia', sameBook, 'n2')).toEqual({
      ok: false,
      error: 'duplicate-book',
    });
  });

  it('devolve o erro do livro', () => {
    expect(nominate(club, 'ana', aBook({ title: '' }), 'n1')).toEqual({
      ok: false,
      error: 'title-required',
    });
  });

  it('recusa quem não é membro do clube', () => {
    expect(nominate(club, 'davi', aBook(), 'n1')).toEqual({ ok: false, error: 'unknown-member' });
  });

  it('recusa indicação fora da etapa de indicações', () => {
    const voting = aClub({ members, rounds: [aRound({ status: 'voting' })] });

    expect(nominate(voting, 'ana', aBook(), 'n1')).toEqual({ ok: false, error: 'not-nominating' });
  });
});

describe('openVoting', () => {
  const nominations = [
    aNomination({ id: 'n1', memberId: 'ana' }),
    aNomination({ id: 'n2', memberId: 'bia', book: aBook({ title: 'Torto Arado' }) }),
  ];

  it('abre a votação com a contagem zerada (R7)', () => {
    const club = aClub({ members, rounds: [aRound({ nominations })] });

    const result = openVoting(club);

    expect(result.ok && result.value.rounds[0]).toMatchObject({
      status: 'voting',
      results: { votes: { n1: 0, n2: 0 }, firsts: { n1: 0, n2: 0 } },
    });
  });

  it('precisa de pelo menos 2 indicações (R7)', () => {
    const club = aClub({ members, rounds: [aRound({ nominations: nominations.slice(0, 1) })] });

    expect(openVoting(club)).toEqual({ ok: false, error: 'not-enough-nominations' });
  });

  it('não abre o que não está em indicação', () => {
    const club = aClub({ members, rounds: [aRound({ status: 'voting', nominations })] });

    expect(openVoting(club)).toEqual({ ok: false, error: 'not-nominating' });
  });
});
