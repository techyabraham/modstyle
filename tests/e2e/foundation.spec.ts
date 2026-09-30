import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('production shell is usable and exposes only approved facts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stitched with love. Packed with crunch.');
  const link = page.getByRole('link', { name: 'Start an enquiry' });
  const url = new URL((await link.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.searchParams.get('text')).toContain("I'd like to ask about crochet or bulk peanuts");
  await expect(page.locator('body')).not.toContainText(/Sample content|oluwarewaa|R__pierre|2349151715923|40,000/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});
test('WhatsApp remains available without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(new URL('/', testInfo.project.use.baseURL as string).toString());
  await expect(page.getByRole('link', { name: 'Start an enquiry' })).toHaveAttribute('href', /^https:\/\/wa.me\//);
  await context.close();
});
test('production indexing and canonical defaults', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  if (!process.env.SITE_URL) await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  expect(await (await request.get('/robots.txt')).text()).toContain('Allow: /');
});
test('@a11y foundation has no serious or critical violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});
test('both web fonts render every glyph in ₦40,000 without fallback', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    for (const family of ['Inter', 'Fraunces']) {
      const element = document.createElement('span');
      element.id = `glyph-${family.toLowerCase()}`;
      element.textContent = '₦40,000';
      element.style.font = `600 48px ${family}`;
      document.body.append(element);
      await document.fonts.load(`600 48px ${family}`, element.textContent);
    }
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const domDocument = await cdp.send('DOM.getDocument');
  for (const family of ['inter', 'fraunces']) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: domDocument.root.nodeId, selector: `#glyph-${family}` });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts).toHaveLength(1);
    expect(fonts[0]?.isCustomFont).toBe(true);
    expect(fonts[0]?.glyphCount).toBe(7);
    expect(fonts[0]?.familyName.toLowerCase()).toContain(family);
  }
  const fontRequests = await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.includes('.woff2')).length);
  expect(fontRequests).toBeLessThanOrEqual(2);
});
