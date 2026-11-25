import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextField } from './TextField';

describe('TextField', () => {
  it('liga o rótulo ao campo', () => {
    render(<TextField label="Nome" />);

    expect(screen.getByLabelText('Nome')).toBeValid();
  });

  it('marca o campo como inválido e o descreve com o erro', () => {
    render(<TextField label="Nome" error="Use pelo menos 2 letras." />);

    const field = screen.getByLabelText('Nome');
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription('Use pelo menos 2 letras.');
  });
});
