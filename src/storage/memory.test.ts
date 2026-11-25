import { expect, it } from 'vitest';

import { aClub, aMember } from '../test/factories';
import { createMemoryRepository } from './memory';

it('R14: começa com um clube vazio', () => {
  expect(createMemoryRepository().load()).toEqual({ status: 'ready', state: aClub() });
});

it('R14: conserva os dados salvos até a próxima gravação', () => {
  const repository = createMemoryRepository();
  const ana = aMember();
  expect(repository.save(aClub({ members: [ana] }))).toBe(true);

  ana.name = 'Outro nome';
  expect(repository.load().state.members).toEqual([aMember()]);
  repository.save(aClub());
  expect(repository.load().state).toEqual(aClub());
});

it('R14: cada repositório tem seu próprio clube', () => {
  const first = createMemoryRepository();
  first.save(aClub({ members: [aMember()] }));

  expect(createMemoryRepository().load().state.members).toEqual([]);
});
