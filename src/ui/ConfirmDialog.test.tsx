import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

function renderDialog() {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      title="Remover Ana?"
      message="Ela sai da lista de membros."
      confirmLabel="Remover"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { user: userEvent.setup(), onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('abre com o título e o foco em Cancelar', () => {
    renderDialog();

    expect(screen.getByRole('dialog', { name: 'Remover Ana?' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('confirma pelo botão de confirmar', async () => {
    const { user, onConfirm, onCancel } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Remover' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancela pelo botão Cancelar', async () => {
    const { user, onCancel } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('cancela com a tecla Esc', async () => {
    const { user, onConfirm, onCancel } = renderDialog();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
