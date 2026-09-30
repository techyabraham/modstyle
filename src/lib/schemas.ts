import { z } from 'astro/zod';
import { pricing } from '../config/pricing';
const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a unique kebab-case slug');
const common = { slug, status: z.enum(['draft', 'published']), sample: z.boolean().default(false) };
export const priceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('fixed'), amountNaira: z.number().int().positive() }).strict(),
  z.object({ type: z.literal('from'), amountNaira: z.number().int().positive() }).strict(),
  z.object({ type: z.literal('quote') }).strict(),
]);
const image = z.object({ src: text, alt: text });
const product = { ...common, name: text, summary: text, description: text, pricing: priceSchema, images: z.array(image).default([]), leadTime: text.nullish() };
export const productSchema = z.discriminatedUnion('department', [
  z.object({ ...product, department: z.literal('crochet'), category: text, intendedWearer: text.nullish(), sizes: z.array(text).default([]), colours: z.array(z.object({ name: text, hex: text.regex(/^#[a-fA-F0-9]{6}$/) })).default([]), materials: text.nullish(), care: text.nullish() }).strict(),
  z.object({ ...product, department: z.literal('peanuts'), variety: text.nullish(), packSize: text.nullish(), ingredients: text.nullish(), allergens: text.nullish(), storage: text.nullish(), shelfLife: text.nullish() }).strict(),
]).superRefine((value, ctx) => {
  if (value.pricing.type !== 'quote' && value.pricing.amountNaira === 40_000) {
    const assigned = value.sample ? pricing.sampleFeaturedPriceProductSlug : pricing.featuredPriceProductSlug;
    if (value.slug !== assigned || (value.sample && value.department !== 'crochet')) ctx.addIssue({ code: 'custom', path: ['pricing'], message: '₦40,000 may only belong to the configured featured product' });
  }
});
export const faqSchema = z.object({ ...common, question: text, answer: text, group: z.enum(['Ordering', 'Minimums and pricing', 'Payment', 'Delivery', 'Custom crochet', 'Peanuts and bulk']), order: z.number().int().default(0) }).strict();
export const reviewSchema = z.object({ ...common, approved: z.boolean().default(false), name: text, text, product: text.nullish(), photo: image.nullish() }).strict();
export const gallerySchema = z.object({ ...common, department: z.enum(['crochet', 'peanuts']), image, caption: text.nullish() }).strict();
