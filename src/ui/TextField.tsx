import { useId, type ComponentProps } from 'react';

import styles from './TextField.module.css';

type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: string;
  /** Mensagem de erro; o campo fica marcado como inválido e a descreve. */
  error?: string | null;
};

export function TextField({ label, error, ...input }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-erro`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...input}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
