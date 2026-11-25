import { EmptyState } from '../../ui/EmptyState';
import type { StepProps } from './step-props';

export function VotingStep({ round }: StepProps) {
  return (
    <section>
      <h2>Rodada {round.number}: votação</h2>
      <EmptyState title="Em breve" />
    </section>
  );
}
