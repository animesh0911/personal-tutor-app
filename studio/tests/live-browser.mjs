// Explicit live browser check against an already running, real-provider studio.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const output = resolve('studio/test-results/live-browser');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const reports = [];
try {
  await page.goto(process.env.STUDIO_TEST_URL || 'http://localhost:4310');
  await page.getByRole('button', { name: 'Find your starting point' }).click();
  await page.getByLabel('What should we call you?').fill('Mira');
  await page
    .getByLabel('Email', { exact: true })
    .fill(`live-browser-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill(crypto.randomUUID());
  await page.getByRole('button', { name: 'Create my studio' }).click();
  await page.getByRole('button', { name: /Factor it out/ }).click();
  async function settled(label) {
    await page.locator('.activity-heading h1').waitFor({ timeout: 100000 });
    await page
      .locator('.busy-row')
      .waitFor({ state: 'hidden', timeout: 100000 });
    assert.equal(
      await page.locator('.recovery-card').count(),
      0,
      'The live model should finish without recovery.',
    );
    const state = await page.evaluate(async () =>
      (await fetch(`/api/sessions/${location.hash.split('/').at(-1)}`)).json(),
    );
    assert.equal(state.status, 'idle');
    assert.equal(state.problem?.answer, undefined);
    reports.push({ label, state });
    console.log(
      JSON.stringify({
        label,
        activity: state.activity.title,
        status: state.status,
      }),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: resolve(output, `${reports.length}-activity.png`),
      fullPage: true,
    });
    return state;
  }
  await settled('initial activity');
  await page
    .locator('#working')
    .fill(
      'I know the product matters, but I do not understand how to choose the signs.',
    );
  await page.getByRole('button', { name: 'Check my step' }).click();
  await settled('feedback and observation');
  await page.getByRole('button', { name: 'Give me a fresh question' }).click();
  const generated = await settled('generated practice');
  assert.ok(generated.activity.problemId.startsWith('generated-'));
  await page.getByRole('button', { name: 'Finish session' }).click();
  await page.getByRole('link', { name: 'See my journal' }).click();
  await page.locator('.journal-entry').first().waitFor();
  await page.screenshot({
    path: resolve(output, '4-journal.png'),
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Learning path', exact: true }).click();
  await page.locator('.path-node').first().waitFor();
  await page.screenshot({
    path: resolve(output, '5-path.png'),
    fullPage: true,
  });
  assert.equal(await page.locator('.path-node').count(), 6);
  assert.deepEqual(errors, []);
  console.log('Live browser test passed with real OpenRouter/Pi responses.');
} finally {
  writeFileSync(
    resolve(output, 'report.json'),
    JSON.stringify({ at: new Date().toISOString(), reports, errors }, null, 2),
  );
  await browser.close();
}
