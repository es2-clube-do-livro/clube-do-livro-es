import { describe, expect, it } from 'vitest';

import { err, ok } from './result';

describe('Result', () => {
  it('ok carrega o novo valor', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it('err carrega o código do erro', () => {
    expect(err('duplicate-name')).toEqual({ ok: false, error: 'duplicate-name' });
  });
});
