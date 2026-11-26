import { useClub } from '../../app/club-context';
import { EmptyState } from '../../ui/EmptyState';
import { AddMemberForm } from './AddMemberForm';
import styles from './MembersPage.module.css';

export function MembersPage() {
  const { state } = useClub();

  return (
    <section>
      <h2>Membros</h2>
      <AddMemberForm />
      {state.members.length === 0 ? (
        <EmptyState title="Nenhum membro ainda">Adicione quem participa do clube.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {state.members.map((member) => (
            <li key={member.id} className={styles.member}>
              <span>{member.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
