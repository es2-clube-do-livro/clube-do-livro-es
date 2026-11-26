import { expect, test, type Page } from '@playwright/test';

/**
 * O clube de exemplo, com a votação aberta: Ana indicou Dom Casmurro, Bruno indicou Quarto de
 * despejo e Clara indicou A hora da estrela; Diego não indicou.
 */
async function openSampleVoting(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Carregar exemplo' }).click();
  await page.getByRole('button', { name: 'Abrir votação' }).click();
}

async function vote(page: Page, voter: string, [first, second]: readonly [string, string]) {
  await page.getByRole('button', { name: `Votar como ${voter}` }).click();
  await page
    .getByRole('group', { name: '1ª opção' })
    .getByRole('radio', { name: new RegExp(`^${first},`) })
    .check();
  await page
    .getByRole('group', { name: '2ª opção' })
    .getByRole('radio', { name: new RegExp(`^${second},`) })
    .check();
  await page.getByRole('button', { name: 'Confirmar voto' }).click();
  await expect(page.getByRole('status')).toContainText('Voto registrado');
}

test('vota até sair o vencedor', async ({ page }) => {
  await openSampleVoting(page);

  // Cada livro fica com 2 votos; Quarto de despejo tem mais votos de 1ª opção e vence o desempate.
  await vote(page, 'Ana', ['Quarto de despejo', 'A hora da estrela']);
  await vote(page, 'Bruno', ['A hora da estrela', 'Dom Casmurro']);
  await vote(page, 'Clara', ['Quarto de despejo', 'Dom Casmurro']);
  await expect(page.getByText('3 de 4 já votaram.')).toBeVisible();
  await page.getByRole('button', { name: 'Encerrar votação' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Encerrar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Rodada 1: leitura' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Quarto de despejo' })).toBeVisible();
  await expect(page.getByText('Desempate pelos votos de 1ª opção.')).toBeVisible();
});

test('impede votar no próprio livro e votar duas vezes', async ({ page }) => {
  await openSampleVoting(page);

  await page.getByRole('button', { name: 'Votar como Ana' }).click();
  const first = page.getByRole('group', { name: '1ª opção' });
  await expect(first.getByRole('radio', { name: /^Dom Casmurro,/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Voltar' }).click();

  await vote(page, 'Ana', ['Quarto de despejo', 'A hora da estrela']);
  await expect(page.getByRole('button', { name: 'Votar como Ana' })).toHaveCount(0);
  await expect(page.getByText('1 de 4 já votaram.')).toBeVisible();
});
