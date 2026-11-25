import type { ReactNode } from 'react';

import styles from './EmptyState.module.css';

/** O aviso de uma lista ou aba sem conteúdo, com o próximo passo. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {children}
    </div>
  );
}
