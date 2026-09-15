// Explicit real-provider browser check. Creates a synthetic account and incurs API usage.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto(process.env.STUDIO_TEST_URL || 'http://localhost:4310');
  await page.getByRole('button', { name: 'Find your starting point' }).click();
  await page.getByLabel('What should we call you?').fill('Mira');
  await page
    .getByLabel('Email', { exact: true })
    .fill(`root-live-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill(crypto.randomUUID());
  await page.getByRole('button', { name: 'Create my studio' }).click();
  await page.getByRole('button', { name: /Meet the roots/ }).click();
  const settled = async () => {
    let state;
    await expect
      .poll(
        async () => {
          state = await page.evaluate(async () =>
            (
              await fetch(`/api/sessions/${location.hash.split('/').at(-1)}`)
            ).json(),
          );
          return state.status;
        },
        { timeout: 100000, intervals: [300, 500, 1000] },
      )
      .toBe('idle');
    return state;
  };
  await page.locator('.activity-heading h1').waitFor({ timeout: 100000 });
  await settled();
  const response = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().endsWith('/actions'),
  );
  await page.getByRole('button', { name: 'Show me another way' }).click();
  await response;
  const state = await settled();
  await page.locator('.substitution-card').waitFor({ timeout: 5000 });
  assert.equal(await page.locator('.katex-error').count(), 0);
  assert.deepEqual(errors, []);
  mkdirSync('studio/test-results/live-roots', { recursive: true });
  await page.screenshot({
    path: 'studio/test-results/live-roots/substitution.png',
    fullPage: true,
  });
  console.log(
    JSON.stringify({
      status: state.status,
      components: state.activity.components.map((c) => c.kind),
      topicVisual: state.topicVisual?.kind,
      browserErrors: errors.length,
    }),
  );
} finally {
  await browser.close();
}
