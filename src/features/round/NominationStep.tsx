import { NominationForm } from './NominationForm';
import type { StepProps } from './step-props';

export function NominationStep({ round }: StepProps) {
  return (
    <section>
      <h2>Rodada {round.number}: indicações</h2>
      <NominationForm round={round} />
    </section>
  );
}
