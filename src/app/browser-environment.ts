import type { ClubEnvironment } from './club-context';

/** Ids, hora e sorteio de verdade, do navegador. Os testes usam valores fixos no lugar. */
export const browserEnvironment: ClubEnvironment = {
  newId: () => crypto.randomUUID(),
  now: () => new Date().toISOString(),
  random: () => Math.random(),
};
