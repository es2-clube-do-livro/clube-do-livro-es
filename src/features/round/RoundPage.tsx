import { useClub } from '../../app/club-context';
import { activeRound } from '../../domain/club';
import { NominationStep } from './NominationStep';
import { NoRoundStep } from './NoRoundStep';
import { ReadingStep } from './ReadingStep';
import { VotingStep } from './VotingStep';

/** A aba Rodada mostra a etapa da rodada em andamento, ou o convite para começar uma. */
export function RoundPage() {
  const { state } = useClub();
  const round = activeRound(state);
  if (!round) return <NoRoundStep />;
  if (round.status === 'nominating') return <NominationStep round={round} />;
  if (round.status === 'voting') return <VotingStep round={round} />;
  return <ReadingStep round={round} />;
}
