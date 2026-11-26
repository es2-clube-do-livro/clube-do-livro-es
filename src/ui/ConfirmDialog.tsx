import { useEffect, useId, useRef } from 'react';

import { Button } from './Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Tab e Shift+Tab circulam só entre os botões do diálogo, sem alcançar a página atrás dele. */
function keepTabInside(event: KeyboardEvent, dialog: HTMLElement) {
  const buttons = [...dialog.querySelectorAll('button')];
  const first = buttons.at(0);
  const last = buttons.at(-1);
  if (!first || !last) return;
  const active = document.activeElement;
  const outside = !dialog.contains(active);
  if (event.shiftKey && (active === first || outside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || outside)) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Pergunta antes de uma ação que não dá para desfazer. Abre com o foco em "Cancelar", Esc também
 * cancela, o Tab fica dentro do diálogo e, ao fechar, o foco volta para quem o abriu. Quem usa
 * decide quando mostrar.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement;
    cancel.current?.focus();
    return () => {
      // Se a ação removeu o botão que abriu o diálogo, o foco fica onde a página o deixar.
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Tab' && dialog.current) keepTabInside(event, dialog.current);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onCancel]);

  return (
    <div className={styles.backdrop}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.dialog}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {message && <p>{message}</p>}
        <div className={styles.actions}>
          <Button ref={cancel} variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
