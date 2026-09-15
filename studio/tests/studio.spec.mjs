import { test, expect } from '@playwright/test';
test('learner goes from onboarding through visual teaching, saved working, journal, and fresh practice', async ({
  page,
}, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Less memorising/ }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath('01-welcome.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Find your starting point' }).click();
  await page.getByLabel('What should we call you?').fill('Mira');
  await page
    .getByLabel('Email', { exact: true })
    .fill(`mira-${crypto.randomUUID()}@example.com`);
  await page
    .getByLabel('Password', { exact: true })
    .fill('test-passphrase-1234');
  await page.getByRole('button', { name: 'Create my studio' }).click();
  await expect(
    page.getByRole('heading', { name: /discovery, Mira/ }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath('02-subjects.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Explore mathematics' }).click();
  await expect(
    page.getByRole('heading', { name: 'Find the hidden pair' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'A small hint' }),
  ).toBeEnabled();
  await page.getByLabel('First factor').fill('-2');
  await page.getByLabel('Second factor').fill('-3');
  await expect(page.locator('.pair-readings .matched')).toHaveCount(2);
  await page.getByLabel('Show your thinking').fill('(x+2)(x+3)=0');
  await page.reload();
  await expect(page.getByLabel('Show your thinking')).toHaveValue(
    '(x+2)(x+3)=0',
  );
  await page.getByRole('button', { name: 'Check my step' }).click();
  await expect(
    page.getByText(
      'The product is right. What should the two numbers add up to?',
    ),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath('03-activity.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Show me another way' }).click();
  await expect(
    page.getByRole('heading', { name: 'Meet the curve' }),
  ).toBeVisible();
  await expect(page.getByLabel('Position on the parabola')).toBeVisible();
  await page.getByLabel('Position on the parabola').focus();
  await page.getByLabel('Position on the parabola').press('ArrowRight');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath('04-parabola.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Give me a fresh question' }).click();
  await expect(
    page.getByRole('heading', { name: 'A fresh pair of possibilities' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Finish session' }).click();
  await expect(
    page.getByRole('heading', { name: 'Good work thinking it through.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'See my journal' }).click();
  await expect(
    page.getByText(
      'You found the right product. We are exploring how the signs affect the sum.',
    ),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath('05-journal.png'),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
