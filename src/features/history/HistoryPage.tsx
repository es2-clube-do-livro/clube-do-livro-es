import { useClub } from '../../app/club-context';
import { history, winningNomination } from '../../domain/reading';
import { EmptyState } from '../../ui/EmptyState';
import { ResultChart } from '../round/ResultChart';
import styles from './HistoryPage.module.css';

export function HistoryPage() {
  const { state } = useClub();
  const rounds = history(state);
  return (
    <section>
      <h2>Histórico</h2>
      {rounds.length === 0 ? (
        <EmptyState title="Nenhuma leitura concluída ainda." />
      ) : (
        <ol className={styles.rounds} aria-label="Leituras concluídas">
          {rounds.map((round) => {
            const book = winningNomination(round)?.book;
            return (
              <li key={round.id} className={styles.round}>
                <h3>Rodada {round.number}</h3>
                {book ? (
                  <dl>
                    <dt>Livro vencedor</dt>
                    <dd>
                      <strong>{book.title}</strong> — {book.author}
                    </dd>
                  </dl>
                ) : (
                  <p>Livro vencedor indisponível.</p>
                )}
                <ResultChart round={round} />
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
