import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { castBallot, type CastError } from '../../domain/ballot';
import type { Member, NominationId } from '../../domain/types';
import { Button } from '../../ui/Button';
import { Ballot } from './Ballot';
import type { StepProps } from './step-props';
import styles from './VotingStep.module.css';

const CAST_ERRORS: Record<CastError, string> = {
  'already-voted': 'Esta pessoa já votou.',
  duplicate: 'Escolha livros diferentes na 1ª e na 2ª opção.',
  'not-an-option': 'Escolha só livros desta rodada.',
  'own-nomination': 'Não dá para votar no próprio livro.',
  'wrong-count': 'Marque todas as opções da cédula.',
  'not-voting': 'A votação já foi encerrada.',
  'unknown-member': 'Esta pessoa não está mais no clube.',
};

/** A votação num aparelho só: cada pessoa escolhe o próprio nome, vota e passa adiante. */
export function VotingStep({ round }: StepProps) {
  const { state, apply } = useClub();
  const [voter, setVoter] = useState<Member | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pending = state.members.filter((member) => !round.voters.includes(member.id));

  function vote(member: Member, choices: NominationId[]) {
    const result = apply((club) => castBallot(club, member.id, choices));
    setVoter(null);
    // Depois do voto, a tela não repete as escolhas: o aparelho vai para a próxima pessoa (R9).
    setNotice(
      result.ok
        ? 'Voto registrado. Passe o aparelho para a próxima pessoa.'
        : CAST_ERRORS[result.error],
    );
  }

  return (
    <section>
      <h2>Rodada {round.number}: votação</h2>
      {voter ? (
        <Ballot
          round={round}
          voter={voter}
          onSubmit={(choices) => {
            vote(voter, choices);
          }}
          onCancel={() => {
            setVoter(null);
          }}
        />
      ) : (
        <>
          {notice && <p role="status">{notice}</p>}
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
                    setNotice(null);
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
