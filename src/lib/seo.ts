import { site } from '../config/site';

type FaqItem = { question: string; answer: string };
type ProductSeoInput = {
  status: 'draft' | 'published';
  sample: boolean;
  name: string;
  summary: string;
  slug: string;
  pricing: { type: 'fixed'; amountNaira: number } | { type: 'from'; amountNaira: number } | { type: 'quote' };
};

export function localBusinessJsonLd(siteUrl?: string) {
  const base = siteUrl ? new URL(siteUrl) : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': base ? new URL('/#business', base).href : undefined,
    name: site.brand.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressCountry: 'NG',
    },
    url: base?.href,
    telephone: site.contact.phoneApproved ? `+${site.contact.whatsapp}` : undefined,
    sameAs: site.instagram.verified ? [`https://www.instagram.com/${site.instagram.handle}/`] : undefined,
  };
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function productJsonLd(product: ProductSeoInput, siteUrl?: string) {
  if (product.status !== 'published' || product.sample || product.pricing.type !== 'fixed') return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': siteUrl ? new URL(`/products/${encodeURIComponent(product.slug)}/#product`, siteUrl).href : undefined,
    name: product.name,
    description: product.summary,
    brand: { '@type': 'Brand', name: site.brand.name },
    offers: { '@type': 'Offer', priceCurrency: 'NGN', price: product.pricing.amountNaira },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
