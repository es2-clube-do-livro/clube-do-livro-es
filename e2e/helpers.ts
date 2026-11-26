import type { Page } from '@playwright/test';

import { expect } from './fixtures';

/** Passos que os testes e2e repetem, sempre pela interface, como uma pessoa faria. */

export async function addMembers(page: Page, names: readonly string[]) {
  await page.getByRole('link', { name: 'Membros' }).click();
  for (const name of names) {
    await page.getByLabel('Nome').fill(name);
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByRole('main').getByText(name, { exact: true })).toBeVisible();
  }
}
