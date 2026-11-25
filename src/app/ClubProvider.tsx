import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { emptyClub } from '../domain/club';
import type { ClubState } from '../domain/types';
import { browserEnvironment } from './browser-environment';
import { ClubContext, type ClubChange, type ClubEnvironment } from './club-context';

interface ClubProviderProps {
  /** O clube salvo; sem ele, o clube começa vazio. */
  initialState?: ClubState;
  /** Chamado depois de cada mudança que deu certo (para salvar). */
  onChange?: (state: ClubState) => void;
  /** Nos testes: ids, hora e sorteio previsíveis. */
  environment?: Partial<ClubEnvironment>;
  children: ReactNode;
}

export function ClubProvider({ initialState, onChange, environment, children }: ClubProviderProps) {
  const [state, setState] = useState(() => initialState ?? emptyClub());
  // Duas mudanças seguidas no mesmo clique precisam ver o estado mais novo, não o da tela.
  const latest = useRef(state);
  const env = useMemo(() => ({ ...browserEnvironment, ...environment }), [environment]);

  const apply = useCallback(
    <E extends string>(change: ClubChange<E>) => {
      const result = change(latest.current, env);
      if (result.ok) {
        latest.current = result.value;
        setState(result.value);
        onChange?.(result.value);
      }
      return result;
    },
    [env, onChange],
  );

  const value = useMemo(() => ({ state, apply }), [state, apply]);
  return <ClubContext value={value}>{children}</ClubContext>;
}
