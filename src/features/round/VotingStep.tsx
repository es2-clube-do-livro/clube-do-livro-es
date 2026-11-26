import { useState } from 'react';

import { useClub } from '../../app/club-context';
import type { Member } from '../../domain/types';
import { Button } from '../../ui/Button';
import type { StepProps } from './step-props';
import styles from './VotingStep.module.css';

/** A votação num aparelho só: cada pessoa escolhe o próprio nome, vota e passa adiante. */
export function VotingStep({ round }: StepProps) {
  const { state } = useClub();
  const [voter, setVoter] = useState<Member | null>(null);
  const pending = state.members.filter((member) => !round.voters.includes(member.id));

  return (
    <section>
      <h2>Rodada {round.number}: votação</h2>
      {voter ? (
        <div>
          <h3>Cédula de {voter.name}</h3>
          <Button
            variant="secondary"
            onClick={() => {
              setVoter(null);
            }}
          >
            Voltar
          </Button>
        </div>
      ) : (
        <>
          <p>
            {round.voters.length} de {state.members.length} já votaram.
          </p>
          <h3>Quem vai votar agora?</h3>
          <ul className={styles.voters}>
            {pending.map((member) => (
              <li key={member.id}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setVoter(member);
                  }}
                >
                  Votar como {member.name}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
