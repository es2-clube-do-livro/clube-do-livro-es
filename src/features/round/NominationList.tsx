import { EmptyState } from '../../ui/EmptyState';
import styles from './NominationList.module.css';
import type { StepProps } from './step-props';

/** Os livros indicados na rodada, nunca quem indicou cada um. */
export function NominationList({ round }: StepProps) {
  if (round.nominations.length === 0) {
    return (
      <EmptyState title="Nenhuma indicação ainda">Cada membro pode indicar um livro.</EmptyState>
    );
  }
  return (
    <ul aria-label="Indicações da rodada" className={styles.list}>
      {round.nominations.map(({ id, book }) => (
        <li key={id} className={styles.book}>
          <span className={styles.title}>{book.title}</span>
          <span className={styles.author}>{book.author}</span>
        </li>
      ))}
    </ul>
  );
}
