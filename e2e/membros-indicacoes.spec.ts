import { expect, test } from './fixtures';
import { addMembers } from './helpers';

test('cadastra e remove membros', async ({ page }) => {
  await page.goto('/');
  await addMembers(page, ['Ana', 'Bia', 'Caio']);

  await page.getByRole('button', { name: 'Remover Bia' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remover' }).click();

  const main = page.getByRole('main');
  await expect(main.getByText('Bia', { exact: true })).toBeHidden();
  await expect(main.getByText('Ana', { exact: true })).toBeVisible();
  await expect(main.getByText('Caio', { exact: true })).toBeVisible();
});
