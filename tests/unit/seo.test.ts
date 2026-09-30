import { describe, expect, it } from 'vitest';
import { faqPageJsonLd, localBusinessJsonLd, productJsonLd } from '../../src/lib/seo';

describe('search and sharing metadata', () => {
  it('limits business markup to confirmed location and approved public details', () => {
    const data = localBusinessJsonLd('https://example.test') as Record<string, unknown>;
    expect(data['@type']).toBe('LocalBusiness');
    expect(data.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' });
    expect(data.telephone).toBeUndefined();
    expect(data.sameAs).toBeUndefined();
  });

  it('creates offer markup only for published fixed-price non-sample products', () => {
    const product = { status: 'published' as const, sample: false, name: 'Approved item', summary: 'Confirmed description', slug: 'approved-item', pricing: { type: 'fixed' as const, amountNaira: 40000 } };
    expect(productJsonLd(product, 'https://example.test')).toMatchObject({
      '@type': 'Product',
      '@id': 'https://example.test/products/approved-item/#product',
      offers: { '@type': 'Offer', priceCurrency: 'NGN', price: 40000 },
    });
    expect(productJsonLd({ ...product, sample: true })).toBeUndefined();
    expect(productJsonLd({ ...product, pricing: { type: 'from', amountNaira: 1000 } })).toBeUndefined();
    expect(productJsonLd({ ...product, pricing: { type: 'quote' } })).toBeUndefined();
  });

  it('does not invent review markup for FAQ structured data', () => {
    const data = faqPageJsonLd([{ question: 'How do I pay?', answer: 'By bank transfer.' }]);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity[0]).toEqual({ '@type': 'Question', name: 'How do I pay?', acceptedAnswer: { '@type': 'Answer', text: 'By bank transfer.' } });
    expect(JSON.stringify(data)).not.toMatch(/rating|review/i);
  });
});
