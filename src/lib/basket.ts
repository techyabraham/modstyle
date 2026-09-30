import type { Pricing } from '../config/pricing';
import { formatNaira } from './money';

export const BASKET_STORAGE_KEY = 'mcc-basket-v1';
export const MAX_WHATSAPP_URL_LENGTH = 1800;
export interface BasketOptions { size?: string; colour?: string }
export interface BasketItem { slug: string; name: string; department: 'crochet' | 'peanuts'; options: BasketOptions; quantity: number; pricing: Pricing }
export interface DepartmentTotal { amount: number; hasQuoteItems: boolean; hasPricedItems: boolean }
export interface EnquiryFields { name?: string; deliveryArea?: string; notes?: string }
export interface EnquiryMessage { text: string; url: string; notesTruncated: boolean; linkTooLong: boolean }

export function validQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 999;
}

export function isBasketItem(value: unknown): value is BasketItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<BasketItem>;
  if (typeof item.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) return false;
  if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 200) return false;
  if (item.department !== 'crochet' && item.department !== 'peanuts') return false;
  if (!validQuantity(item.quantity) || !item.options || typeof item.options !== 'object' || Array.isArray(item.options)) return false;
  const pricing = item.pricing as Pricing | undefined;
  if (!pricing || !['fixed', 'from', 'quote'].includes(pricing.type)) return false;
  if (pricing.type !== 'quote' && (!Number.isSafeInteger(pricing.amountNaira) || pricing.amountNaira <= 0)) return false;
  return ['size', 'colour'].every(key => item.options?.[key as keyof BasketOptions] === undefined || (typeof item.options[key as keyof BasketOptions] === 'string' && (item.options[key as keyof BasketOptions] as string).length <= 100));
}

export function parseBasket(raw: string | null): BasketItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length <= 100 ? parsed.filter(isBasketItem).map(item => ({ ...item, options: { ...item.options } })) : [];
  } catch { return []; }
}

function sameSelection(a: BasketItem, b: BasketItem): boolean {
  return a.slug === b.slug && (a.options.size ?? '') === (b.options.size ?? '') && (a.options.colour ?? '') === (b.options.colour ?? '');
}

export function addBasketItem(items: BasketItem[], item: BasketItem): BasketItem[] {
  if (!isBasketItem(item)) return items;
  const existing = items.findIndex(candidate => sameSelection(candidate, item));
  if (existing < 0) return [...items, { ...item, options: { ...item.options } }];
  return items.map((candidate, index) => index === existing ? { ...candidate, quantity: Math.min(999, candidate.quantity + item.quantity) } : candidate);
}

export function updateBasketQuantity(items: BasketItem[], index: number, quantity: number): BasketItem[] {
  if (!validQuantity(quantity) || index < 0 || index >= items.length) return items;
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, quantity } : item);
}

export function basketTotals(items: BasketItem[]): Record<'crochet' | 'peanuts', DepartmentTotal> {
  const totals = { crochet: { amount: 0, hasQuoteItems: false, hasPricedItems: false }, peanuts: { amount: 0, hasQuoteItems: false, hasPricedItems: false } };
  for (const item of items) {
    const total = totals[item.department];
    if (item.pricing.type === 'fixed') { total.amount += item.pricing.amountNaira * item.quantity; total.hasPricedItems = true; }
    else if (item.pricing.type === 'from' || item.pricing.type === 'quote') total.hasQuoteItems = true;
  }
  return totals;
}

export function minimumProgress(total: DepartmentTotal, minimum: number): { status: 'below' | 'reached' | 'quote'; message: string; remaining: number } {
  if (total.hasQuoteItems) return { status: 'quote', message: "Quote items included; we'll confirm the total.", remaining: Math.max(0, minimum - total.amount) };
  if (total.amount >= minimum) return { status: 'reached', message: `${formatNaira(total.amount)} of ${formatNaira(minimum)} minimum reached.`, remaining: 0 };
  const remaining = minimum - total.amount;
  return { status: 'below', message: `${formatNaira(total.amount)} of ${formatNaira(minimum)} minimum. Add ${formatNaira(remaining)} more to reach the minimum order, or ask us about it on WhatsApp.`, remaining };
}

function itemLine(item: BasketItem, index: number): string {
  const options = [item.options.size, item.options.colour].filter(Boolean).join(', ');
  const price = item.pricing.type === 'fixed' ? `${formatNaira(item.pricing.amountNaira)} each` : 'Price to be confirmed';
  return `${index + 1}. ${item.name}${options ? ` | ${options}` : ''} | Qty ${item.quantity} | ${price}`;
}

export function buildEnquiryMessage(items: BasketItem[], fields: EnquiryFields = {}, whatsappNumber: string): EnquiryMessage {
  const totals = basketTotals(items);
  const pricedTotal = totals.crochet.amount + totals.peanuts.amount;
  const hasQuotes = totals.crochet.hasQuoteItems || totals.peanuts.hasQuoteItems;
  const header = [`Hello Modstyle Crunch And Cream,`, `I'd like to enquire about:`, '', ...items.map(itemLine), '', `Items total (excl. delivery): ${hasQuotes ? `${formatNaira(pricedTotal)} priced items; some prices to be confirmed` : formatNaira(pricedTotal)}`, fields.name?.trim() ? `Name: ${fields.name.trim()}` : '', fields.deliveryArea?.trim() ? `Delivery area: ${fields.deliveryArea.trim()}` : 'Delivery area: To be confirmed', 'Delivery: ₦3,000 to ₦10,000 depending on destination. Exact fee confirmed on WhatsApp.', `Notes: ${fields.notes?.trim() ?? ''}`, '', 'Please confirm availability, delivery fee and how to pay.'].filter((line, index, all) => !(line === '' && all[index - 1] === '' )).join('\n');
  const linkFor = (text: string) => { const url = new URL(`https://wa.me/${whatsappNumber}`); url.searchParams.set('text', text); return url.toString(); };
  let text = header;
  let url = linkFor(text);
  let notesTruncated = false;
  let notes = fields.notes?.trim() ?? '';
  if (url.length > MAX_WHATSAPP_URL_LENGTH && notes) {
    notesTruncated = true;
    const noteCharacters = Array.from(notes);
    let low = 0;
    let high = noteCharacters.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const candidate = header.replace(`Notes: ${notes}`, `Notes: ${noteCharacters.slice(0, mid).join('').trimEnd()}… (shortened to fit; please send extra detail in chat)`);
      if (linkFor(candidate).length <= MAX_WHATSAPP_URL_LENGTH) low = mid;
      else high = mid - 1;
    }
    notes = low > 0 ? `${noteCharacters.slice(0, low).join('').trimEnd()}…` : '…';
    text = header.replace(`Notes: ${fields.notes?.trim() ?? ''}`, `Notes: ${notes} (shortened to fit; please send extra detail in chat)`);
    url = linkFor(text);
  }
  const linkTooLong = url.length > MAX_WHATSAPP_URL_LENGTH;
  return { text, url, notesTruncated, linkTooLong };
}
