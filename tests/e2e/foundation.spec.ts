import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('production shell is usable and exposes only approved facts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stitched with love. Packed with crunch.');
  await expect(page.getByRole('link', { name: 'Explore crochet' })).toHaveAttribute('href', '/crochet/');
  await expect(page.getByRole('link', { name: 'Explore peanuts' })).toHaveAttribute('href', '/peanuts/');
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
  await page.goto(new URL('/crochet/', testInfo.project.use.baseURL as string).toString());
  await expect(page.locator('[data-quick-enquiry="crochet"] [data-form-whatsapp]')).toHaveAttribute('href', /^https:\/\/wa.me\//);
  await expect(page.locator('[data-basket-open]')).toHaveAttribute('href', /^https:\/\/wa.me\//);
  await context.close();
});
test('production indexing and canonical defaults', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  if (!process.env.SITE_URL) await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  expect(await (await request.get('/robots.txt')).text()).toContain('Allow: /');
});
test('production hides unset compliance claims', async ({ page }) => {
  await page.goto('/peanuts/');
  await expect(page.getByRole('list', { name: 'Business registration details' })).toHaveCount(0);
});
test('production catalogue omits samples and publishes the crochet and peanut product listings', async ({ request }) => {
  const crochet = await request.get('/crochet/');
  expect(crochet.ok()).toBe(true);
  const crochetHtml = await crochet.text();
  expect(crochetHtml).not.toMatch(/Sample content|sample-crochet-featured|₦40,000/);
  expect(crochetHtml.match(/<article\b[^>]*data-product-card/g)).toHaveLength(4);
  expect(crochetHtml).toContain('Burgundy &amp; Cream Crochet Set');
  expect(crochetHtml).toContain('From ₦32,000');
  expect(crochetHtml).toContain('srcset=');
  const peanuts = await request.get('/peanuts/');
  expect(peanuts.ok()).toBe(true);
  const peanutHtml = await peanuts.text();
  expect(peanutHtml.match(/<article\b[^>]*data-product-card/g)).toHaveLength(16);
  expect(peanutHtml).toContain('Peanut Crunch — Bulk Pouch');
  expect(peanutHtml).toContain('Golden Peanut Bites — Container');
  expect((await request.get('/products/sample-crochet-featured/')).status()).toBe(404);
  expect((await request.get('/products/burgundy-cream-crochet-set/')).ok()).toBe(true);
  expect((await request.get('/products/peanut-crunch-bulk-pouch/')).ok()).toBe(true);
  const gallery = await request.get('/gallery/');
  expect(gallery.ok()).toBe(true);
  expect((await gallery.text()).match(/<button\b[^>]*data-gallery-item/g)).toHaveLength(4);
  expect((await request.get('/images/products/crochet/burgundy-cream-crochet-set-240.webp')).ok()).toBe(true);
  expect((await request.get('/images/products/peanuts/peanut-crunch-bulk-pouch.webp')).ok()).toBe(true);
  expect((await request.get('/reviews/')).status()).toBe(404);
});
test('supporting pages, sitemap and social metadata expose only confirmed production content', async ({ page, request }) => {
  for (const route of ['/our-story/', '/faq/', '/contact/', '/policies/']) {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    if (process.env.SITE_URL) await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new URL(route, process.env.SITE_URL).href);
  }
  await page.goto('/contact/');
  await expect(page.locator('body')).not.toContainText(/oluwarewaa|R__pierre|2349151715923/);
  await page.goto('/faq/');
  const faq = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? '{}')));
  expect(faq.map((item: { '@type'?: string }) => item['@type'])).toContain('FAQPage');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/our-story/');
  expect(sitemap).toContain('/faq/');
  expect(sitemap).toContain('/policies/');
  expect(sitemap).toContain('/products/peanut-crunch-bulk-pouch/');
  expect(sitemap).toContain('/gallery/');
  expect(sitemap).toContain('/products/burgundy-cream-crochet-set/');
  expect(sitemap).not.toMatch(/sample-|\/reviews\/|invalid\.example/);
  const robots = await (await request.get('/robots.txt')).text();
  if (process.env.SITE_URL) expect(robots).toContain(new URL('/sitemap.xml', process.env.SITE_URL).href);
  const image = await request.get('/social-card.png');
  expect(image.ok()).toBe(true);
  const png = await image.body();
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  expect((await request.get('/favicon.svg')).ok()).toBe(true);
  const manifest = await (await request.get('/site.webmanifest')).json();
  expect(manifest.name).toBe('Modstyle Crunch And Cream');
  expect(manifest.icons[0].src).toBe('/favicon.svg');
});
test('custom not-found page provides working recovery links', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page isn’t here.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore crochet' })).toHaveAttribute('href', '/crochet/');
  await expect(page.getByRole('link', { name: 'Explore peanuts' })).toHaveAttribute('href', '/peanuts/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('every production route has no horizontal overflow or dead internal links', async ({ page, request }) => {
  const routes = ['/', '/crochet/', '/peanuts/', '/gallery/', '/our-story/', '/faq/', '/contact/', '/policies/'];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll(anchors => anchors.map(anchor => (anchor as HTMLAnchorElement).href));
    for (const href of new Set(hrefs)) {
      const linkResponse = await request.get(href);
      expect(linkResponse.status(), `${route} links to ${href}`).toBe(200);
    }
  }
});
test('reduced-motion preference disables continuous movement and page scrolling animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('.home-ribbon__track').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});
test('@a11y foundation has no serious or critical violations', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.home-departments', '.home-ordering', '.home-facts', '.home-faq', '.home-last-call']) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await expect.poll(() => section.evaluate(element => element.checkVisibility({ contentVisibilityAuto: true }))).toBe(true);
    await section.evaluate(element => { (element as HTMLElement).style.contentVisibility = 'visible'; });
  }
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});
test('@a11y department enquiry forms and the open basket have no serious or critical violations', async ({ page }) => {
  const axe = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  for (const route of ['/crochet/', '/peanuts/', '/gallery/', '/our-story/', '/faq/', '/contact/', '/policies/']) {
    await page.goto(route);
    const results = await axe();
    expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  }
  await page.goto('/');
  await page.getByRole('link', { name: /Open enquiry basket/ }).click();
  const basketResults = await axe();
  expect(basketResults.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
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
