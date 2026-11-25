import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('não envia formulários, a não ser que peçam', () => {
    render(<Button>Adicionar</Button>);

    expect(screen.getByRole('button', { name: 'Adicionar' })).toHaveAttribute('type', 'button');
  });

  it('avisa o clique', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Adicionar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
