import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { finishReading, winningNomination } from '../../domain/reading';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { EmptyState } from '../../ui/EmptyState';
import styles from './ReadingStep.module.css';
import { ResultChart } from './ResultChart';
import type { StepProps } from './step-props';

/** A leitura da rodada: o livro vencedor, o resultado e o botão de concluir (R12). */
export function ReadingStep({ round }: StepProps) {
  const { apply } = useClub();
  const [confirming, setConfirming] = useState(false);
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
          <ResultChart round={round} />
          <Button
            onClick={() => {
              setConfirming(true);
            }}
          >
            Concluir leitura
          </Button>
        </>
      ) : (
        <EmptyState title="Livro vencedor indisponível." />
      )}
      {confirming && (
        <ConfirmDialog
          title="Concluir a leitura?"
          message="A rodada vai para o histórico, e o clube pode começar outra."
          confirmLabel="Concluir"
          onConfirm={() => {
            setConfirming(false);
            apply((club, env) => finishReading(club, env.now()));
          }}
          onCancel={() => {
            setConfirming(false);
          }}
        />
      )}
    </section>
  );
}
