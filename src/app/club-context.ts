import { createContext, useContext } from 'react';

import type { Result } from '../domain/result';
import type { ClubState } from '../domain/types';

/** O que as regras não geram sozinhas: ids, a hora e o número do sorteio. */
export interface ClubEnvironment {
  newId: () => string;
  now: () => string;
  random: () => number;
}

/** Uma mudança no clube: uma função do domínio aplicada ao estado atual. */
export type ClubChange<E extends string> = (
  state: ClubState,
  env: ClubEnvironment,
) => Result<ClubState, E>;

export interface ClubContextValue {
  state: ClubState;
  /** Aplica a mudança; se der certo, guarda o novo estado. Devolve o resultado nos dois casos. */
  apply: <E extends string>(change: ClubChange<E>) => Result<ClubState, E>;
}

export const ClubContext = createContext<ClubContextValue | null>(null);

export function useClub(): ClubContextValue {
  const value = useContext(ClubContext);
  if (!value) throw new Error('useClub precisa estar dentro de um ClubProvider.');
  return value;
}
