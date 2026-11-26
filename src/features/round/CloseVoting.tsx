import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { closeVoting, type CloseError } from '../../domain/tally';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

const CLOSE_ERRORS: Record<CloseError, string> = {
  'no-ballots': 'Ninguém votou ainda. Encerre depois do primeiro voto.',
  'not-voting': 'A votação já foi encerrada.',
};

/** Encerra a votação (R10) depois de confirmar; o resultado sai na hora (R11). */
export function CloseVoting() {
  const { apply } = useClub();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setConfirming(false);
    const result = apply((club, env) => closeVoting(club, env.now(), env.random));
    if (!result.ok) setError(CLOSE_ERRORS[result.error]);
  }

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
      >
        Encerrar votação
      </Button>
      {error && <p role="alert">{error}</p>}
      {confirming && (
        <ConfirmDialog
          title="Encerrar a votação?"
          message="Depois disso, ninguém mais vota e o resultado sai."
          confirmLabel="Encerrar"
          onConfirm={close}
          onCancel={() => {
            setConfirming(false);
          }}
        />
      )}
    </div>
  );
}
