import { describe, expect, it } from 'vitest';

import { aMember } from '../test/factories';
import { validateMemberName } from './members';

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
