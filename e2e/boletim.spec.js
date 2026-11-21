// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_URL = pathToFileURL(path.resolve(__dirname, '..', 'boletim_acad_mico_unificado_2026.html')).href;

test('abre o boletim, carrega o banco e não gera erro no console', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

  await page.goto(APP_URL);

  // Banco pronto: selo SQLite ativo e pills dos alunos renderizadas.
  await expect(page.getByTestId('status-banco')).toContainText('SQLite + IndexedDB Ativo', { timeout: 30_000 });
  await expect(page.getByTestId('seletor-alunos').locator('button').first()).toBeVisible();
  await expect(page.getByTestId('active-student-name')).not.toBeEmpty();

  expect(errors, errors.join('\n')).toEqual([]);
});
