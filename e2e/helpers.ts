import type { Page } from '@playwright/test';

import { expect } from './fixtures';

/** Passos que os testes e2e repetem, sempre pela interface, como uma pessoa faria. */

export interface BookInput {
  title: string;
  author: string;
}

export async function addMembers(page: Page, names: readonly string[]) {
  await page.getByRole('link', { name: 'Membros' }).click();
  for (const name of names) {
    await page.getByLabel('Nome').fill(name);
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByRole('main').getByText(name, { exact: true })).toBeVisible();
  }
}

export async function startRound(page: Page) {
  await page.getByRole('link', { name: 'Rodada' }).click();
  await page.getByRole('button', { name: 'Iniciar rodada' }).click();
  await expect(page.getByRole('heading', { name: /: indicações$/ })).toBeVisible();
}

export async function nominate(page: Page, member: string, book: BookInput) {
  await page.getByLabel('Quem está indicando').selectOption({ label: member });
  await page.getByLabel('Título').fill(book.title);
  await page.getByLabel('Autor').fill(book.author);
  await page.getByRole('button', { name: 'Indicar' }).click();
  const list = page.getByRole('list', { name: 'Indicações da rodada' });
  await expect(list.getByText(book.title, { exact: true })).toBeVisible();
}

export async function openVoting(page: Page) {
  await page.getByRole('button', { name: 'Abrir votação' }).click();
  await expect(page.getByRole('heading', { name: /: votação$/ })).toBeVisible();
}

/** Vota como `voter`, com as escolhas na ordem: a 1ª opção primeiro. */
export async function vote(page: Page, voter: string, choices: readonly string[]) {
  await page.getByRole('button', { name: `Votar como ${voter}` }).click();
  const groups = choices.length === 1 ? ['Sua opção'] : ['1ª opção', '2ª opção'];
  for (const [index, title] of choices.entries()) {
    const group = page.getByRole('group', { name: groups[index] ?? '' });
    await group.getByRole('radio', { name: new RegExp(`^${title},`) }).check();
  }
  await page.getByRole('button', { name: 'Confirmar voto' }).click();
  await expect(page.getByRole('status')).toContainText('Voto registrado');
}

export async function closeVoting(page: Page) {
  await page.getByRole('button', { name: 'Encerrar votação' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Encerrar' }).click();
  await expect(page.getByRole('heading', { name: /: leitura$/ })).toBeVisible();
}
