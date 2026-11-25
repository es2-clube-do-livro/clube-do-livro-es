import { emptyClub } from '../domain/club';
import type { ClubRepository } from './repository';

export function createMemoryRepository(): ClubRepository {
  let saved = emptyClub();
  return {
    load: () => ({ status: 'ready', state: structuredClone(saved) }),
    save(state) {
      saved = structuredClone(state);
      return true;
    },
  };
}
