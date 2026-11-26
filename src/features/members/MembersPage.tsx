import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { isRoundOpen } from '../../domain/club';
import { removeMember } from '../../domain/members';
import type { Member } from '../../domain/types';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { EmptyState } from '../../ui/EmptyState';
import { AddMemberForm } from './AddMemberForm';
import styles from './MembersPage.module.css';

export function MembersPage() {
  const { state, apply } = useClub();
  const [removing, setRemoving] = useState<Member | null>(null);
  const locked = isRoundOpen(state);

  return (
    <section>
      <h2>Membros</h2>
      {locked && <p role="status">Durante a indicação e a votação, a lista de membros não muda.</p>}
      <AddMemberForm disabled={locked} />
      {state.members.length === 0 ? (
        <EmptyState title="Nenhum membro ainda">Adicione quem participa do clube.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {state.members.map((member) => (
            <li key={member.id} className={styles.member}>
              <span>{member.name}</span>
              <Button
                variant="secondary"
                disabled={locked}
                aria-label={`Remover ${member.name}`}
                onClick={() => {
                  setRemoving(member);
                }}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}
      {removing && (
        <ConfirmDialog
          title={`Remover ${removing.name}?`}
          message="A pessoa sai da lista de membros do clube."
          confirmLabel="Remover"
          onConfirm={() => {
            apply((club) => removeMember(club, removing.id));
            setRemoving(null);
          }}
          onCancel={() => {
            setRemoving(null);
          }}
        />
      )}
    </section>
  );
}
