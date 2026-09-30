export const pricing = {
  minimumPerDepartment: 30_000,
  minimumBasis: 'items-subtotal' as const,
  deliveryMin: 3_000,
  deliveryMax: 10_000,
  deliveryText: 'Delivery ₦3,000 to ₦10,000 depending on destination. Exact fee confirmed on WhatsApp.',
  featuredPriceProductSlug: null as string | null,
  sampleFeaturedPriceProductSlug: 'sample-crochet-featured',
};
export type Pricing =
  | { type: 'fixed'; amountNaira: number }
  | { type: 'from'; amountNaira: number }
  | { type: 'quote' };
