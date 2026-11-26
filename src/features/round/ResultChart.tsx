import { standings } from '../../domain/tally';
import type { DecisionMethod, Round } from '../../domain/types';
import styles from './ResultChart.module.css';

const decision: Record<DecisionMethod, string> = {
  votes: 'Venceu pelo total de votos.',
  'first-choices': 'Desempate pelos votos de 1ª opção.',
  draw: 'Desempate por sorteio entre os livros empatados.',
};

const percentage = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export function ResultChart({ round }: { round: Round }) {
  if (!round.winner) return null;
  const labels = new Map(
    round.nominations.map(({ id, book }) => [id, `${book.title} — ${book.author}`]),
  );

  return (
    <figure className={styles.chart}>
      <figcaption>Resultado da votação</figcaption>
      <p>{decision[round.winner.method]}</p>
      <ol className={styles.rows}>
        {standings(round).map(({ nominationId, votes, share }) => {
          const label = labels.get(nominationId);
          const percent = percentage.format(share);
          return (
            <li key={nominationId}>
              <div className={styles.summary}>
                <span>{label}</span>
                <span className={styles.count}>
                  {votes} {votes === 1 ? 'voto' : 'votos'} ({percent})
                </span>
              </div>
              <meter min={0} max={1} value={share} aria-label={label} aria-valuetext={percent} />
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
