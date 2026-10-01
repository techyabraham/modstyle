import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.skip(process.env.RUN_PREVIEW_TESTS !== '1', 'Run after pnpm build with pnpm test:preview');
async function revealHomeSections(page: import('@playwright/test').Page) {
  for (const selector of ['.home-departments', '.home-ordering', '.home-facts', '.home-faq', '.home-last-call']) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await expect.poll(() => section.evaluate(element => element.checkVisibility({ contentVisibilityAuto: true }))).toBe(true);
    await section.evaluate(element => { (element as HTMLElement).style.contentVisibility = 'visible'; });
  }
}
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
  await revealHomeSections(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `test-results/homepage-${testInfo.project.name}.png`, fullPage: true });
});

test('@preview catalogue lists labelled samples and filters crochet items', async ({ page }, testInfo) => {
  await page.goto('/crochet/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Made by hand.');
  await expect(page.locator('[data-product-card]')).toHaveCount(12);
  await expect(page.locator('[data-product-card] img[src*="/images/products/crochet/"]')).toHaveCount(4);
  await expect(page.locator('.catalogue-card .catalogue-sample')).toHaveCount(8);
  await expect(page.getByRole('combobox', { name: 'Category' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Intended wearer' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Price type' }).selectOption('fixed');
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-product-card]:visible')).toContainText('₦40,000');
  await expect(page).toHaveURL(/price=fixed/);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(12);
  await page.goto('/peanuts/');
  await expect(page.locator('[data-product-card]')).toHaveCount(19);
  await expect(page.locator('[data-product-card] img[src*="/images/products/peanuts/"]')).toHaveCount(16);
  await expect(page.locator('body')).toContainText('From ₦22,000');
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

  await page.goto('/products/peanut-crunch-bulk-pouch/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Peanut Crunch — Bulk Pouch');
  await expect(page.locator('.product-detail__price')).toHaveText('From ₦22,000');
  await expect(page.locator('.product-detail__media-frame img')).toHaveAttribute('src', '/images/products/peanuts/peanut-crunch-bulk-pouch.webp');

  await page.goto('/products/burgundy-cream-crochet-set/');
  await expect(page.locator('.product-detail__media-frame img')).toHaveAttribute('srcset', /burgundy-cream-crochet-set-480\.webp 480w.*burgundy-cream-crochet-set-800\.webp 800w/);

  await page.goto('/gallery/');
  await expect(page.locator('[data-gallery-item]')).toHaveCount(8);
  await expect(page.locator('[data-gallery-item] img[src*="/images/products/crochet/"]')).toHaveCount(4);
  await expect(page.locator('[data-gallery-item] img[src*="/images/products/peanuts/"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gallery');
  await page.getByRole('button', { name: 'Peanuts', exact: true }).click();
  await expect(page.locator('[data-gallery-item]:visible')).toHaveCount(1);
  const galleryTrigger = page.locator('[data-gallery-item]:visible').first();
  await galleryTrigger.click();
  await expect(page.locator('[data-gallery-lightbox]')).toBeVisible();
  await expect(page.locator('[data-gallery-lightbox] .art-tile')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-gallery-lightbox]')).not.toBeVisible();
  await expect(galleryTrigger).toBeFocused();
  await page.getByRole('button', { name: 'Crochet', exact: true }).click();
  await expect(page.locator('[data-gallery-item]:visible')).toHaveCount(7);
  const crochetGalleryTrigger = page.locator('[data-gallery-item]:visible').first();
  await crochetGalleryTrigger.click();
  await expect(page.locator('[data-gallery-lightbox] img[src*="/images/products/crochet/"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(crochetGalleryTrigger).toBeFocused();
});

test('@preview basket saves options, separates department minimums and creates a short WhatsApp message', async ({ page }) => {
  await page.goto('/products/sample-crochet-top/');
  const addButton = page.getByRole('button', { name: 'Add to enquiry' });
  await addButton.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Enquiry basket' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(addButton).toBeFocused();
  await page.getByLabel('Size').selectOption('Sample size B');
  await page.getByLabel('Colour').selectOption('Sample colour');
  await page.locator('[data-product-quantity]').fill('2');
  await addButton.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Sample size B, Sample colour');
  await expect(dialog.locator('[data-progress-department="crochet"]')).toContainText('Quote items included');
  const basketA11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(basketA11y.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  await dialog.getByRole('button', { name: 'Clear basket' }).click();
  await dialog.getByRole('button', { name: 'Close enquiry basket' }).click();

  await page.goto('/products/sample-crochet-featured/');
  await page.getByRole('button', { name: 'Add to enquiry' }).click();
  await expect(dialog.locator('[data-progress-department="crochet"]')).toContainText('₦40,000 of ₦30,000 minimum reached.');
  await dialog.getByLabel('Delivery area').fill('Ikeja & GRA');
  await dialog.getByLabel('Notes').fill("It's for Mum\nPlease call first.");
  const whatsApp = new URL((await dialog.locator('[data-basket-whatsapp]').getAttribute('href'))!);
  expect(whatsApp.hostname).toBe('wa.me');
  expect(whatsApp.href.length).toBeLessThanOrEqual(1800);
  expect(whatsApp.searchParams.get('text')).toContain('Crochet Piece · Sample');
  expect(whatsApp.searchParams.get('text')).toContain('Ikeja & GRA');
  await dialog.getByRole('button', { name: 'Clear basket' }).click();
  await expect(dialog.locator('[data-basket-items]')).toBeHidden();
});

test('@preview custom crochet and peanut bulk forms show the generated WhatsApp preview', async ({ page }) => {
  await page.goto('/crochet/');
  const crochet = page.locator('[data-quick-enquiry="crochet"]');
  await crochet.getByLabel(/Item type/).fill('A custom piece');
  await crochet.getByLabel('Size or measurements').fill('Medium');
  await crochet.getByLabel('Colour(s)').fill('Forest green');
  await crochet.getByRole('spinbutton', { name: 'Quantity' }).fill('2');
  await crochet.getByLabel(/Needed by/).fill('2026-10-16');
  await crochet.getByLabel(/Describe your idea/).fill('A warm, simple design.');
  await expect(crochet.locator('[data-form-summary]')).toContainText('Needed by (requested): 2026-10-16');
  const crochetA11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(crochetA11y.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  const crochetUrl = new URL((await crochet.locator('[data-form-whatsapp]').getAttribute('href'))!);
  expect(crochetUrl.searchParams.get('text')).toContain('A custom piece');
  expect(crochetUrl.searchParams.get('text')).toContain('Forest green');
  await crochet.getByLabel(/Describe your idea/).fill('✨'.repeat(600));
  expect((await crochet.locator('[data-form-whatsapp]').getAttribute('href'))!.length).toBeLessThanOrEqual(1800);
  await expect(crochet.locator('[data-form-error]')).toContainText('shortened to fit');
  await expect(crochet.getByLabel(/Describe your idea/)).toHaveValue(/… \(shortened to fit/);

  await page.goto('/peanuts/');
  const peanuts = page.locator('[data-quick-enquiry="peanuts"]');
  await peanuts.getByLabel(/Quantity and unit/).fill('10 bags');
  await peanuts.getByLabel('Delivery area').fill('Ikeja');
  await peanuts.getByLabel(/Variety preference/).fill('To discuss');
  await expect(peanuts.locator('[data-form-summary]')).toContainText('Quantity and unit: 10 bags');
  const peanutsA11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(peanutsA11y.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  const peanutUrl = new URL((await peanuts.locator('[data-form-whatsapp]').getAttribute('href'))!);
  expect(peanutUrl.searchParams.get('text')).toContain('Delivery area: Ikeja');
  expect(peanutUrl.searchParams.get('text')).not.toContain('Ingredients:');
  await peanuts.getByLabel('Notes').fill('🌰'.repeat(600));
  expect((await peanuts.locator('[data-form-whatsapp]').getAttribute('href'))!.length).toBeLessThanOrEqual(1800);
  await expect(peanuts.locator('[data-form-error]')).toContainText('shortened to fit');
});

test('@preview supporting pages show confirmed FAQs and labelled empty states', async ({ page }) => {
  const pages: Array<[string, string]> = [
    ['/our-story/', 'Our story'],
    ['/faq/', 'Frequently asked questions'],
    ['/contact/', 'Contact'],
    ['/policies/', 'Ordering & policies'],
    ['/reviews/', 'Reviews'],
    ['/gallery/', 'Gallery'],
  ];
  for (const [route, heading] of pages) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  }
  await page.goto('/faq/');
  await expect(page.locator('.faq-item')).toHaveCount(5);
  await page.goto('/reviews/');
  await expect(page.locator('.review-card')).toHaveCount(1);
  await expect(page.locator('.review-card')).toContainText('Sample content');
  await expect(page.locator('.review-card')).toContainText('An approved customer review will appear here once one is supplied.');
});

test('@preview keyboard-only walkthrough keeps skip link, basket, lightbox and FAQ operable', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  const basket = page.locator('[data-basket-open]');
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  for (let index = 0; index < 8 && !(await basket.evaluate(element => element === document.activeElement)); index += 1) await page.keyboard.press('Shift+Tab');
  await expect(basket).toBeFocused();
  await page.keyboard.press('Enter');
  const basketDialog = page.locator('[data-basket-dialog]');
  await expect(basketDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(basketDialog).toBeHidden();
  await expect(basket).toBeFocused();

  await page.goto('/products/sample-crochet-featured/');
  const imageButton = page.locator('[data-open-lightbox]');
  for (let index = 0; index < 12 && !(await imageButton.evaluate(element => element === document.activeElement)); index += 1) await page.keyboard.press('Tab');
  await expect(imageButton).toBeFocused();
  await page.keyboard.press('Enter');
  const lightbox = page.locator('[data-product-lightbox]');
  await expect(lightbox).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
  await expect(imageButton).toBeFocused();

  await page.goto('/faq/');
  const firstQuestion = page.locator('.faq-item summary').first();
  for (let index = 0; index < 24 && !(await firstQuestion.evaluate(element => element === document.activeElement)); index += 1) await page.keyboard.press('Tab');
  await expect(firstQuestion).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq-item').first()).toHaveAttribute('open', '');
});
