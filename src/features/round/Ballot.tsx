import { useState } from 'react';

import { eligibleOptions, requiredChoices } from '../../domain/ballot';
import type { Member, NominationId, Round } from '../../domain/types';
import { Button } from '../../ui/Button';
import styles from './Ballot.module.css';

interface OptionGroupProps {
  legend: string;
  round: Round;
  eligible: readonly NominationId[];
  /** Já escolhido na outra opção: aparece desabilitado. */
  taken: NominationId | null;
  selected: NominationId | null;
  onSelect: (id: NominationId) => void;
}

function OptionGroup({ legend, round, eligible, taken, selected, onSelect }: OptionGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend>{legend}</legend>
      {round.nominations.map(({ id, book }) => {
        const own = !eligible.includes(id);
        return (
          <label key={id} className={styles.option}>
            <input
              type="radio"
              name={legend}
              checked={selected === id}
              disabled={own || id === taken}
              onChange={() => {
                onSelect(id);
              }}
            />
            {book.title}, de {book.author}
            {own && ' (sua indicação)'}
          </label>
        );
      })}
    </fieldset>
  );
}

interface BallotProps {
  round: Round;
  voter: Member;
  /** As escolhas na ordem: a 1ª opção primeiro. */
  onSubmit: (choices: NominationId[]) => void;
  onCancel: () => void;
}

/** A cédula: 1ª e 2ª opção (ou uma só, se sobrar um livro), nunca o próprio livro (R8). */
export function Ballot({ round, voter, onSubmit, onCancel }: BallotProps) {
  const needed = requiredChoices(round, voter.id);
  const eligible = eligibleOptions(round, voter.id);
  const [first, setFirst] = useState<NominationId | null>(null);
  const [second, setSecond] = useState<NominationId | null>(null);
  const choices = [first, second].slice(0, needed).filter((choice) => choice !== null);

  return (
    <form
      className={styles.ballot}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(choices);
      }}
    >
      <h3>Cédula de {voter.name}</h3>
      <OptionGroup
        legend={needed === 1 ? 'Sua opção' : '1ª opção'}
        round={round}
        eligible={eligible}
        taken={null}
        selected={first}
        onSelect={(id) => {
          setFirst(id);
          if (id === second) setSecond(null);
        }}
      />
      {needed === 2 && (
        <OptionGroup
          legend="2ª opção"
          round={round}
          eligible={eligible}
          taken={first}
          selected={second}
          onSelect={setSecond}
        />
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Voltar
        </Button>
        <Button type="submit" disabled={choices.length !== needed}>
          Confirmar voto
        </Button>
      </div>
    </form>
  );
}
