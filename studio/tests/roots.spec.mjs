import { test, expect } from '@playwright/test';

test('root explanation separates display math from prose and offers a substitution visual', async ({
  page,
}, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Find your starting point' }).click();
  await page.getByLabel('What should we call you?').fill('Mira');
  await page
    .getByLabel('Email', { exact: true })
    .fill(`roots-${crypto.randomUUID()}@example.test`);
  await page
    .getByLabel('Password', { exact: true })
    .fill('test-passphrase-1234');
  await page.getByRole('button', { name: 'Create my studio' }).click();
  await page.getByRole('button', { name: /Meet the roots/ }).click();
  const explanation = page.locator('.explanation-card');
  await expect(explanation).toContainText('Checking a root');
  // Exact persisted model response contains $$ blocks followed by ordinary prose.
  await expect(explanation.locator('.katex-display')).toHaveCount(2);
  await expect(explanation).toContainText('Yes — the result is 0, so');
  await expect(
    explanation.locator('.katex').filter({ hasText: 'Yes' }),
  ).toHaveCount(0);
  await expect(explanation.locator('.katex-error')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'See substitution in action' }),
  ).toBeVisible();
  await page.getByLabel('Candidate value', { exact: true }).fill('1');
  await expect(page.locator('.substitution-verdict')).toContainText(
    'is a root',
  );
  await page.getByLabel('Candidate value', { exact: true }).fill('2');
  await expect(page.locator('.substitution-verdict')).toContainText(
    'is not a root',
  );
  await page.getByLabel('Candidate value', { exact: true }).fill('4');
  await expect(page.locator('.substitution-verdict')).toContainText(
    'is a root',
  );
  await page.screenshot({
    path: info.outputPath('root-substitution.png'),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      (width) => document.documentElement.scrollWidth <= width + 1,
      page.viewportSize().width,
    ),
  ).toBe(true);
});
