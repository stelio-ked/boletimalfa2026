// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  // PW_CHANNEL=msedge (ou chrome) usa o navegador instalado quando o download do Chromium estiver bloqueado.
  use: { headless: true, channel: process.env.PW_CHANNEL || undefined },
});
