import { describe, expect, it } from 'vitest';

import { aNomination, aRound } from '../test/factories';
import { eligibleOptions, requiredChoices } from './ballot';

const round = aRound({
  status: 'voting',
  nominations: [
    aNomination({ id: 'livro-ana', memberId: 'ana' }),
    aNomination({ id: 'livro-bia', memberId: 'bia' }),
    aNomination({ id: 'livro-caio', memberId: 'caio' }),
  ],
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
