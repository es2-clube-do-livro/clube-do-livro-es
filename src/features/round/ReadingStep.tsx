import { EmptyState } from '../../ui/EmptyState';
import type { StepProps } from './step-props';

export function ReadingStep({ round }: StepProps) {
  return (
    <section>
      <h2>Rodada {round.number}: leitura</h2>
      <EmptyState title="Em breve" />
    </section>
  );
}
