import { useId, useState } from 'react';

import { useClub } from '../../app/club-context';
import { nominate, setCover, validateBook, type NominationError } from '../../domain/nominations';
import { useCoverFinder } from '../../services/cover-finder';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/TextField';
import styles from './NominationForm.module.css';
import type { StepProps } from './step-props';

const MESSAGES: Record<NominationError, string> = {
  'title-required': 'Escreva o título do livro.',
  'title-too-long': 'Use no máximo 120 caracteres no título.',
  'author-required': 'Escreva o nome do autor.',
  'author-too-long': 'Use no máximo 80 caracteres no autor.',
  'duplicate-book': 'Este livro já foi indicado nesta rodada.',
  'not-nominating': 'As indicações desta rodada já fecharam.',
  'unknown-member': 'Escolha quem está indicando.',
  'already-nominated': 'Esta pessoa já indicou um livro nesta rodada.',
};

/** Em que parte do formulário cada erro aparece. */
const FIELD_OF: Record<NominationError, 'title' | 'author' | 'form'> = {
  'title-required': 'title',
  'title-too-long': 'title',
  'duplicate-book': 'title',
  'author-required': 'author',
  'author-too-long': 'author',
  'not-nominating': 'form',
  'unknown-member': 'form',
  'already-nominated': 'form',
};

export function NominationForm({ round }: StepProps) {
  const { state, apply } = useClub();
  const findCover = useCoverFinder();
  const selectId = useId();
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState<NominationError | null>(null);
  const pending = state.members.filter(
    (member) => !round.nominations.some((nomination) => nomination.memberId === member.id),
  );
  const messageFor = (field: 'title' | 'author' | 'form') =>
    error && FIELD_OF[error] === field ? MESSAGES[error] : null;

  if (pending.length === 0) return <p>Todos os membros já indicaram.</p>;

  /**
   * A indicação entra na hora, sem esperar a capa: assim ela já existe se alguém abrir a votação
   * durante a busca, e o fim da busca não mexe no formulário. A capa é ligada quando chega.
   */
  function submit() {
    const problem = validateBook({ title, author });
    setError(problem);
    if (problem) return;
    let nominationId = '';
    const result = apply((club, env) => {
      nominationId = env.newId();
      return nominate(club, memberId, { title, author, coverUrl: null }, nominationId);
    });
    setError(result.ok ? null : result.error);
    if (!result.ok) return;
    setMemberId('');
    setTitle('');
    setAuthor('');
    void findCover({ title, author }).then((coverUrl) => {
      if (coverUrl) apply((club) => setCover(club, nominationId, coverUrl));
    });
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className={styles.field}>
        <label htmlFor={selectId}>Quem está indicando</label>
        <select
          id={selectId}
          value={memberId}
          onChange={(event) => {
            setMemberId(event.target.value);
          }}
        >
          <option value="">Escolha um membro</option>
          {pending.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <TextField
        label="Título"
        value={title}
        error={messageFor('title')}
        onChange={(event) => {
          setTitle(event.target.value);
        }}
      />
      <TextField
        label="Autor"
        value={author}
        error={messageFor('author')}
        onChange={(event) => {
          setAuthor(event.target.value);
        }}
      />
      {messageFor('form') && <p role="alert">{messageFor('form')}</p>}
      <Button type="submit">Indicar</Button>
    </form>
  );
}
