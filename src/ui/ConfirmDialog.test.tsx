import { act, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
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

  it('mantém o Tab e o Shift+Tab dentro do diálogo, nas duas pontas', async () => {
    render(
      <>
        <button type="button">Fora</button>
        <ConfirmDialog
          title="Remover Ana?"
          confirmLabel="Remover"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </>,
    );
    const user = userEvent.setup();
    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    const confirm = screen.getByRole('button', { name: 'Remover' });

    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();

    act(() => {
      screen.getByRole('button', { name: 'Fora' }).focus();
    });
    await user.tab();
    expect(cancel).toHaveFocus();
    act(() => {
      screen.getByRole('button', { name: 'Fora' }).focus();
    });
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it.each([
    [
      'o botão Cancelar',
      (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Cancelar' })),
    ],
    ['a tecla Esc', (user: UserEvent) => user.keyboard('{Escape}')],
  ])('devolve o foco a quem abriu o diálogo ao fechar com %s', async (_way, close) => {
    render(<Opener />);
    const user = userEvent.setup();
    const opener = screen.getByRole('button', { name: 'Apagar dados' });

    await user.click(opener);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await close(user);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

/** Um botão que abre o diálogo, como as telas fazem. */
function Opener() {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Apagar dados
      </button>
      {open && (
        <ConfirmDialog title="Apagar?" confirmLabel="Apagar" onConfirm={close} onCancel={close} />
      )}
    </>
  );
}
