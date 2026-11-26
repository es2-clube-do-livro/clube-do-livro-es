import { useState } from 'react';

import { useClub } from '../../app/club-context';
import { addMember, type AddMemberError } from '../../domain/members';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/TextField';
import styles from './MembersPage.module.css';

const MESSAGES: Record<AddMemberError, string> = {
  'name-too-short': 'Use pelo menos 2 letras.',
  'name-too-long': 'Use no máximo 40 letras.',
  'duplicate-name': 'Já existe um membro com esse nome.',
  'round-open': 'Durante a indicação e a votação, a lista de membros não muda.',
};

export function AddMemberForm() {
  const { apply } = useClub();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const result = apply((club, env) => addMember(club, name, env.newId()));
        setError(result.ok ? null : MESSAGES[result.error]);
        if (result.ok) setName('');
      }}
    >
      <TextField
        label="Nome"
        value={name}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}
