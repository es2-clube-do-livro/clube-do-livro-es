import { describe, expect, it } from 'vitest';

import { browserEnvironment } from './browser-environment';

describe('browserEnvironment', () => {
  it('gera um id diferente a cada vez', () => {
    expect(browserEnvironment.newId()).not.toBe(browserEnvironment.newId());
  });

  it('informa a hora em ISO 8601', () => {
    const now = browserEnvironment.now();

    expect(new Date(now).toISOString()).toBe(now);
  });

  it('sorteia um número entre 0 e 1', () => {
    const number = browserEnvironment.random();

    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThan(1);
  });
});
