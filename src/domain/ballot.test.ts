import { describe, expect, it } from 'vitest';

import { aClub, aMember, aNomination, aRound } from '../test/factories';
import { castBallot, eligibleOptions, requiredChoices, validateBallot } from './ballot';

const round = aRound({
  status: 'voting',
  nominations: [
    aNomination({ id: 'livro-ana', memberId: 'ana' }),
    aNomination({ id: 'livro-bia', memberId: 'bia' }),
    aNomination({ id: 'livro-caio', memberId: 'caio' }),
  ],
});

const club = aClub({
  members: [aMember('Ana'), aMember('Bia'), aMember('Caio')],
  rounds: [round],
});

describe('eligibleOptions', () => {
  it('deixa de fora o livro que a pessoa indicou (R8)', () => {
    expect(eligibleOptions(round, 'ana')).toEqual(['livro-bia', 'livro-caio']);
  });

  it('oferece todos os livros a quem não indicou', () => {
    expect(eligibleOptions(round, 'davi')).toEqual(['livro-ana', 'livro-bia', 'livro-caio']);
  });
});

describe('requiredChoices', () => {
  it('pede a 1ª e a 2ª opção quando há livros suficientes', () => {
    expect(requiredChoices(round, 'ana')).toBe(2);
  });

  it('pede uma escolha só quando sobra um livro para a pessoa', () => {
    const twoBooks = aRound({ nominations: round.nominations.slice(0, 2) });

    expect(requiredChoices(twoBooks, 'ana')).toBe(1);
  });
});

describe('validateBallot', () => {
  it('aceita a 1ª e a 2ª opção entre os livros dos outros', () => {
    expect(validateBallot(round, 'ana', ['livro-caio', 'livro-bia'])).toBeNull();
  });

  it('recusa voto no próprio livro (R8)', () => {
    expect(validateBallot(round, 'ana', ['livro-ana', 'livro-bia'])).toBe('own-nomination');
  });

  it('recusa o mesmo livro nas duas opções', () => {
    expect(validateBallot(round, 'ana', ['livro-bia', 'livro-bia'])).toBe('duplicate');
  });

  it('recusa livro que não está na rodada', () => {
    expect(validateBallot(round, 'ana', ['livro-bia', 'outro'])).toBe('not-an-option');
  });

  it('recusa cédula com uma opção só quando cabem duas', () => {
    expect(validateBallot(round, 'ana', ['livro-bia'])).toBe('wrong-count');
  });

  it('recusa quem já votou', () => {
    const voted = { ...round, voters: ['ana'] };

    expect(validateBallot(voted, 'ana', ['livro-bia', 'livro-caio'])).toBe('already-voted');
  });
});

describe('castBallot', () => {
  it('soma um voto em cada escolha e um de 1ª opção na primeira', () => {
    const result = castBallot(club, 'ana', ['livro-caio', 'livro-bia']);

    expect(result.ok && result.value.rounds[0]?.results).toEqual({
      votes: { 'livro-caio': 1, 'livro-bia': 1 },
      firsts: { 'livro-caio': 1 },
    });
  });

  it('anota quem votou e não guarda a escolha (R9)', () => {
    const result = castBallot(club, 'ana', ['livro-caio', 'livro-bia']);

    expect(result.ok && result.value.rounds[0]).toEqual({
      ...round,
      voters: ['ana'],
      results: { votes: { 'livro-caio': 1, 'livro-bia': 1 }, firsts: { 'livro-caio': 1 } },
    });
  });

  it('soma por cima dos votos anteriores', () => {
    const first = castBallot(club, 'ana', ['livro-caio', 'livro-bia']);
    const second = first.ok ? castBallot(first.value, 'bia', ['livro-caio', 'livro-ana']) : first;

    expect(second.ok && second.value.rounds[0]?.results.votes).toEqual({
      'livro-caio': 2,
      'livro-bia': 1,
      'livro-ana': 1,
    });
  });

  it('recusa votar fora da votação', () => {
    const nominating = aClub({ ...club, rounds: [{ ...round, status: 'nominating' }] });

    expect(castBallot(nominating, 'ana', ['livro-bia', 'livro-caio'])).toEqual({
      ok: false,
      error: 'not-voting',
    });
  });

  it('recusa quem não é membro do clube', () => {
    expect(castBallot(club, 'davi', ['livro-bia', 'livro-caio'])).toEqual({
      ok: false,
      error: 'unknown-member',
    });
  });

  it('devolve o erro da cédula', () => {
    expect(castBallot(club, 'ana', ['livro-ana', 'livro-bia'])).toEqual({
      ok: false,
      error: 'own-nomination',
    });
  });
});
