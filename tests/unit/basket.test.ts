import { describe, expect, it } from 'vitest';
import { addBasketItem, basketTotals, buildEnquiryMessage, minimumProgress, parseBasket, updateBasketQuantity, validQuantity, type BasketItem } from '../../src/lib/basket';

const crochet: BasketItem = { slug: 'tote', name: 'Crochet Tote', department: 'crochet', options: { size: 'Medium', colour: 'Forest' }, quantity: 2, pricing: { type: 'fixed', amountNaira: 15000 } };
const peanut: BasketItem = { slug: 'peanuts', name: 'Bulk Peanuts', department: 'peanuts', options: {}, quantity: 4, pricing: { type: 'quote' } };

describe('enquiry basket', () => {
  it('validates quantity as an integer from 1 to 999', () => {
    for (const value of [1, 4, 999]) expect(validQuantity(value)).toBe(true);
    for (const value of [0, -1, 1000, 1.5, Number.NaN, '2', null]) expect(validQuantity(value)).toBe(false);
  });

  it('discards corrupt saved data and invalid entries', () => {
    expect(parseBasket('{')).toEqual([]);
    expect(parseBasket(JSON.stringify([crochet, { ...crochet, quantity: 1.2 }]))).toEqual([crochet]);
  });

  it('merges matching selections, preserves different options and caps quantity', () => {
    expect(addBasketItem([crochet], { ...crochet, quantity: 999 })[0]?.quantity).toBe(999);
    expect(addBasketItem([crochet], { ...crochet, options: { size: 'Large' } })).toHaveLength(2);
  });

  it('calculates fixed totals per department and excludes quote/from prices', () => {
    const totals = basketTotals([crochet, peanut, { ...crochet, slug: 'from-item', pricing: { type: 'from', amountNaira: 2000 } }]);
    expect(totals.crochet).toEqual({ amount: 30000, hasQuoteItems: true, hasPricedItems: true });
    expect(totals.peanuts).toEqual({ amount: 0, hasQuoteItems: true, hasPricedItems: false });
    expect(minimumProgress(totals.crochet, 30000).status).toBe('quote');
    expect(minimumProgress({ amount: 12000, hasQuoteItems: false, hasPricedItems: true }, 30000).remaining).toBe(18000);
    expect(minimumProgress({ amount: 30000, hasQuoteItems: false, hasPricedItems: true }, 30000).status).toBe('reached');
  });

  it('builds an encoded WhatsApp enquiry with departments, options and separate delivery', () => {
    const enquiry = buildEnquiryMessage([crochet, peanut], { deliveryArea: 'Ikeja & GRA', notes: "It's for Mum\nplease call" }, '2349151715923');
    const url = new URL(enquiry.url);
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe('/2349151715923');
    expect(url.searchParams.get('text')).toContain('₦30,000');
    expect(url.searchParams.get('text')).toContain('Medium, Forest');
    expect(url.searchParams.get('text')).toContain('Price to be confirmed');
    expect(url.searchParams.get('text')).toContain('Ikeja & GRA');
    expect(url.searchParams.get('text')).toContain('Delivery: ₦3,000 to ₦10,000');
    expect(enquiry.linkTooLong).toBe(false);
  });

  it('shortens an overlong notes field while keeping a safe WhatsApp URL', () => {
    const enquiry = buildEnquiryMessage([crochet], { notes: 'extra detail '.repeat(500) }, '2349151715923');
    expect(enquiry.notesTruncated).toBe(true);
    expect(enquiry.linkTooLong).toBe(false);
    expect(enquiry.url.length).toBeLessThanOrEqual(1800);
    expect(enquiry.text).toContain('shortened to fit');
  });

  it('generates a generic enquiry and leaves extra detail visible when the cart itself is too long', () => {
    const tooMany = Array.from({ length: 100 }, (_, index) => ({ ...crochet, slug: `tote-${index}`, name: `Handmade Crochet Tote ${index} ${'with a long description '.repeat(8)}` }));
    const enquiry = buildEnquiryMessage(tooMany, { notes: '' }, '2349151715923');
    expect(enquiry.linkTooLong).toBe(true);
  });

  it('updates only valid quantities', () => {
    expect(updateBasketQuantity([crochet], 0, 3)[0]?.quantity).toBe(3);
    expect(updateBasketQuantity([crochet], 0, 1.2)).toEqual([crochet]);
  });
});
