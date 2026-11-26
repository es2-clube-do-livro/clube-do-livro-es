import { useRef, useState } from 'react';

import { useClub } from '../../app/club-context';
import { emptyClub } from '../../domain/club';
import { setCover } from '../../domain/nominations';
import { ok } from '../../domain/result';
import type { ClubState } from '../../domain/types';
import { useCoverFinder } from '../../services/cover-finder';
import { sampleClub } from '../../storage/sample';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

export function DataControls() {
  const { state, apply } = useClub();
  const findCover = useCoverFinder();
  const [confirming, setConfirming] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const empty = state.members.length === 0 && state.rounds.length === 0;

  function closeDialog() {
    setConfirming(false);
    trigger.current?.focus();
  }

  /** Como numa indicação, a capa de cada livro do exemplo chega depois, quando a busca termina. */
  function searchCovers(club: ClubState) {
    for (const { id, book } of club.rounds.flatMap((round) => round.nominations)) {
      void findCover(book).then((coverUrl) => {
        if (coverUrl) apply((current) => setCover(current, id, coverUrl));
      });
    }
  }

  function loadSample() {
    const result = apply((_club, env) => ok(sampleClub(env)));
    if (result.ok) searchCovers(result.value);
  }

  function erase() {
    apply(() => ok(emptyClub()));
    closeDialog();
  }

  return (
    <section aria-label="Dados do clube">
      {empty ? (
        <Button ref={trigger} variant="secondary" onClick={loadSample}>
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
