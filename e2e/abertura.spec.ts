import { expect, test } from '@playwright/test';

test('abre o clube na aba Rodada e permite navegar pelas três abas', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Clube do Livro');
  await expect(page.getByRole('heading', { level: 1, name: 'Clube do Livro' })).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'Abas do clube' });
  await expect(tabs.getByRole('link', { name: 'Rodada' })).toHaveAttribute('aria-current', 'page');

  await tabs.getByRole('link', { name: 'Membros' }).click();
  await expect(page.getByRole('heading', { name: 'Membros', exact: true })).toBeVisible();
  await tabs.getByRole('link', { name: 'Histórico' }).click();
  await expect(page.getByRole('heading', { name: 'Histórico', exact: true })).toBeVisible();
});

test('reabre o histórico pela URL da aba', async ({ page }) => {
  await page.goto('/historico');
  await page.reload();
  await expect(page.getByRole('link', { name: 'Histórico' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('heading', { name: 'Histórico', exact: true })).toBeVisible();
});
