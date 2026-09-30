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
