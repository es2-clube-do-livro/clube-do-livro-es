import { describe, expect, it } from 'vitest';

import { aClub, aMember, aRound } from '../test/factories';
import { addMember, validateMemberName } from './members';

const members = [aMember('Ana'), aMember('João')];

describe('validateMemberName', () => {
  it('aceita um nome novo', () => {
    expect(validateMemberName('Bia', members)).toBeNull();
  });

  it('recusa nome com menos de 2 letras (R1)', () => {
    expect(validateMemberName(' B ', members)).toBe('name-too-short');
  });

  it('recusa nome com mais de 40 letras (R1)', () => {
    expect(validateMemberName('B'.repeat(41), members)).toBe('name-too-long');
  });

  it('recusa nome repetido mesmo com outra caixa e sem acento (R1)', () => {
    expect(validateMemberName('  joao ', members)).toBe('duplicate-name');
  });
});

describe('addMember', () => {
  it('adiciona o membro com o nome sem espaços sobrando', () => {
    const result = addMember(aClub({ members }), '  Bia   Souza ', 'bia');

    expect(result.ok && result.value.members.at(-1)).toEqual({ id: 'bia', name: 'Bia Souza' });
  });

  it('devolve o erro do nome', () => {
    expect(addMember(aClub({ members }), 'ana', 'outra-ana')).toEqual({
      ok: false,
      error: 'duplicate-name',
    });
  });

  it('não adiciona durante a indicação ou a votação (R2)', () => {
    const club = aClub({ members, rounds: [aRound({ status: 'nominating' })] });

    expect(addMember(club, 'Bia', 'bia')).toEqual({ ok: false, error: 'round-open' });
  });

  it('adiciona durante a leitura', () => {
    const club = aClub({ members, rounds: [aRound({ status: 'reading' })] });

    expect(addMember(club, 'Bia', 'bia').ok).toBe(true);
  });
});
