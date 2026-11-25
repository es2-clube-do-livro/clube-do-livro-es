import { describe, expect, it } from 'vitest';

import { cleanSpaces, normalizeText } from './text';

describe('cleanSpaces', () => {
  it('tira os espaços das pontas e junta os repetidos', () => {
    expect(cleanSpaces('  Grande   sertão:  veredas ')).toBe('Grande sertão: veredas');
  });
});

describe('normalizeText', () => {
  it('ignora acentos e maiúsculas', () => {
    expect(normalizeText('Memórias Póstumas')).toBe(normalizeText('memorias postumas'));
  });

  it('ignora pontuação e espaços extras', () => {
    expect(normalizeText('  Dom  Casmurro!')).toBe('dom casmurro');
  });

  it('mantém os números', () => {
    expect(normalizeText('1984')).toBe('1984');
  });
});
