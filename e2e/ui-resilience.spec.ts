import { expect, test } from '@playwright/test';

test('blocked preference storage preserves calculator and language changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) {
      Object.defineProperty(Storage.prototype, method, {
        value() {
          throw new DOMException('Preference storage is blocked.', 'SecurityError');
        },
      });
    }
  });
  await page.goto('/calculator/');
  const amount = page.locator('#amount');
  await expect(amount).toBeVisible();
  await amount.fill('237.49');
  await page.getByRole('button', { name: 'Switch to Twi', exact: true }).click();
  await expect(amount).toHaveValue('237.49');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await expect(page.locator('.result-figure')).toContainText('284.99');
  expect(errors).toEqual([]);
});

test('Twi labels and English fallback expose their own spoken languages', async ({ page }) => {
  await page.goto('/calculator/');
  await page.getByRole('button', { name: 'Switch to Twi', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  const label = page.getByText('Sika wɔ Ghana cedis mu', { exact: true });
  expect(await label.evaluate((node) => node.closest('[lang]')?.getAttribute('lang'))).toBe('tw');
  const guidance = page.getByText('VAT, NHIL and GETFund use the same price before tax.', {
    exact: false,
  });
  expect(await guidance.evaluate((node) => node.closest('[lang]')?.getAttribute('lang'))).toBe(
    'en',
  );
  const disclaimer = page.getByText(
    'Not affiliated with GRA. Not tax or legal advice. Check official GRA guidance.',
    { exact: true },
  );
  expect(await disclaimer.evaluate((node) => node.closest('[lang]')?.getAttribute('lang'))).toBe(
    'en',
  );
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await expect(page.getByText('Sika wɔ Ghana cedis mu', { exact: true })).toBeVisible();
});
