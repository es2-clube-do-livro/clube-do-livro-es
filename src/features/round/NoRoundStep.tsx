import { EmptyState } from '../../ui/EmptyState';

export function NoRoundStep() {
  return (
    <section>
      <h2>Nenhuma rodada em andamento</h2>
      <EmptyState title="Em breve" />
    </section>
  );
}
