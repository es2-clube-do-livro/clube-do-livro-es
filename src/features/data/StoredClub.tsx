import { useState, type ReactNode } from 'react';

import { ClubProvider } from '../../app/ClubProvider';
import type { ClubState } from '../../domain/types';
import type { ClubRepository, LoadedClub } from '../../storage/repository';

interface StoredClubProps {
  repository: ClubRepository;
  initial: LoadedClub;
  children: ReactNode;
}

export function StoredClub({ repository, initial, children }: StoredClubProps) {
  const [status, setStatus] = useState(initial.status);

  function save(state: ClubState) {
    setStatus(repository.save(state) ? 'ready' : 'unavailable');
  }

  return (
    <ClubProvider initialState={initial.state} onChange={save}>
      {status === 'invalid' && (
        <p role="alert">Os dados salvos eram inválidos. O clube recomeçou vazio.</p>
      )}
      {status === 'unavailable' && (
        <p role="alert">
          O armazenamento do navegador está indisponível. As mudanças desta sessão podem ser
          perdidas.
        </p>
      )}
      {children}
    </ClubProvider>
  );
}
