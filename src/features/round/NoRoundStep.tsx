import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { startRound, type StartRoundError } from '../../domain/nominations';
import { Button } from '../../ui/Button';

const MESSAGES: Record<StartRoundError, string> = {
  'not-enough-members': 'Cadastre pelo menos 2 membros na aba Membros antes de começar.',
  'round-in-progress': 'Já existe uma rodada em andamento.',
};

export function NoRoundStep() {
  const { state, apply } = useClub();
  const [error, setError] = useState<string | null>(null);
  const first = state.rounds.length === 0;

  return (
    <section>
      <h2>Nenhuma rodada em andamento</h2>
      <p>
        {first
          ? 'Com os membros cadastrados, comece a primeira rodada de indicações.'
          : 'Quando o clube estiver pronto, comece a próxima rodada de indicações.'}
      </p>
      <Button
        onClick={() => {
          const result = apply((club, env) => startRound(club, env.newId(), env.now()));
          setError(result.ok ? null : MESSAGES[result.error]);
        }}
      >
        Iniciar rodada
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
