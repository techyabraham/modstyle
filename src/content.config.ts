import { defineCollection } from 'astro:content';
import { localLoader } from './lib/local-loader';
import { productSchema, faqSchema, reviewSchema, gallerySchema } from './lib/schemas';
export const collections = {
  products: defineCollection({ loader: localLoader('products', '.json'), schema: productSchema }),
  faqs: defineCollection({ loader: localLoader('faqs', '.md'), schema: faqSchema }),
  reviews: defineCollection({ loader: localLoader('reviews', '.json'), schema: reviewSchema }),
  gallery: defineCollection({ loader: localLoader('gallery', '.json'), schema: gallerySchema }),
};
