import { useRef, useState } from 'react';

import { useClub } from '../../app/club-context';
import { emptyClub } from '../../domain/club';
import { ok } from '../../domain/result';
import { sampleClub } from '../../storage/sample';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

export function DataControls() {
  const { state, apply } = useClub();
  const [confirming, setConfirming] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const empty = state.members.length === 0 && state.rounds.length === 0;

  function closeDialog() {
    setConfirming(false);
    trigger.current?.focus();
  }

  function erase() {
    apply(() => ok(emptyClub()));
    closeDialog();
  }

  return (
    <section aria-label="Dados do clube">
      {empty ? (
        <Button
          ref={trigger}
          variant="secondary"
          onClick={() => apply((_club, env) => ok(sampleClub(env)))}
        >
          Carregar exemplo
        </Button>
      ) : (
        <Button
          ref={trigger}
          variant="secondary"
          onClick={() => {
            setConfirming(true);
          }}
        >
          Apagar todos os dados
        </Button>
      )}
      {confirming && (
        <ConfirmDialog
          title="Apagar todos os dados?"
          message="Os membros e as rodadas serão apagados deste navegador."
          confirmLabel="Apagar"
          onCancel={closeDialog}
          onConfirm={erase}
        />
      )}
    </section>
  );
}
