import { beforeEach, expect, it, vi } from 'vitest';

import { aClub, aMember, aNomination, aRound } from '../test/factories';
import { createLocalStorageRepository } from './local-storage';

const key = 'clube-do-livro-es';

beforeEach(() => {
  localStorage.clear();
});

it('R14: abre um clube vazio quando não há dados salvos', () => {
  expect(createLocalStorageRepository().load()).toEqual({ state: aClub(), status: 'ready' });
});

it('R14: outra instância recupera o clube salvo com seus votos agregados', () => {
  const state = aClub({
    members: [aMember()],
    rounds: [
      aRound({
        status: 'reading',
        nominations: [aNomination()],
        voters: ['ana'],
        results: { votes: { n1: 1 }, firsts: { n1: 1 } },
        winner: { nominationId: 'n1', method: 'votes' },
        closedAt: '2026-03-09T19:00:00Z',
      }),
    ],
  });
  expect(createLocalStorageRepository(localStorage).save(state)).toBe(true);

  expect(createLocalStorageRepository().load()).toEqual({ state, status: 'ready' });
});

it.each(['', '{', 'null', '{"version":2,"members":[],"rounds":[]}', '{"version":1}'])(
  'R14: descarta dados inválidos (%j) preservando as outras chaves do navegador',
  (raw) => {
    localStorage.setItem(key, raw);
    localStorage.setItem('preferencia', 'azul');
    const repository = createLocalStorageRepository();

    expect(repository.load()).toEqual({ state: aClub(), status: 'invalid' });
    expect(localStorage.getItem(key)).toBeNull();
    expect(localStorage.getItem('preferencia')).toBe('azul');
  },
);

it('R14: informa quando o navegador impede a leitura', () => {
  const denied = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('bloqueado');
  });
  try {
    expect(createLocalStorageRepository().load()).toEqual({
      state: aClub(),
      status: 'unavailable',
    });
  } finally {
    denied.mockRestore();
  }
});

it('R14: informa falha ao salvar e preserva o último clube gravado', () => {
  const repository = createLocalStorageRepository();
  repository.save(aClub({ members: [aMember()] }));
  const full = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  try {
    expect(repository.save(aClub())).toBe(false);
    expect(repository.load().state.members).toEqual([aMember()]);
  } finally {
    full.mockRestore();
  }
});
