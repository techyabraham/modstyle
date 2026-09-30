import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.skip(process.env.RUN_PREVIEW_TESTS !== '1', 'Run after pnpm build with pnpm test:preview');
test('@preview styleguide stays accessible and within the viewport', async ({ page }, testInfo) => {
  await page.goto('/_styleguide/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tactile maker');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.locator('.art-tile')).toHaveCount(7);
  await expect(page.locator('.art-tile__badge')).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  await page.screenshot({ path: `test-results/styleguide-${testInfo.project.name}.png`, fullPage: true });
});

test('@preview homepage is complete, accessible and within the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stitched with love. Packed with crunch.');
  await expect(page.getByRole('heading', { name: 'Made by hand. Made for you.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A little crunch. A lot to share.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore crochet' })).toHaveAttribute('href', '/crochet/');
  await expect(page.getByRole('link', { name: 'Explore peanuts' })).toHaveAttribute('href', '/peanuts/');
  await expect(page.getByRole('link', { name: 'View the sample gallery' })).toHaveAttribute('href', '/gallery/');
  await expect(page.getByRole('link', { name: 'Start an enquiry' })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  await expect(page.locator('.home-faq__item')).toHaveCount(4);
  await expect(page.locator('.art-tile__badge').first()).toHaveText('Sample content');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  await page.screenshot({ path: `test-results/homepage-${testInfo.project.name}.png`, fullPage: true });
});

test('@preview catalogue lists labelled samples and filters crochet items', async ({ page }, testInfo) => {
  await page.goto('/crochet/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Made by hand.');
  await expect(page.locator('[data-product-card]')).toHaveCount(8);
  await expect(page.locator('.catalogue-card .catalogue-sample')).toHaveCount(8);
  await expect(page.getByRole('combobox', { name: 'Category' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Intended wearer' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Price type' }).selectOption('fixed');
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-product-card]:visible')).toContainText('₦40,000');
  await expect(page).toHaveURL(/price=fixed/);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(8);
  await page.goto('/peanuts/');
  await expect(page.locator('[data-product-card]')).toHaveCount(3);
  await expect(page.locator('body')).toContainText('Varieties and pack sizes have not been confirmed');
  await page.screenshot({ path: `test-results/catalogue-${testInfo.project.name}.png`, fullPage: true });
});

test('@preview product page and gallery lightboxes support keyboard close and focus restore', async ({ page }) => {
  await page.goto('/products/sample-crochet-featured/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crochet Piece · Sample');
  await expect(page.getByText('₦40,000')).toBeVisible();
  const productTrigger = page.getByRole('button', { name: 'Open larger view of Crochet Piece · Sample' });
  await productTrigger.click();
  await expect(page.locator('[data-product-lightbox]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-product-lightbox]')).not.toBeVisible();
  await expect(productTrigger).toBeFocused();

  await page.goto('/gallery/');
  await expect(page.locator('[data-gallery-item]')).toHaveCount(4);
  await page.getByRole('button', { name: 'Peanuts', exact: true }).click();
  await expect(page.locator('[data-gallery-item]:visible')).toHaveCount(1);
  await page.locator('[data-gallery-item]:visible').click();
  await expect(page.locator('[data-gallery-lightbox]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-gallery-lightbox]')).not.toBeVisible();
  await expect(page.locator('[data-gallery-item]:visible')).toBeFocused();
});
