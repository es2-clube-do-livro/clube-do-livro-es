import { emptyClub } from '../domain/club';
import type { ClubRepository, LoadedClub } from './repository';
import { isClubState } from './validate';

const STORAGE_KEY = 'clube-do-livro-es';

function decode(raw: string): LoadedClub {
  try {
    const value: unknown = JSON.parse(raw);
    if (isClubState(value)) return { status: 'ready', state: value };
  } catch {
    // JSON incompleto recebe o mesmo tratamento que um clube de formato inválido.
  }
  return { status: 'invalid', state: emptyClub() };
}

export function createLocalStorageRepository(storage?: Storage): ClubRepository {
  return {
    load() {
      try {
        const target = storage ?? window.localStorage;
        const raw = target.getItem(STORAGE_KEY);
        if (raw === null) return { status: 'ready', state: emptyClub() };
        const loaded = decode(raw);
        if (loaded.status === 'invalid') target.removeItem(STORAGE_KEY);
        return loaded;
      } catch {
        return { status: 'unavailable', state: emptyClub() };
      }
    },
    save(state) {
      try {
        (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch {
        return false;
      }
    },
  };
}
