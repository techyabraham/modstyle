import { describe, expect, it } from 'vitest';
import { formatNaira, priceLabel } from '../../src/lib/money';
import { parseMode, isPublishable } from '../../src/lib/visibility';
import { buildWhatsAppLink } from '../../src/lib/whatsapp';
import { productSchema } from '../../src/lib/schemas';
import { inspectOutput } from '../../scripts/guard-production';
import { site } from '../../src/config/site';
import { buildComplianceChips } from '../../src/lib/compliance';
describe('visibility', () => {
  it('defaults to preview and rejects invalid modes', () => { expect(parseMode()).toBe('preview'); expect(() => parseMode('prod')).toThrow(); });
  it.each(['preview', 'production'] as const)('requires complete approved content in %s', mode => {
    expect(isPublishable(null, mode)).toBe(false);
    expect(isPublishable({ required: [' '] }, mode)).toBe(false);
    expect(isPublishable({ approved: false }, mode)).toBe(false);
    expect(isPublishable({ status: 'published', required: ['Confirmed'] }, mode)).toBe(true);
  });
  it('omits samples and drafts from production HTML data', () => {
    for (const entry of [{ sample: true }, { status: 'draft' as const }]) {
      expect(isPublishable(entry, 'production')).toBe(false);
      expect(isPublishable(entry, 'preview')).toBe(true);
    }
  });
});
it('formats the Naira union without assigning a total to quotes', () => {
  expect(formatNaira(40_000)).toBe('₦40,000');
  expect(priceLabel({ type: 'fixed', amountNaira: 30_000 })).toBe('₦30,000');
  expect(priceLabel({ type: 'from', amountNaira: 30_000 })).toBe('From ₦30,000');
  expect(priceLabel({ type: 'quote' })).toBe('Request a quote');
});
it('shows only supplied CAC and NAFDAC identifiers and associates the registered name with CAC', () => {
  expect(buildComplianceChips({ cacRcNumber: null, registeredName: null, nafdacNumber: null })).toEqual([]);
  expect(buildComplianceChips({ cacRcNumber: '123456', registeredName: 'Approved Foods Ltd', nafdacNumber: null })).toEqual([
    { label: 'CAC RC No.', value: '123456', detail: 'Approved Foods Ltd' },
  ]);
  expect(buildComplianceChips({ cacRcNumber: ' ', registeredName: 'Unassociated name', nafdacNumber: 'NAF-123' })).toEqual([
    { label: 'NAFDAC No.', value: 'NAF-123', detail: null },
  ]);
});
it.each(["Line one\n₦40,000 & it's ready 😀", 'A'.repeat(3000)])('round-trips WhatsApp text', message => {
  expect(new URL(buildWhatsAppLink(site.contact.whatsapp, message)).searchParams.get('text')).toBe(message);
});
const product = { slug: 'sample-crochet-featured', name: 'Sample', summary: 'Sample', description: 'Sample', status: 'published', sample: true, department: 'crochet', category: 'Sample', pricing: { type: 'fixed', amountNaira: 40_000 } };
it('restricts the special price to one assigned product', () => {
  expect(productSchema.safeParse(product).success).toBe(true);
  expect(productSchema.safeParse({ ...product, slug: 'another-product' }).success).toBe(false);
  expect(productSchema.safeParse({ ...product, sample: false }).success).toBe(false);
});
it('rejects cross-department fields, missing alt and invalid slugs', () => {
  expect(productSchema.safeParse({ ...product, ingredients: 'unknown' }).success).toBe(false);
  expect(productSchema.safeParse({ ...product, images: [{ src: '/image.jpg', alt: '' }] }).success).toBe(false);
  expect(productSchema.safeParse({ ...product, slug: 'Bad Slug' }).success).toBe(false);
});
it.each(['Sample content', 'TBD', 'Lorem', 'placeholder', '1234567890', 'sample-item'])('guard rejects %s', text => {
  expect(inspectOutput('index.html', text, ['sample-item']).length).toBeGreaterThan(0);
});
it('guard rejects private filenames and exempts only the exact WhatsApp number', () => {
  expect(inspectOutput('private-receipt.png', '').length).toBeGreaterThan(0);
  expect(inspectOutput('index.html', `https://wa.me/${site.contact.whatsapp}`)).toEqual([]);
  expect(inspectOutput('index.html', `https://wa.me/${site.contact.whatsapp} 0123456789`).length).toBeGreaterThan(0);
});
