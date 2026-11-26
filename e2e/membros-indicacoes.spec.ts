import { expect, test } from './fixtures';
import { addMembers, nominate, startRound } from './helpers';

/** Uma imagem PNG de 1 pixel, para a capa interceptada carregar como imagem de verdade. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

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

test('indica livros, mostra a capa e recusa indicação repetida', async ({ page }) => {
  // A busca acha uma capa, e a própria imagem também é interceptada.
  await page.route('https://www.googleapis.com/books/v1/**', (route) =>
    route.request().resourceType() === 'image'
      ? route.fulfill({ contentType: 'image/png', body: PIXEL })
      : route.fulfill({
          json: {
            items: [
              {
                volumeInfo: {
                  imageLinks: { thumbnail: 'http://www.googleapis.com/books/v1/capa' },
                },
              },
            ],
          },
        }),
  );
  await page.goto('/');
  await addMembers(page, ['Ana', 'Bia']);
  await startRound(page);

  await nominate(page, 'Ana', { title: 'Dom Casmurro', author: 'Machado de Assis' });
  await expect(page.getByRole('img', { name: 'Capa de Dom Casmurro' })).toBeVisible();

  await page.getByLabel('Quem está indicando').selectOption({ label: 'Bia' });
  await page.getByLabel('Título').fill('dom casmurro!');
  await page.getByLabel('Autor').fill('MACHADO DE ASSIS');
  await page.getByRole('button', { name: 'Indicar' }).click();

  await expect(page.getByText('Este livro já foi indicado nesta rodada.')).toBeVisible();
});
