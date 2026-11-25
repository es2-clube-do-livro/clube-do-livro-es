import type { Round } from '../../domain/types';

/** Cada etapa recebe a rodada em andamento. */
export interface StepProps {
  round: Round;
}
