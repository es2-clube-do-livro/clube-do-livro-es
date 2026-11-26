import { useClub } from '../../app/club-context';
import { finishReading, winningNomination } from '../../domain/reading';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import styles from './ReadingStep.module.css';
import type { StepProps } from './step-props';

export function ReadingStep({ round }: StepProps) {
  const { apply } = useClub();
  const book = winningNomination(round)?.book;

  return (
    <section>
      <h2>Rodada {round.number}: leitura</h2>
      {book ? (
        <>
          <div className={styles.book}>
            {book.coverUrl && (
              <img
                className={styles.cover}
                src={book.coverUrl}
                alt={`Capa de ${book.title}`}
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </div>
          </div>
          <Button onClick={() => apply((club, env) => finishReading(club, env.now()))}>
            Concluir leitura
          </Button>
        </>
      ) : (
        <EmptyState title="Livro vencedor indisponível." />
      )}
    </section>
  );
}
