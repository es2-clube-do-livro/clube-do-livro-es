import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { openVoting, type OpenVotingError } from '../../domain/nominations';
import { Button } from '../../ui/Button';
import { NominationForm } from './NominationForm';
import { NominationList } from './NominationList';
import type { StepProps } from './step-props';

const MESSAGES: Record<OpenVotingError, string> = {
  'not-enough-nominations': 'A votação precisa de pelo menos 2 livros indicados.',
  'not-nominating': 'A votação já foi aberta.',
};

export function NominationStep({ round }: StepProps) {
  const { apply } = useClub();
  const [error, setError] = useState<string | null>(null);

  return (
    <section>
      <h2>Rodada {round.number}: indicações</h2>
      <NominationForm round={round} />
      <NominationList round={round} />
      <Button
        onClick={() => {
          const result = apply((club) => openVoting(club));
          setError(result.ok ? null : MESSAGES[result.error]);
        }}
      >
        Abrir votação
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
