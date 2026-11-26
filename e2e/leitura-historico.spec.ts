import { expect, test } from '@playwright/test';

test('conclui a leitura e mostra o vencedor e a apuração no histórico (R12 e R13)', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Carregar exemplo' }).click();
  await page.getByRole('button', { name: 'Abrir votação' }).click();
  await page.getByRole('button', { name: 'Votar como Diego' }).click();
  await page
    .getByRole('group', { name: '1ª opção' })
    .getByRole('radio', { name: /Dom Casmurro/ })
    .check();
  await page
    .getByRole('group', { name: '2ª opção' })
    .getByRole('radio', { name: /Quarto de despejo/ })
    .check();
  await page.getByRole('button', { name: 'Confirmar voto' }).click();
  await page.getByRole('button', { name: 'Encerrar votação' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Encerrar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Dom Casmurro' })).toBeVisible();
  await page.getByRole('button', { name: 'Concluir leitura' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nenhuma rodada em andamento' })).toBeVisible();
  await page.getByRole('link', { name: 'Histórico' }).click();

  const history = page.getByRole('list', { name: 'Leituras concluídas' });
  await expect(history.getByRole('heading', { name: 'Rodada 1' })).toBeVisible();
  await expect(history.getByRole('definition')).toHaveText('Dom Casmurro — Machado de Assis');
  await expect(history.getByText('Desempate pelos votos de 1ª opção.')).toBeVisible();
  await expect(history.getByRole('meter', { name: /Dom Casmurro/ })).toHaveAttribute(
    'aria-valuetext',
    '50%',
  );
});
