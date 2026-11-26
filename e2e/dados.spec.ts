import { expect, test } from './fixtures';

test('mantém a rodada, os membros e a indicação depois de recarregar a página (R14)', async ({
  page,
}) => {
  await page.goto('/membros');
  const name = page.getByRole('textbox', { name: 'Nome' });
  const add = page.getByRole('button', { name: 'Adicionar' });
  await name.fill('Lívia');
  await add.click();
  await name.fill('Caio');
  await add.click();

  await page.getByRole('link', { name: 'Rodada' }).click();
  await page.getByRole('button', { name: 'Iniciar rodada' }).click();
  const member = page.getByRole('combobox', { name: 'Quem está indicando' });
  await member.selectOption({ label: 'Lívia' });
  await page.getByRole('textbox', { name: 'Título' }).fill('Torto Arado');
  await page.getByRole('textbox', { name: 'Autor' }).fill('Itamar Vieira Junior');
  await page.getByRole('button', { name: 'Indicar' }).click();

  const books = page.getByRole('list', { name: 'Indicações da rodada' });
  await expect(books.getByText('Torto Arado', { exact: true })).toBeVisible();
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Rodada 1: indicações' })).toBeVisible();
  await expect(books.getByText('Torto Arado', { exact: true })).toBeVisible();
  await expect(books.getByText('Itamar Vieira Junior', { exact: true })).toBeVisible();
  await expect(member.getByRole('option', { name: 'Caio' })).toHaveCount(1);
  await expect(member.getByRole('option', { name: 'Lívia' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Membros' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Lívia' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Caio' })).toBeVisible();
});
