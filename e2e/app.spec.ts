import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const merchants = JSON.parse(
  readFileSync(path.join(process.cwd(), 'data/merchants.json'), 'utf8'),
) as { slug: string; legalName: string }[];
const source = JSON.parse(
  readFileSync(path.join(process.cwd(), 'data/source-meta.json'), 'utf8'),
) as { sourceDate: string };
const sourceDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(source.sourceDate));
const first = merchants[0];
if (!first) throw new Error('E2E needs the generated, nonempty official merchant data.');
const merchantRoute = `/check/${first.slug}/`;
const routes = [
  '/',
  '/apply/',
  '/calculator/',
  '/double-charge/',
  '/faq/',
  '/about/',
  merchantRoute,
  '/check/canva/',
];

for (const locale of ['English', 'Twi'] as const) {
  for (const route of routes) {
    test(`${route} in ${locale} has accessible structure, sources, keyboard entry, and no overflow`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main$/);
      if (locale === 'Twi') {
        await page.getByRole('button', { name: 'Switch to Twi', exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
      }
      await expect(page.locator('main')).toBeVisible();
      await expect(
        page.getByText('Not affiliated with GRA.', { exact: false }).first(),
      ).toBeVisible();
      await expect(page.locator('footer')).toContainText(sourceDate);
      await expect(page.locator('a[href^="https://gra.gov.gh"]').first()).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      const report = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        report.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        ),
      ).toEqual([]);
    });
  }
}

test('runtime uses only assets from this site', async ({ page, baseURL }) => {
  const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (url.origin !== origin) external.push(request.url());
    }
  });
  for (const route of routes) await page.goto(route);
  expect(external).toEqual([]);
});

test('merchant guidance and provenance are readable with JavaScript disabled', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL ?? 'http://127.0.0.1:4173'}${merchantRoute}`);
  await expect(page.locator('main')).toContainText(first.legalName);
  await expect(page.locator('main')).toContainText(/registered/i);
  await expect(
    page
      .locator('main')
      .getByRole('link', { name: /GRA|source|FAQ/i })
      .first(),
  ).toBeVisible();
  await context.close();
});

test('combobox can be searched and selected using only the keyboard', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('combobox', { name: 'Service or merchant' });
  await input.focus();
  await input.fill(first.legalName.slice(0, 8));
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  await input.press('Enter');
  await expect(page).toHaveURL(/\/check\//);
});

test('unmatched service explains the dated list without claiming an exemption', async ({
  page,
}) => {
  await page.goto('/');
  const search = page.getByRole('combobox', { name: 'Service or merchant' });
  await search.fill('zzzzunknownserviceqxp');
  await expect(page.locator('main')).toContainText(/not on|no match|couldn.t find/i);
  await expect(page.locator('main')).toContainText(/bank|MoMo|payment provider/i);
  await search.press('ArrowUp');
  await expect(search).not.toHaveAttribute('aria-activedescendant', /.+/);
  await search.press('Enter');
  await expect(page).toHaveURL(/\/$/);
  await search.press('Escape');
  await expect(search).toHaveAttribute('aria-expanded', 'false');
});

test('calculator shows the same-base 20 percent example and validates negative amounts', async ({
  page,
}) => {
  await page.goto('/calculator/');
  const amount = page.getByLabel('Amount in Ghana cedis', { exact: true });
  await amount.fill('100');
  await expect(page.locator('main')).toContainText(/120\.00/);
  await amount.fill('-1');
  await expect(amount).toHaveAttribute('aria-invalid', 'true');
});

test('language preference survives navigation without clearing an entered price', async ({
  page,
}) => {
  await page.goto('/calculator/');
  const input = page.locator('input[inputmode="decimal"]').first();
  await input.fill('237.49');
  await page.getByRole('button', { name: /Twi/i }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', /tw|ak/);
  await expect(input).toHaveValue('237.49');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', /tw|ak/);
});

test('every extracted merchant is included in the sitemap', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  for (const merchant of merchants) expect(sitemap).toContain(`/check/${merchant.slug}`);
});

test('eligibility supports back, an honest uncertain outcome, and restart', async ({ page }) => {
  await page.goto('/apply/');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('radio', { name: 'I’m not sure', exact: true }).check();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Yes', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'I’m not sure', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'See my result' }).click();
  await expect(page.getByRole('heading', { name: 'More information is needed' })).toBeVisible();
  await page.getByRole('button', { name: 'Start again' }).click();
  await expect(page.locator('input[name="outsideGhana"]')).toHaveCount(3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});

test('eligibility keeps the selected answer when language changes mid-flow', async ({ page }) => {
  await page.goto('/apply/');
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('radio', { name: 'No', exact: true }).check();
  await page.getByRole('button', { name: 'Switch to Twi' }).click();
  await expect(page.getByRole('radio', { name: 'Daabi', exact: true })).toBeChecked();
  await expect(page.locator('input[name="digitalService"]')).toHaveCount(3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('radio', { name: 'No', exact: true })).toBeChecked();
});

test('an alias that maps to several legal entities presents separate choices', async ({ page }) => {
  const aliases = JSON.parse(
    readFileSync(path.join(process.cwd(), 'data/aliases.json'), 'utf8'),
  ) as Record<string, string[]>;
  const entry = Object.entries(aliases).find(([, entities]) => entities.length > 1);
  if (!entry)
    throw new Error('This test requires a real multi-entity alias from the reviewed map.');
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Service or merchant' }).fill(entry[0]);
  for (const entity of entry[1])
    await expect(page.getByRole('option').filter({ hasText: entity })).toBeVisible();
});

test('charge helper distinguishes uncertain, duplicate, ordinary tax, and lower statements', async ({
  page,
}) => {
  await page.goto('/double-charge/');
  await page.getByLabel('Merchant charged (GHS)', { exact: true }).fill('100');
  await expect(
    page.getByText(
      'Enter both GHS amounts to compare the charge. Your entries stay in this browser.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByLabel('Statement shows (GHS)', { exact: true }).fill('120');
  await expect(
    page.getByRole('heading', { name: 'The amounts alone cannot settle this' }),
  ).toBeVisible();
  await page.getByRole('radio', { name: 'Yes, the receipt clearly shows Ghana tax' }).check();
  await expect(
    page.getByRole('heading', { name: 'Possible duplicate tax, check with your provider' }),
  ).toBeVisible();
  await page.getByLabel('Merchant name (optional)', { exact: true }).fill('Test merchant');
  await expect(page.getByLabel('Message to your payment provider')).toHaveValue(/Test merchant/);
  await expect(page.getByLabel('Message to your payment provider')).toHaveValue(/question 12/);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy message', exact: true }).click();
  await expect(page.getByText('Message copied', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'No, the receipt shows a price before Ghana tax' }).check();
  await expect(
    page.getByRole('heading', { name: 'The difference is consistent with one tax charge' }),
  ).toBeVisible();
  await page.getByLabel('Statement shows (GHS)', { exact: true }).fill('90');
  await expect(page.getByRole('heading', { name: 'The statement amount is lower' })).toBeVisible();
  await page.getByLabel('Statement shows (GHS)', { exact: true }).fill('-5');
  await expect(page.getByLabel('Statement shows (GHS)', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
});

test('share dialog creates a local PNG and returns focus after closing', async ({
  page,
}, testInfo) => {
  await page.goto(merchantRoute);
  const trigger = page.getByRole('button', { name: 'Share this result', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Share or download image' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('vat-check-gh-result.png');
  expect(await download.failure()).toBeNull();
  const imageDirectory = path.resolve('..', 'work', 'qa');
  mkdirSync(imageDirectory, { recursive: true });
  await download.saveAs(path.join(imageDirectory, `share-image-${testInfo.project.name}.png`));
  await page.getByRole('button', { name: 'Close share dialog' }).click();
  await expect(trigger).toBeFocused();
});

test('a client-navigated merchant page and search work offline after a hard reload', async ({
  page,
  context,
}) => {
  const chosen = merchants.find((merchant) => merchant.slug === 'netflix') ?? first;
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const search = page.getByRole('combobox', { name: 'Service or merchant' });
  await search.fill(chosen.slug === 'netflix' ? 'netflix' : chosen.legalName.slice(0, 8));
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/check/${chosen.slug}/$`));
  await page.waitForFunction(async () => Boolean(await caches.match(location.href)));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('main')).toContainText(chosen.legalName);
  await expect(page.getByRole('button', { name: 'Share this result', exact: true })).toBeVisible();
  await page.goto('/');
  await page
    .getByRole('combobox', { name: 'Service or merchant' })
    .fill(first.legalName.slice(0, 8));
  await expect(page.getByRole('option').filter({ hasText: first.legalName })).toBeVisible();
  await context.setOffline(false);
});

test('calculator switches inclusive mode and preserves an awkward entered total', async ({
  page,
}) => {
  await page.goto('/calculator/');
  const amount = page.getByLabel('Amount in Ghana cedis', { exact: true });
  await amount.fill('120');
  await page.getByRole('radio', { name: 'Price already includes tax', exact: true }).click();
  await expect(page.getByRole('row', { name: /Price before tax/ })).toContainText('100.00');
  await amount.fill('99.99');
  await expect(page.locator('.result-figure')).toContainText('99.99');
  await amount.fill('0');
  await expect(page.locator('.result-figure')).toContainText('0.00');
});

test('capture every page and principal interaction state', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const directory = path.resolve('..', 'work', 'qa');
  mkdirSync(directory, { recursive: true });
  async function capture(name: string) {
    await page.evaluate(() => document.fonts.ready);
    const report = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = report.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(serious, `Axe serious or critical violations in captured state: ${name}`).toEqual([]);
    await page.screenshot({
      path: path.join(directory, `${name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  }
  const screens = [
    ['/', 'home'],
    ['/apply/', 'apply-step-1'],
    ['/calculator/', 'calculator'],
    ['/double-charge/', 'double-charge-empty'],
    ['/faq/', 'faq'],
    ['/about/', 'about'],
    [merchantRoute, 'result-listed'],
    ['/check/canva/', 'result-unlisted'],
  ] as const;
  for (const [route, name] of screens) {
    await page.goto(route);
    await capture(name);
  }
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Service or merchant' }).fill('amazon');
  await capture('search-multiple-entities');
  await page.getByRole('combobox', { name: 'Service or merchant' }).fill('zzzzunknownserviceqxp');
  await capture('search-no-match');
  await page.goto('/apply/');
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await capture('apply-step-2');
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await capture('apply-step-3');
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'See my result' }).click();
  await capture('apply-outcome-applies');
  await page.goto('/calculator/');
  await page.getByLabel('Amount in Ghana cedis', { exact: true }).fill('120');
  await page.getByRole('radio', { name: 'Price already includes tax', exact: true }).click();
  await capture('calculator-inclusive');
  await page.goto('/double-charge/');
  await page.getByLabel('Merchant charged (GHS)', { exact: true }).fill('100');
  await page.getByLabel('Statement shows (GHS)', { exact: true }).fill('120');
  await page.getByRole('radio', { name: 'Yes, the receipt clearly shows Ghana tax' }).check();
  await capture('double-charge-review');
  await page.goto(merchantRoute);
  await page.getByRole('button', { name: 'Share this result', exact: true }).click();
  await capture('share-dialog');
  await page.getByRole('button', { name: 'Close share dialog' }).click();
  await page.goto('/calculator/');
  await page.locator('#amount').fill('');
  await capture('calculator-empty');
  await page.locator('#amount').fill('-1');
  await capture('calculator-invalid');
  await page.goto('/double-charge/');
  await page.locator('#merchant-amount').fill('-1');
  await capture('double-charge-invalid');
  await page.locator('#merchant-amount').fill('100');
  await page.locator('#statement-amount').fill('90');
  await capture('double-charge-lower');
  await page.goto('/apply/');
  await page.getByRole('radio', { name: 'I’m not sure', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'See my result' }).click();
  await capture('apply-outcome-unclear');
  await page.goto('/404/');
  await capture('not-found');
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to Twi', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await capture('twi-home');
  await page.goto('/calculator/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await capture('twi-calculator');
  await page.goto(merchantRoute);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await capture('twi-result');
  await page.goto('/apply/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await capture('twi-apply-step-1');
  for (let step = 0; step < 3; step++) {
    await page.locator('input[value="yes"]').check();
    await page.locator('.controls button').last().click();
  }
  await capture('twi-apply-outcome');
  await page.goto('/double-charge/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tw');
  await page.locator('#merchant-amount').fill('100');
  await page.locator('#statement-amount').fill('120');
  await page.locator('input[name="merchant-tax"]').first().check();
  await capture('twi-double-charge');
});

test('eligibility can be completed and restarted using only the keyboard', async ({ page }) => {
  await page.goto('/apply/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  for (let step = 0; step < 3; step++) {
    await expect(page.getByRole('radio', { name: 'Yes', exact: true })).toBeFocused();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    if (step > 0) await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: step === 2 ? 'See my result' : 'Next', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    if (step < 2) await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('heading', { name: 'VAT applies', exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Start again', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});

test('calculator mode and copy can be operated using only the keyboard', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/calculator/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Amount in Ghana cedis', { exact: true })).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('120');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Tax added on top', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('radio', { name: 'Price already includes tax', exact: true }),
  ).toBeChecked();
  await expect(page.getByRole('row', { name: /Price before tax/ })).toContainText('100.00');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Copy result', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
});
