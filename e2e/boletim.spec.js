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
  // Média geral do aluno selecionado, perto do nome.
  await expect(page.getByTestId('active-student-media-geral')).toHaveText(/^\d+,\d$/);

  expect(errors, errors.join('\n')).toEqual([]);
});

test.describe('média geral do aluno selecionado', () => {
  /** @param {import('@playwright/test').Page} page */
  async function abrir(page) {
    await page.goto(APP_URL);
    await expect(page.getByTestId('status-banco')).toContainText('SQLite + IndexedDB Ativo', { timeout: 30_000 });
    const media = page.getByTestId('active-student-media-geral');
    await expect(media).toHaveText(/^\d+,\d$/);
    return media;
  }

  test('trocar de aluno atualiza a média geral', async ({ page }) => {
    const media = await abrir(page);
    const pills = page.getByTestId('seletor-alunos').locator('button');
    test.skip((await pills.count()) < 2, 'precisa de pelo menos dois alunos');

    const nomeAntes = await page.getByTestId('active-student-name').innerText();
    const antes = await media.innerText();

    await pills.nth(1).click();
    await expect(page.getByTestId('active-student-name')).not.toHaveText(nomeAntes);
    await expect(media).not.toHaveText(antes);

    // Voltar ao primeiro aluno devolve a média original.
    await pills.nth(0).click();
    await expect(page.getByTestId('active-student-name')).toHaveText(nomeAntes);
    await expect(media).toHaveText(antes);
  });

  test('aplicar uma simulação altera a média geral', async ({ page }) => {
    const media = await abrir(page);
    const antes = await media.innerText();

    await page.getByTestId('btn-simular-realista').click();

    await expect(media).not.toHaveText(antes);
    await expect(media).toHaveText(/^\d+,\d$/);
  });

  test('"Limpar simulações" devolve a média inicial', async ({ page }) => {
    const media = await abrir(page);
    const inicial = await media.innerText();

    await page.getByTestId('btn-simular-realista').click();
    await expect(media).not.toHaveText(inicial);

    await page.getByTestId('btn-limpar-simulacoes').click();
    await expect(media).toHaveText(inicial);
  });

  test('a cor do selo segue a meta de 6,0 e acompanha as simulações', async ({ page }) => {
    const media = await abrir(page);
    const selo = page.getByTestId('selo-media-geral');

    // Lê o valor exibido e confere a faixa e a cor do selo contra a regra (>= 6 verde, < 6 vermelho).
    async function conferir() {
      const valor = Number((await media.innerText()).replace(',', '.'));
      const [r, g] = (await selo.evaluate((el) => getComputedStyle(el).color))
        .match(/\d+(\.\d+)?/g).map(Number);
      if (valor >= 6) {
        await expect(selo).toHaveAttribute('data-faixa', 'aprovado');
        expect(g, 'texto do selo deve ser verde').toBeGreaterThan(r);
      } else {
        await expect(selo).toHaveAttribute('data-faixa', 'abaixo');
        expect(r, 'texto do selo deve ser vermelho').toBeGreaterThan(g);
      }
      return valor;
    }

    const inicial = await conferir();

    // A simulação "mínimo para passar" leva a média para a faixa oposta ou a mantém na meta.
    await page.getByTestId('btn-simular-minimo').click();
    await expect(media).toHaveText(/^\d+,\d$/);
    await conferir();

    await page.getByTestId('btn-limpar-simulacoes').click();
    expect(await conferir()).toBe(inicial);
  });
});
