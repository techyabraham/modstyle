import type { CollectionEntry } from 'astro:content';
import type { SiteMode } from './visibility';
import { isPublishable } from './visibility';

export type ProductEntry = CollectionEntry<'products'>;
export type GalleryEntry = CollectionEntry<'gallery'>;

export function visibleProducts(entries: ProductEntry[], mode: SiteMode, department?: 'crochet' | 'peanuts'): ProductEntry[] {
  return entries
    .filter(entry => isPublishable({
      ...entry.data,
      required: [entry.data.slug, entry.data.name, entry.data.summary, entry.data.description],
    }, mode))
    .filter(entry => !department || entry.data.department === department)
    .sort((left, right) => left.data.name.localeCompare(right.data.name));
}

export function visibleGallery(entries: GalleryEntry[], mode: SiteMode): GalleryEntry[] {
  return entries
    .filter(entry => isPublishable({ ...entry.data, required: [entry.data.slug, entry.data.image.alt] }, mode))
    .sort((left, right) => left.data.slug.localeCompare(right.data.slug));
}

export function sampleArtVariant(slug: string, department: 'crochet' | 'peanuts'): 'yarn' | 'granny' | 'top' | 'tote' | 'beanie' | 'peanuts' | 'sack' {
  const variants: Record<string, 'yarn' | 'granny' | 'top' | 'tote' | 'beanie' | 'peanuts' | 'sack'> = {
    'sample-granny-tote': 'granny',
    'sample-bucket-hat': 'beanie',
    'sample-crochet-top': 'top',
    'sample-beanie': 'beanie',
    'sample-flower-cardigan': 'granny',
    'sample-mini-bag': 'tote',
    'sample-market-tote': 'tote',
    'sample-crochet-featured': 'yarn',
    'sample-peanuts-01': 'peanuts',
    'sample-peanuts-02': 'sack',
    'sample-peanuts-03': 'peanuts',
  };
  return variants[slug] ?? (department === 'peanuts' ? 'peanuts' : 'yarn');
}
