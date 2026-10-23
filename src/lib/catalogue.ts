import type { CollectionEntry } from 'astro:content';
import type { SiteMode } from './visibility';
import { isPublishable } from './visibility';

export type ProductEntry = CollectionEntry<'products'>;
export type GalleryEntry = CollectionEntry<'gallery'>;
export type FaqEntry = CollectionEntry<'faqs'>;
export type ReviewEntry = CollectionEntry<'reviews'>;

export function visibleProducts(entries: ProductEntry[], mode: SiteMode, department?: 'crochet' | 'peanuts'): ProductEntry[] {
  return entries
    .filter(entry => !entry.data.sample)
    .filter(entry => isPublishable({
      ...entry.data,
      required: [entry.data.slug, entry.data.name, entry.data.summary, entry.data.description],
    }, mode))
    .filter(entry => !department || entry.data.department === department)
    .sort((left, right) => left.data.name.localeCompare(right.data.name));
}

export function visibleGallery(entries: GalleryEntry[], mode: SiteMode): GalleryEntry[] {
  const visible = entries
    .filter(entry => !entry.data.sample)
    .filter(entry => isPublishable({ ...entry.data, required: [entry.data.slug, entry.data.image.alt] }, mode));
  const byDepartment = {
    crochet: visible.filter(entry => entry.data.department === 'crochet').sort((left, right) => left.data.slug.localeCompare(right.data.slug)),
    peanuts: visible.filter(entry => entry.data.department === 'peanuts').sort((left, right) => left.data.slug.localeCompare(right.data.slug)),
  };
  const ordered: GalleryEntry[] = [];
  for (let index = 0; index < Math.max(byDepartment.crochet.length, byDepartment.peanuts.length); index += 1) {
    const crochetEntry = byDepartment.crochet[index];
    const peanutsEntry = byDepartment.peanuts[index];
    if (crochetEntry) ordered.push(crochetEntry);
    if (peanutsEntry) ordered.push(peanutsEntry);
  }
  return ordered;
}

export function visibleFaqs(entries: FaqEntry[], mode: SiteMode): FaqEntry[] {
  return entries
    .filter(entry => isPublishable({ ...entry.data, required: [entry.data.slug, entry.data.question, entry.data.answer] }, mode))
    .sort((left, right) => left.data.order - right.data.order || left.data.question.localeCompare(right.data.question));
}

export function visibleReviews(entries: ReviewEntry[], mode: SiteMode): ReviewEntry[] {
  return entries
    .filter(entry => !entry.data.sample)
    .filter(entry => isPublishable({ ...entry.data, required: [entry.data.slug, entry.data.name, entry.data.text] }, mode))
    .sort((left, right) => left.data.name.localeCompare(right.data.name));
}
