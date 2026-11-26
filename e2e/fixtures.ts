import { test as base } from '@playwright/test';

/**
 * Todos os testes e2e usam este `test`: a busca de capa no Google Livros é interceptada e
 * responde "nada encontrado", para nenhum teste depender da internet.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route('https://www.googleapis.com/books/v1/**', (route) =>
      route.fulfill({ json: { totalItems: 0 } }),
    );
    await provide(page);
  },
});

export { expect } from '@playwright/test';
