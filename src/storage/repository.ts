import type { ClubState } from '../domain/types';

export interface LoadedClub {
  state: ClubState;
  status: 'ready' | 'invalid' | 'unavailable';
}

export interface ClubRepository {
  load(): LoadedClub;
  /** Devolve false quando o navegador não consegue gravar a mudança. */
  save(state: ClubState): boolean;
}
